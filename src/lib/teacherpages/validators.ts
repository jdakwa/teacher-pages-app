import { GenerationRequest } from './types';
import { getTemplate } from './templates';
import { getAvailableStates, getAvailableSubjects, getAvailableGrades } from './standards';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateGenerationRequest(request: GenerationRequest): ValidationResult {
  const errors: string[] = [];

  // Check required fields
  if (!request.gradeLevel) {
    errors.push('Grade level is required');
  }

  if (!request.subjectType) {
    errors.push('Subject type is required');
  }

  if (!request.subject) {
    errors.push('Subject is required');
  }

  if (!request.state) {
    errors.push('State is required');
  }

  if (!request.mainTopic) {
    errors.push('Main topic is required');
  }

  if (!request.subTopic) {
    errors.push('Sub topic is required');
  }

  if (!request.template) {
    errors.push('Template is required');
  }

  // Validate template exists
  if (request.template && !getTemplate(request.template)) {
    errors.push(`Template '${request.template}' does not exist`);
  }

  // Validate state exists
  if (request.state && !getAvailableStates().includes(request.state)) {
    errors.push(`State '${request.state}' is not supported`);
  }

  // Validate subject type exists for the state
  if (request.state && request.subjectType && !getAvailableSubjects(request.state).includes(request.subjectType)) {
    errors.push(`Subject type '${request.subjectType}' is not available for state '${request.state}'`);
  }

  // Validate grade level exists for the state and subject
  if (request.state && request.subjectType && request.gradeLevel && 
      !getAvailableGrades(request.state, request.subjectType).includes(request.gradeLevel)) {
    errors.push(`Grade level '${request.gradeLevel}' is not available for ${request.subjectType} in state '${request.state}'`);
  }

  // Validate content length
  if (request.mainTopic && request.mainTopic.length > 200) {
    errors.push('Main topic must be 200 characters or less');
  }

  if (request.subTopic && request.subTopic.length > 200) {
    errors.push('Sub topic must be 200 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeGenerationRequest(request: GenerationRequest): GenerationRequest {
  return {
    gradeLevel: request.gradeLevel?.trim() || '',
    subjectType: request.subjectType?.trim() || '',
    subject: request.subject?.trim() || '',
    state: request.state?.trim() || '',
    mainTopic: request.mainTopic?.trim() || '',
    subTopic: request.subTopic?.trim() || '',
    template: request.template?.trim() || ''
  };
} 