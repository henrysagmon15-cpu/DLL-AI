export interface DLLInput {
  school: string;
  gradeLevel: string;
  teacher: string;
  teacherPosition: string;
  learningArea: string;
  teachingDates: string;
  teachingTime: string;
  quarter: string;
  week: string;
  checkerName: string;
  checkerDesignation: string;
  competency: string;
  contentStandard: string;
  performanceStandard: string;
  sources: string;
  customInstructions: string;
  lessonExemplar: string;
  logoFile?: {
    data: string;
    mimeType: string;
    name: string;
  };
  exemplarFile?: {
    data: string;
    mimeType: string;
    name: string;
  };
}

export interface DayPlan {
  competencyDesc: string;
  competencyCode: string;
  topic: string;
  objectives: string[];
  review: string;
  purpose: string;
  examples: string;
  discussion1: string;
  discussion2: string;
  mastery: string;
  application: string;
  generalization: string;
  evaluation: string;
  answerKey: string;
  remediation: string;
  remarks: string;
}

export interface GeneratedDLL {
  contentStandards: string;
  performanceStandards: string;
  references: {
    teacherGuide: string;
    learnerMaterial: string;
    textbook: string[];
    additionalResources: string[];
    otherResources: string;
  };
  dailyPlans: {
    monday: DayPlan;
    tuesday: DayPlan;
    wednesday: DayPlan;
    thursday: DayPlan;
    friday: DayPlan;
  };
}