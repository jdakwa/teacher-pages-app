'use server';

import { GenerationRequest, GenerationResponse, GeneratedContent, ResourceData } from '@/lib/teacherpages/types';
import { validateGenerationRequest, sanitizeGenerationRequest } from '@/lib/teacherpages/validators';
import { generatePrompt, generatePromptFromResourceData } from '@/lib/teacherpages/promptGenerator';
import { callOpenAIWithRetry, callOpenAIWithResourceDataAndRetry } from '@/lib/teacherpages/openaiCaller';
import { getTemplate } from '@/lib/teacherpages/templates';

export async function generateTeacherResource(request: GenerationRequest): Promise<GenerationResponse> {
  try {
    // 1. Sanitize and validate input
    const sanitizedRequest = sanitizeGenerationRequest(request);
    const validation = validateGenerationRequest(sanitizedRequest);
    
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // 2. Get the template
    const template = getTemplate(sanitizedRequest.template);
    if (!template) {
      throw new Error(`Template '${sanitizedRequest.template}' not found`);
    }

    // 3. Generate the prompt
    const prompt = generatePrompt(sanitizedRequest);
    
    // 4. Call OpenAI
    const openaiResponse = await callOpenAIWithRetry(prompt);
    
    // 5. Validate and process the AI response
    const generatedContent = validateAndProcessContent(openaiResponse.content, template);
    
    // 6. Add current date and other metadata
    const enrichedContent = enrichContent(generatedContent, sanitizedRequest);
    
    // 7. Generate response
    const response: GenerationResponse = {
      content: enrichedContent,
      metadata: {
        gradeLevel: sanitizedRequest.gradeLevel,
        subject: sanitizedRequest.subject,
        generatedAt: new Date().toISOString(),
        requestId: generateRequestId()
      }
    };

    return response;

  } catch (error) {
    console.error('Error generating teacher resource:', error);
    throw new Error(`Failed to generate resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateTeacherResourceFromResourceData(resourceData: ResourceData, templateName: string = 'WorksheetTemplate'): Promise<GenerationResponse> {
  try {
    // 1. Validate resource data
    if (!resourceData.level || !resourceData.grade || !resourceData.subject || !resourceData.topic) {
      throw new Error('Missing required fields: level, grade, subject, topic');
    }

    // 2. Get the template
    const template = getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // 3. Generate the prompt
    const prompt = generatePromptFromResourceData(resourceData, templateName);
    
    // 4. Call OpenAI
    const openaiResponse = await callOpenAIWithResourceDataAndRetry(resourceData, templateName);
    
    // 5. Validate and process the AI response
    const generatedContent = validateAndProcessContent(openaiResponse.content, template);
    
    // 6. Add current date and other metadata
    const enrichedContent = enrichContentFromResourceData(generatedContent, resourceData);
    
    // 7. Generate response
    const response: GenerationResponse = {
      content: enrichedContent,
      metadata: {
        gradeLevel: resourceData.grade,
        subject: resourceData.subject,
        generatedAt: new Date().toISOString(),
        requestId: generateRequestId()
      }
    };

    return response;

  } catch (error) {
    console.error('Error generating teacher resource from resource data:', error);
    throw new Error(`Failed to generate resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateAndProcessContent(content: any, template: any): GeneratedContent {
  // Parse JSON string if content is a string
  let parsedContent: any;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new Error('AI response content is not valid JSON');
    }
  } else {
    parsedContent = content;
  }

  // Check if content is an object
  if (typeof parsedContent !== 'object' || parsedContent === null) {
    throw new Error('AI response is not a valid object');
  }

  // Validate that all required placeholders are present
  const missingPlaceholders: string[] = [];
  
  for (const placeholder of template.placeholders) {
    if (!(placeholder in parsedContent) || parsedContent[placeholder] === undefined || parsedContent[placeholder] === '') {
      missingPlaceholders.push(placeholder);
    }
  }

  if (missingPlaceholders.length > 0) {
    throw new Error(`Missing required content: ${missingPlaceholders.join(', ')}`);
  }

  // Return the validated content
  return parsedContent as GeneratedContent;
}

function enrichContent(content: GeneratedContent, request: GenerationRequest): GeneratedContent {
  // Add current date
  if ('currentDate' in content) {
    content.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Always add grade level and subject
  content.gradeLevel = request.gradeLevel;
  content.subject = request.subject;

  return content;
}

function enrichContentFromResourceData(content: GeneratedContent, resourceData: ResourceData): GeneratedContent {
  // Add current date if the template expects it
  if ('currentDate' in content) {
    content.currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Always add resource data context
  content.gradeLevel = resourceData.grade;
  content.subject = resourceData.subject;
  content.schoolLevel = resourceData.level;
  content.topic = resourceData.topic;
  content.resourceType = resourceData.resourceType;
  // State removed from ResourceData; using general standards context

  return content;
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get available templates
export async function getAvailableTemplates() {
  try {
    const { getAllTemplates } = await import('@/app/lib/teacherpages/templates');
    return getAllTemplates();
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
}

// Helper function to get available states
export async function getAvailableStates() {
  try {
    const { getAvailableStates: getStates } = await import('@/app/lib/teacherpages/standards');
    return getStates();
  } catch (error) {
    console.error('Error getting states:', error);
    return [];
  }
}

// Helper function to get available subjects for a state
export async function getAvailableSubjects(state: string) {
  try {
    const { getAvailableSubjects: getSubjects } = await import('@/app/lib/teacherpages/standards');
    return getSubjects(state);
  } catch (error) {
    console.error('Error getting subjects:', error);
    return [];
  }
}

// Helper function to get available grades for a state and subject
export async function getAvailableGrades(state: string, subject: string) {
  try {
    const { getAvailableGrades: getGrades } = await import('@/app/lib/teacherpages/standards');
    return getGrades(state, subject);
  } catch (error) {
    console.error('Error getting grades:', error);
    return [];
  }
} 