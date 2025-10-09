export interface GenerationRequest {
  gradeLevel: string;        // "K", "1st", "2nd", etc.
  subjectType: string;       // "Mathematics", "ELA", "Science", "Social Studies"
  subject: string;           // "Addition", "Reading Comprehension", etc.
  state: string;             // "CA", "TX", "NY", etc.
  mainTopic: string;         // "Basic Addition"
  subTopic: string;          // "Single Digit Addition"
  template: string;          // "ThreeQuestionTemplate"
}

export interface ResourceData {
  level: string;             // "Elementary School", "Middle School", "High School"
  grade: string;             // "K", "1st", "2nd", etc.
  subject: string;           // "Mathematics", "English Language Arts", "Science", "Social Studies"
  topic: string;             // "Addition & Subtraction within 20", "Reading Comprehension", etc.
  resourceType: string;      // "worksheet", "activity", "assessment", etc.
  difficulty?: number;       // 1 (easiest) to 5 (hardest)
}

export interface JSONTemplate {
  id: string;
  name: string;
  description: string;
  placeholders: string[];
}

export interface GeneratedContent {
  [key: string]: string | string[];
}

export interface GenerationResponse {
  content: GeneratedContent;
  metadata: {
    gradeLevel: string;
    subject: string;
    generatedAt: string;
    requestId: string;
  };
}

export interface OpenAIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 