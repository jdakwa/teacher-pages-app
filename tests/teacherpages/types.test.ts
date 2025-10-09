import { 
  GenerationRequest, 
  JSONTemplate, 
  GeneratedContent, 
  GenerationResponse,
  OpenAIResponse 
} from '@/app/lib/teacherpages/types';

describe('TeacherPages Types', () => {
  describe('GenerationRequest', () => {
    it('should have all required properties', () => {
      const request: GenerationRequest = {
        gradeLevel: '2nd',
        subjectType: 'Mathematics',
        subject: 'Addition',
        state: 'CA',
        mainTopic: 'Basic Addition',
        subTopic: 'Single Digit Addition',
        template: 'worksheet_3_questions'
      };

      expect(request.gradeLevel).toBe('2nd');
      expect(request.subjectType).toBe('Mathematics');
      expect(request.subject).toBe('Addition');
      expect(request.state).toBe('CA');
      expect(request.mainTopic).toBe('Basic Addition');
      expect(request.subTopic).toBe('Single Digit Addition');
      expect(request.template).toBe('worksheet_3_questions');
    });

    it('should allow valid grade levels', () => {
      const validGrades = ['K', '1st', '2nd', '3rd', '4th', '5th'];
      
      validGrades.forEach(grade => {
        const request: GenerationRequest = {
          gradeLevel: grade,
          subjectType: 'Mathematics',
          subject: 'Addition',
          state: 'CA',
          mainTopic: 'Basic Addition',
          subTopic: 'Single Digit Addition',
          template: 'worksheet_3_questions'
        };
        
        expect(request.gradeLevel).toBe(grade);
      });
    });

    it('should allow valid subject types', () => {
      const validSubjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
      
      validSubjects.forEach(subject => {
        const request: GenerationRequest = {
          gradeLevel: '2nd',
          subjectType: subject,
          subject: 'Addition',
          state: 'CA',
          mainTopic: 'Basic Addition',
          subTopic: 'Single Digit Addition',
          template: 'worksheet_3_questions'
        };
        
        expect(request.subjectType).toBe(subject);
      });
    });
  });

  describe('JSONTemplate', () => {
    it('should have all required properties', () => {
      const template: JSONTemplate = {
        id: 'test_template',
        name: 'Test Template',
        description: 'A test template for testing',
        placeholders: ['field1', 'field2', 'field3']
      };

      expect(template.id).toBe('test_template');
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A test template for testing');
      expect(template.placeholders).toEqual(['field1', 'field2', 'field3']);
    });

    it('should allow empty placeholders array', () => {
      const template: JSONTemplate = {
        id: 'empty_template',
        name: 'Empty Template',
        description: 'Template with no placeholders',
        placeholders: []
      };

      expect(template.placeholders).toEqual([]);
    });
  });

  describe('GeneratedContent', () => {
    it('should allow string values', () => {
      const content: GeneratedContent = {
        title: 'Test Title',
        description: 'Test Description'
      };

      expect(content.title).toBe('Test Title');
      expect(content.description).toBe('Test Description');
    });

    it('should allow string array values', () => {
      const content: GeneratedContent = {
        questions: ['Question 1', 'Question 2', 'Question 3'],
        answers: ['Answer 1', 'Answer 2', 'Answer 3']
      };

      expect(content.questions).toEqual(['Question 1', 'Question 2', 'Question 3']);
      expect(content.answers).toEqual(['Answer 1', 'Answer 2', 'Answer 3']);
    });

    it('should allow mixed string and string array values', () => {
      const content: GeneratedContent = {
        title: 'Mixed Content',
        questions: ['Q1', 'Q2'],
        description: 'Mixed description'
      };

      expect(content.title).toBe('Mixed Content');
      expect(content.questions).toEqual(['Q1', 'Q2']);
      expect(content.description).toBe('Mixed description');
    });
  });

  describe('GenerationResponse', () => {
    it('should have all required properties', () => {
      const response: GenerationResponse = {
        content: {
          worksheetTitle: 'Test Worksheet',
          instructions: 'Test instructions',
          question1: 'Test question 1',
          question2: 'Test question 2',
          question3: 'Test question 3',
          answer1: 'Test answer 1',
          answer2: 'Test answer 2',
          answer3: 'Test answer 3'
        },
        metadata: {
          gradeLevel: '2nd',
          subject: 'Mathematics',
          generatedAt: '2024-01-15T10:30:00Z',
          requestId: 'test_request_123'
        }
      };

      expect(response.content).toBeDefined();
      expect(response.metadata).toBeDefined();
      expect(response.metadata.gradeLevel).toBe('2nd');
      expect(response.metadata.subject).toBe('Mathematics');
      expect(response.metadata.generatedAt).toBe('2024-01-15T10:30:00Z');
      expect(response.metadata.requestId).toBe('test_request_123');
    });

    it('should allow empty content', () => {
      const response: GenerationResponse = {
        content: {},
        metadata: {
          gradeLevel: '2nd',
          subject: 'Mathematics',
          generatedAt: '2024-01-15T10:30:00Z',
          requestId: 'test_request_123'
        }
      };

      expect(response.content).toEqual({});
    });
  });

  describe('OpenAIResponse', () => {
    it('should have all required properties', () => {
      const openaiResponse: OpenAIResponse = {
        content: '{"worksheetTitle": "AI Generated Title", "instructions": "AI Generated Instructions"}',
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        }
      };

      expect(openaiResponse.content).toBeDefined();
      expect(openaiResponse.usage).toBeDefined();
      expect(openaiResponse.usage.prompt_tokens).toBe(100);
      expect(openaiResponse.usage.completion_tokens).toBe(50);
      expect(openaiResponse.usage.total_tokens).toBe(150);
    });

    it('should allow empty content string', () => {
      const openaiResponse: OpenAIResponse = {
        content: '',
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };

      expect(openaiResponse.content).toBe('');
      expect(openaiResponse.usage.total_tokens).toBe(0);
    });

    it('should allow JSON string content', () => {
      const openaiResponse: OpenAIResponse = {
        content: '{"key": "value", "array": ["item1", "item2"]}',
        usage: {
          prompt_tokens: 50,
          completion_tokens: 25,
          total_tokens: 75
        }
      };

      expect(openaiResponse.content).toBe('{"key": "value", "array": ["item1", "item2"]}');
      expect(typeof openaiResponse.content).toBe('string');
    });
  });
}); 