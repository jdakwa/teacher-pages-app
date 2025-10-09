import { validateGenerationRequest, sanitizeGenerationRequest, ValidationResult } from '@/app/lib/teacherpages/validators';
import { GenerationRequest } from '@/app/lib/teacherpages/types';

// Mock the dependencies
jest.mock('@/app/lib/teacherpages/templates', () => ({
  getTemplate: jest.fn()
}));

jest.mock('@/app/lib/teacherpages/standards', () => ({
  getAvailableStates: jest.fn(),
  getAvailableSubjects: jest.fn(),
  getAvailableGrades: jest.fn()
}));

import { getTemplate } from '@/app/lib/teacherpages/templates';
import { getAvailableStates, getAvailableSubjects, getAvailableGrades } from '@/app/lib/teacherpages/standards';

describe('TeacherPages Validators', () => {
  const mockGetTemplate = getTemplate as jest.MockedFunction<typeof getTemplate>;
  const mockGetAvailableStates = getAvailableStates as jest.MockedFunction<typeof getAvailableStates>;
  const mockGetAvailableSubjects = getAvailableSubjects as jest.MockedFunction<typeof getAvailableSubjects>;
  const mockGetAvailableGrades = getAvailableGrades as jest.MockedFunction<typeof getAvailableGrades>;

  const validRequest: GenerationRequest = {
    gradeLevel: '2nd',
    subjectType: 'Mathematics',
    subject: 'Addition',
    state: 'CA',
    mainTopic: 'Basic Addition',
    subTopic: 'Single Digit Addition',
    template: 'worksheet_3_questions'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetTemplate.mockReturnValue({
      id: 'worksheet_3_questions',
      name: 'Basic Worksheet - 3 Questions',
      description: 'A simple worksheet with 3 questions and answer key',
      placeholders: ['worksheetTitle', 'instructions', 'question1', 'question2', 'question3', 'answer1', 'answer2', 'answer3']
    });
    
    mockGetAvailableStates.mockReturnValue(['CA', 'TX', 'NY']);
    mockGetAvailableSubjects.mockReturnValue(['Mathematics', 'English Language Arts', 'Science', 'Social Studies']);
    mockGetAvailableGrades.mockReturnValue(['K', '1st', '2nd', '3rd', '4th', '5th']);
  });

  describe('validateGenerationRequest', () => {
    it('should return valid for a complete valid request', () => {
      const result = validateGenerationRequest(validRequest);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate required fields', () => {
      const requiredFields = ['gradeLevel', 'subjectType', 'subject', 'state', 'mainTopic', 'subTopic', 'template'];
      
      requiredFields.forEach(field => {
        const invalidRequest = { ...validRequest, [field]: '' };
        const result = validateGenerationRequest(invalidRequest);
        
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      });
    });

    it('should validate template exists', () => {
      mockGetTemplate.mockReturnValue(null);
      
      const result = validateGenerationRequest(validRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Template 'worksheet_3_questions' does not exist");
    });

    it('should validate state exists', () => {
      mockGetAvailableStates.mockReturnValue(['TX', 'NY']);
      
      const result = validateGenerationRequest(validRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("State 'CA' is not supported");
    });

    it('should validate subject type exists for the state', () => {
      mockGetAvailableSubjects.mockReturnValue(['English Language Arts', 'Science']);
      
      const result = validateGenerationRequest(validRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Subject type 'Mathematics' is not available for state 'CA'");
    });

    it('should validate grade level exists for the state and subject', () => {
      mockGetAvailableGrades.mockReturnValue(['K', '1st', '3rd', '4th', '5th']);
      
      const result = validateGenerationRequest(validRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Grade level '2nd' is not available for Mathematics in state 'CA'");
    });

    it('should validate content length constraints', () => {
      const longTopic = 'A'.repeat(201);
      const longSubTopic = 'B'.repeat(201);
      
      const invalidRequest = {
        ...validRequest,
        mainTopic: longTopic,
        subTopic: longSubTopic
      };
      
      const result = validateGenerationRequest(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Main topic must be 200 characters or less');
      expect(result.errors).toContain('Sub topic must be 200 characters or less');
    });

    it('should handle multiple validation errors', () => {
      const invalidRequest = {
        ...validRequest,
        gradeLevel: '',
        state: 'INVALID_STATE',
        mainTopic: 'A'.repeat(201)
      };
      
      mockGetAvailableStates.mockReturnValue(['TX', 'NY']);
      
      const result = validateGenerationRequest(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Grade level is required');
      expect(result.errors).toContain("State 'INVALID_STATE' is not supported");
      expect(result.errors).toContain('Main topic must be 200 characters or less');
    });

    it('should handle edge cases with null/undefined values', () => {
      const invalidRequest = {
        ...validRequest,
        gradeLevel: null as any,
        subjectType: undefined as any
      };
      
      const result = validateGenerationRequest(invalidRequest);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grade level is required');
      expect(result.errors).toContain('Subject type is required');
    });
  });

  describe('sanitizeGenerationRequest', () => {
    it('should trim whitespace from all fields', () => {
      const requestWithWhitespace: GenerationRequest = {
        gradeLevel: '  2nd  ',
        subjectType: '  Mathematics  ',
        subject: '  Addition  ',
        state: '  CA  ',
        mainTopic: '  Basic Addition  ',
        subTopic: '  Single Digit Addition  ',
        template: '  worksheet_3_questions  '
      };
      
      const result = sanitizeGenerationRequest(requestWithWhitespace);
      
      expect(result.gradeLevel).toBe('2nd');
      expect(result.subjectType).toBe('Mathematics');
      expect(result.subject).toBe('Addition');
      expect(result.state).toBe('CA');
      expect(result.mainTopic).toBe('Basic Addition');
      expect(result.subTopic).toBe('Single Digit Addition');
      expect(result.template).toBe('worksheet_3_questions');
    });

    it('should handle empty strings and convert to empty strings', () => {
      const requestWithEmptyStrings: GenerationRequest = {
        gradeLevel: '',
        subjectType: '',
        subject: '',
        state: '',
        mainTopic: '',
        subTopic: '',
        template: ''
      };
      
      const result = sanitizeGenerationRequest(requestWithEmptyStrings);
      
      expect(result.gradeLevel).toBe('');
      expect(result.subjectType).toBe('');
      expect(result.subject).toBe('');
      expect(result.state).toBe('');
      expect(result.mainTopic).toBe('');
      expect(result.subTopic).toBe('');
      expect(result.template).toBe('');
    });

    it('should handle undefined values and convert to empty strings', () => {
      const requestWithUndefined: GenerationRequest = {
        gradeLevel: undefined as any,
        subjectType: undefined as any,
        subject: undefined as any,
        state: undefined as any,
        mainTopic: undefined as any,
        subTopic: undefined as any,
        template: undefined as any
      };
      
      const result = sanitizeGenerationRequest(requestWithUndefined);
      
      expect(result.gradeLevel).toBe('');
      expect(result.subjectType).toBe('');
      expect(result.subject).toBe('');
      expect(result.state).toBe('');
      expect(result.mainTopic).toBe('');
      expect(result.subTopic).toBe('');
      expect(result.template).toBe('');
    });

    it('should preserve valid content without modification', () => {
      const result = sanitizeGenerationRequest(validRequest);
      
      expect(result).toEqual(validRequest);
    });

    it('should handle mixed whitespace scenarios', () => {
      const mixedRequest: GenerationRequest = {
        gradeLevel: '  3rd  ',
        subjectType: 'Science',
        subject: '  Physics  ',
        state: 'TX',
        mainTopic: '  Force and Motion  ',
        subTopic: 'Newton\'s Laws',
        template: 'lesson_plan'
      };
      
      const result = sanitizeGenerationRequest(mixedRequest);
      
      expect(result.gradeLevel).toBe('3rd');
      expect(result.subjectType).toBe('Science');
      expect(result.subject).toBe('Physics');
      expect(result.state).toBe('TX');
      expect(result.mainTopic).toBe('Force and Motion');
      expect(result.subTopic).toBe('Newton\'s Laws');
      expect(result.template).toBe('lesson_plan');
    });
  });

  describe('integration scenarios', () => {
    it('should work together for a complete validation flow', () => {
      const requestWithWhitespace: GenerationRequest = {
        gradeLevel: '  1st  ',
        subjectType: '  English Language Arts  ',
        subject: '  Reading Comprehension  ',
        state: '  NY  ',
        mainTopic: '  Story Elements  ',
        subTopic: '  Character Analysis  ',
        template: '  worksheet_3_questions  '
      };
      
      // First sanitize
      const sanitized = sanitizeGenerationRequest(requestWithWhitespace);
      
      // Then validate
      const validation = validateGenerationRequest(sanitized);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle validation after sanitization with invalid data', () => {
      const invalidRequest: GenerationRequest = {
        gradeLevel: '  INVALID_GRADE  ',
        subjectType: '  Mathematics  ',
        subject: '  Addition  ',
        state: '  INVALID_STATE  ',
        mainTopic: '  Basic Addition  ',
        subTopic: '  Single Digit Addition  ',
        template: '  invalid_template  '
      };
      
      // Sanitize first
      const sanitized = sanitizeGenerationRequest(invalidRequest);
      
      // Mock responses for validation
      mockGetTemplate.mockReturnValue(null);
      mockGetAvailableStates.mockReturnValue(['CA', 'TX']);
      
      // Validate
      const validation = validateGenerationRequest(sanitized);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain("Template 'invalid_template' does not exist");
      expect(validation.errors).toContain("State 'INVALID_STATE' is not supported");
    });
  });
}); 