import { JSONTemplate } from './types';

export const TEMPLATES: Record<string, JSONTemplate> = {
  WorksheetTemplate: {
    id: "WorksheetTemplate",
    name: "Worksheet - 5 Questions",
    description: "Worksheet with 5 questions and an answer key",
    placeholders: [
      "worksheetTitle",
      "instructions", 
      "question1", "question2", "question3", "question4", "question5",
      "answer1", "answer2", "answer3", "answer4", "answer5"
    ]
  }
};

export function getTemplate(templateId: string): JSONTemplate | null {
  return TEMPLATES[templateId] || null;
}

export function getAllTemplates(): JSONTemplate[] {
  return Object.values(TEMPLATES);
}

export function addTemplate(id: string, template: JSONTemplate): void {
  TEMPLATES[id] = template;
} 