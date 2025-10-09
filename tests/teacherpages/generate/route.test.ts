import { NextRequest, NextResponse } from 'next/server';
import { POST, GET } from '@/app/api/teacherpages/generate/route';

// Mock the dependencies
jest.mock('@/actions/teacherpages/generateResource', () => ({
  generateTeacherResource: jest.fn()
}));

import { generateTeacherResource } from '@/actions/teacherpages/generateResource';

describe('TeacherPages Generate API Route', () => {
  const mockGenerateTeacherResource = generateTeacherResource as jest.MockedFunction<typeof generateTeacherResource>;

  const validRequestBody = {
    gradeLevel: '2nd',
    subjectType: 'Mathematics',
    subject: 'Addition',
    state: 'CA',
    mainTopic: 'Basic Addition',
    subTopic: 'Single Digit Addition',
    template: 'worksheet_3_questions'
  };

  const mockGeneratedResponse = {
    content: {
      worksheetTitle: 'Addition Practice',
      instructions: 'Solve the following addition problems',
      question1: 'What is 2 + 3?',
      question2: 'What is 5 + 4?',
      question3: 'What is 7 + 1?',
      answer1: '5',
      answer2: '9',
      answer3: '8'
    },
    metadata: {
      gradeLevel: '2nd',
      subject: 'Addition',
      generatedAt: '2024-01-15T10:30:00.000Z',
      requestId: 'req_1234567890_abc123'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateTeacherResource.mockResolvedValue(mockGeneratedResponse);
  });

  describe('POST endpoint', () => {
    it('should successfully generate a resource with valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: 'invalid json'
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request body');
      expect(mockGenerateTeacherResource).not.toHaveBeenCalled();
    });

    it('should return 400 for null request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: null as any
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Invalid request body');
      expect(mockGenerateTeacherResource).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteBody = {
        gradeLevel: '2nd',
        subjectType: 'Mathematics'
        // Missing: subject, state, mainTopic, subTopic, template
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(incompleteBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Missing required fields');
      expect(responseData.error).toContain('subject');
      expect(responseData.error).toContain('state');
      expect(responseData.error).toContain('mainTopic');
      expect(responseData.error).toContain('subTopic');
      expect(responseData.error).toContain('template');
      expect(mockGenerateTeacherResource).not.toHaveBeenCalled();
    });

    it('should return 400 for empty required fields', async () => {
      const emptyFieldsBody = {
        gradeLevel: '',
        subjectType: '',
        subject: '',
        state: '',
        mainTopic: '',
        subTopic: '',
        template: ''
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(emptyFieldsBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toContain('Missing required fields');
      expect(mockGenerateTeacherResource).not.toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      mockGenerateTeacherResource.mockRejectedValue(new Error('Validation failed: Invalid grade level'));

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.error).toBe('Validation failed: Invalid grade level');
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should return 404 for template not found errors', async () => {
      mockGenerateTeacherResource.mockRejectedValue(new Error("Template 'invalid_template' not found"));

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe("Template 'invalid_template' not found");
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should return 503 for OpenAI API errors', async () => {
      mockGenerateTeacherResource.mockRejectedValue(new Error('OpenAI API rate limit exceeded'));

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(503);
      expect(responseData.error).toBe('AI service temporarily unavailable. Please try again later.');
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should return 500 for generic errors', async () => {
      mockGenerateTeacherResource.mockRejectedValue(new Error('Unknown error occurred'));

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error. Please try again later.');
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should handle different subject types and states', async () => {
      const scienceRequest = {
        ...validRequestBody,
        subjectType: 'Science',
        subject: 'Physics',
        state: 'TX',
        mainTopic: 'Force and Motion',
        subTopic: 'Newton\'s Laws'
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(scienceRequest)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(scienceRequest);
    });

    it('should handle different grade levels', async () => {
      const kindergartenRequest = {
        ...validRequestBody,
        gradeLevel: 'K',
        mainTopic: 'Counting',
        subTopic: 'Numbers 1-10'
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(kindergartenRequest)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(kindergartenRequest);
    });

    it('should handle different templates', async () => {
      const lessonPlanRequest = {
        ...validRequestBody,
        template: 'lesson_plan'
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(lessonPlanRequest)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(lessonPlanRequest);
    });

    it('should handle non-Error exceptions', async () => {
      mockGenerateTeacherResource.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error. Please try again later.');
    });

    it('should handle undefined errors', async () => {
      mockGenerateTeacherResource.mockRejectedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Internal server error. Please try again later.');
    });
  });

  describe('GET endpoint', () => {
    it('should return API information', async () => {
      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        message: 'TeacherPages Generation API',
        usage: 'POST with gradeLevel, subjectType, subject, state, mainTopic, subTopic, and template',
        availableMethods: ['POST']
      });
    });

    it('should return consistent response structure', async () => {
      const response = await GET();
      const responseData = await response.json();

      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('usage');
      expect(responseData).toHaveProperty('availableMethods');
      expect(Array.isArray(responseData.availableMethods)).toBe(true);
      expect(responseData.availableMethods).toContain('POST');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete successful workflow', async () => {
      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should handle error workflow with proper status codes', async () => {
      const errorScenarios = [
        { 
          error: new Error('Validation failed: Invalid input'), 
          expectedStatus: 400, 
          expectedError: 'Validation failed: Invalid input' 
        },
        { 
          error: new Error("Template 'nonexistent' not found"), 
          expectedStatus: 404, 
          expectedError: "Template 'nonexistent' not found" 
        },
        { 
          error: new Error('OpenAI API rate limit exceeded'), 
          expectedStatus: 503, 
          expectedError: 'AI service temporarily unavailable. Please try again later.' 
        }
      ];

      for (const scenario of errorScenarios) {
        mockGenerateTeacherResource.mockRejectedValue(scenario.error);

        const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
          method: 'POST',
          body: JSON.stringify(validRequestBody)
        });

        const response = await POST(request);
        const responseData = await response.json();

        expect(response.status).toBe(scenario.expectedStatus);
        expect(responseData.error).toBe(scenario.expectedError);
      }
    });

    it('should handle various request body formats', async () => {
      const testCases = [
        { body: validRequestBody, expectedSuccess: true },
        { body: { ...validRequestBody, gradeLevel: '' }, expectedSuccess: false },
        { body: { ...validRequestBody, subjectType: undefined }, expectedSuccess: false },
        { body: { ...validRequestBody, state: null }, expectedSuccess: false },
        { body: { ...validRequestBody, mainTopic: 'A'.repeat(201) }, expectedSuccess: true }, // Long strings are valid
        { body: { ...validRequestBody, subTopic: 'B'.repeat(201) }, expectedSuccess: true }  // Long strings are valid
      ];

      for (const testCase of testCases) {
        const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
          method: 'POST',
          body: JSON.stringify(testCase.body)
        });

        const response = await POST(request);

        if (testCase.expectedSuccess) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(400);
        }
      }
    });
  });

  describe('error handling edge cases', () => {
    it('should handle request body with extra fields', async () => {
      const bodyWithExtraFields = {
        ...validRequestBody,
        extraField: 'extra value',
        anotherField: 123
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(bodyWithExtraFields)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      // Should only pass the required fields to the action
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(validRequestBody);
    });

    it('should handle request body with whitespace', async () => {
      const bodyWithWhitespace = {
        gradeLevel: '  2nd  ',
        subjectType: '  Mathematics  ',
        subject: '  Addition  ',
        state: '  CA  ',
        mainTopic: '  Basic Addition  ',
        subTopic: '  Single Digit Addition  ',
        template: '  worksheet_3_questions  '
      };

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(bodyWithWhitespace)
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockGeneratedResponse);
      // The action should handle sanitization
      expect(mockGenerateTeacherResource).toHaveBeenCalledWith(bodyWithWhitespace);
    });

    it('should handle console.error calls for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      mockGenerateTeacherResource.mockRejectedValue(new Error('Test error'));

      const request = new NextRequest('http://localhost:3000/api/teacherpages/generate', {
        method: 'POST',
        body: JSON.stringify(validRequestBody)
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
}); 