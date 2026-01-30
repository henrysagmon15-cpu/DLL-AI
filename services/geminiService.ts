import { GoogleGenAI, Type } from "@google/genai";
import { DLLInput, GeneratedDLL } from "../types";

export const generateDLLContent = async (input: DLLInput): Promise<GeneratedDLL> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const textPrompt = `
    Generate a professional and detailed DepEd K-12 Daily Lesson Log (DLL) for a full week (Monday to Friday).

    PRIMARY INSTRUCTIONS:
    1. EXTRACATION FIRST: If an Exemplar/Reference (Text: "${input.lessonExemplar || "None"}" or attached file) is provided, prioritize extracting the Learning Competencies and Objectives directly from it.
    2. MANDATORY COMPETENCY: If NO exemplar/file is provided, use this manually provided competency: "${input.competency}".
    
    CURRICULUM STANDARDS OVERRIDE:
    3. CONTENT STANDARD: If the user provided this Content Standard: "${input.contentStandard || ""}", USE IT EXACTLY. If empty, generate a suitable one based on the competency/exemplar.
    4. PERFORMANCE STANDARD: If the user provided this Performance Standard: "${input.performanceStandard || ""}", USE IT EXACTLY. If empty, generate a suitable one based on the competency/exemplar.

    PROCEDURAL CONSTRAINTS:
    5. OBJECTIVES LIMIT: Provide EXACTLY 1 to 2 learning objectives per day. These objectives must be derived from the competency.
    6. 45-MINUTE FEASIBILITY: Ensure that the objectives and the entire procedure (Review to Evaluation) can be realistically finished within a 45-minute lesson.
    7. LOGICAL SEQUENCE: The 5-day flow must be a progressive sequence of the same learning competency or set of related competencies.

    STRICT ITEM COUNT REQUIREMENTS:
    8. EVALUATION (Step I): You MUST provide EXACTLY 5 specific evaluation items (e.g., Multiple Choice, Fill in the Blanks, or Identification) for EACH day.
    9. ANSWER KEY: You MUST provide EXACTLY 5 answers corresponding to the 5 evaluation items for EACH day.
    10. FORMATIVE ASSESSMENT (Step F): This MUST be a concrete activity or set of 2-3 questions that check for understanding BEFORE the final evaluation. It should not be vague.

    PEDAGOGICAL STRUCTURE:
    - PROCEDURES (A-J): Detailed daily steps. 
    - REMARKS: The 'remarks' field for each day must be an EMPTY STRING (""). Leave it completely blank.

    METADATA:
    - School: ${input.school}
    - Teacher: ${input.teacher} (${input.teacherPosition})
    - Grade Level: ${input.gradeLevel}
    - Learning Area: ${input.learningArea}
    - Quarter: ${input.quarter}
    - Week: ${input.week}
    - Custom Instructions: ${input.customInstructions}

    Return the result as a strictly valid JSON object.
  `;

  const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
      competencyDesc: { type: Type.STRING, description: "The full description of the DepEd competency." },
      competencyCode: { type: Type.STRING, description: "The code like S7MT-Ia-1." },
      topic: { type: Type.STRING, description: "Short title of the daily lesson." },
      objectives: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Exactly 1 or 2 specific, measurable objectives feasible for a 45-minute lesson."
      },
      review: { type: Type.STRING },
      purpose: { type: Type.STRING },
      examples: { type: Type.STRING },
      discussion1: { type: Type.STRING },
      discussion2: { type: Type.STRING },
      mastery: { type: Type.STRING, description: "A concrete Formative Assessment activity or set of questions." },
      application: { type: Type.STRING },
      generalization: { type: Type.STRING },
      evaluation: { type: Type.STRING, description: "EXACTLY 5 quiz questions or tasks." },
      answerKey: { type: Type.STRING, description: "EXACTLY 5 answers corresponding to the evaluation items." },
      remediation: { type: Type.STRING },
      remarks: { type: Type.STRING, description: "Must be an empty string." }
    },
    required: ["competencyDesc", "competencyCode", "topic", "objectives", "review", "purpose", "examples", "discussion1", "discussion2", "mastery", "application", "generalization", "evaluation", "answerKey", "remediation", "remarks"]
  };

  const parts: any[] = [{ text: textPrompt }];
  
  if (input.exemplarFile) {
    parts.push({
      inlineData: {
        data: input.exemplarFile.data,
        mimeType: input.exemplarFile.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contentStandards: { type: Type.STRING },
            performanceStandards: { type: Type.STRING },
            references: {
              type: Type.OBJECT,
              properties: {
                teacherGuide: { type: Type.STRING },
                learnerMaterial: { type: Type.STRING },
                textbook: { type: Type.ARRAY, items: { type: Type.STRING } },
                additionalResources: { type: Type.ARRAY, items: { type: Type.STRING } },
                otherResources: { type: Type.STRING }
              },
              required: ["teacherGuide", "learnerMaterial", "textbook", "additionalResources", "otherResources"]
            },
            dailyPlans: {
              type: Type.OBJECT,
              properties: {
                monday: dayPlanSchema,
                tuesday: dayPlanSchema,
                wednesday: dayPlanSchema,
                thursday: dayPlanSchema,
                friday: dayPlanSchema
              },
              required: ["monday", "tuesday", "wednesday", "thursday", "friday"]
            }
          },
          required: ["contentStandards", "performanceStandards", "references", "dailyPlans"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Received empty text from Gemini.");
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message === "API_KEY_MISSING") throw error;
    throw new Error(`Architectural Failure: ${error.message || "Unknown error occurred during DLL generation."}`);
  }
};