
import { GoogleGenAI, Type } from "@google/genai";
import { DLLInput, GeneratedDLL } from "../types";

export const generateDLLContent = async (input: DLLInput): Promise<GeneratedDLL> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const textPrompt = `
    Generate a highly detailed DepEd K-12 Daily Lesson Log (DLL) for a full week (Monday to Friday) based on the following input:
    - Grade Level: ${input.gradeLevel}
    - Learning Area (Subject): ${input.learningArea}
    - Quarter: ${input.quarter}
    - Week: ${input.week}
    - Weekly Competency: ${input.competency}
    - Sources Provided: ${input.sources}
    - TEXT EXEMPLAR: ${input.lessonExemplar || "No specific text exemplar provided."}
    - TEACHER'S SPECIFIC PROMPTS: ${input.customInstructions || "No additional specific prompts provided."}

    CRITICAL FORMATTING RULES:
    1. DAILY COMPETENCIES: You MUST generate a specific learning competency and description for EACH DAY (Monday-Friday).
    2. TOPICS: Provide a specific topic name for EACH DAY.
    3. PROCEDURES: Provide concrete, detailed content for every procedure step (A to J) for every single day.
    4. LISTS & BULLETS: For objectives, steps, or questions, use CLEAR NEWLINES. For example:
       1. First item
       2. Second item
    5. EVALUATION & ANSWER KEY: In 'Evaluating Learning', provide actual numbered questions (1., 2., 3., etc.). You MUST ALSO generate a corresponding 'Answer Key' for these questions.
    6. REFERENCE UTILIZATION: Heavily use the provided LESSON EXEMPLAR or ATTACHED FILE as the primary source of truth for technical depth.
    7. Return valid JSON only.
  `;

  const dayPlanSchema = {
    type: Type.OBJECT,
    properties: {
      competencyDesc: { type: Type.STRING, description: "The specific description of the competency for this day." },
      competencyCode: { type: Type.STRING, description: "The K-12 competency code (e.g., S7MT-Ia-1)." },
      topic: { type: Type.STRING, description: "The specific topic or lesson title for this day." },
      objectives: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Specific behavioral objectives for this day."
      },
      review: { type: Type.STRING, description: "Review of previous lesson or motivation." },
      purpose: { type: Type.STRING, description: "Establishing a purpose for the lesson." },
      examples: { type: Type.STRING, description: "Presenting examples/instances of new lesson." },
      discussion1: { type: Type.STRING, description: "Discussing new concepts and practicing new skills #1." },
      discussion2: { type: Type.STRING, description: "Discussing new concepts and practicing new skills #2." },
      mastery: { type: Type.STRING, description: "Developing mastery (Leads to Formative Assessment)." },
      application: { type: Type.STRING, description: "Finding practical applications of concepts and skills in daily living." },
      generalization: { type: Type.STRING, description: "Making generalizations and abstractions about the lesson." },
      evaluation: { type: Type.STRING, description: "Evaluating Learning (Actual quiz content)." },
      answerKey: { type: Type.STRING, description: "The answer key for the evaluation questions." },
      remediation: { type: Type.STRING, description: "Additional activities for application or remediation." }
    },
    required: ["competencyDesc", "competencyCode", "topic", "objectives", "review", "purpose", "examples", "discussion1", "discussion2", "mastery", "application", "generalization", "evaluation", "answerKey", "remediation"]
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

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 15000 },
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
  if (!text) throw new Error("No response generated from AI.");
  
  return JSON.parse(text.trim());
};
