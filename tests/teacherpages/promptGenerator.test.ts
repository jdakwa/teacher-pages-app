import { generatePrompt, generateSystemPrompt } from '@/app/lib/teacherpages/promptGenerator';
import { GenerationRequest } from '@/app/lib/teacherpages/types';
import { generatePromptFromResourceData } from '@/app/lib/teacherpages/promptGenerator';
import { ResourceData } from '@/app/lib/teacherpages/types';

// Mock the dependencies
jest.mock('@/app/lib/teacherpages/templates', () => ({
  getTemplate: jest.fn()
}));

jest.mock('@/app/lib/teacherpages/standards', () => ({
  getRelevantStandards: jest.fn()
}));

import { getTemplate } from '@/app/lib/teacherpages/templates';
import { getRelevantStandards } from '@/app/lib/teacherpages/standards';

describe('TeacherPages Prompt Generator', () => {
  const mockGetTemplate = getTemplate as jest.MockedFunction<typeof getTemplate>;
  const mockGetRelevantStandards = getRelevantStandards as jest.MockedFunction<typeof getRelevantStandards>;

  const validRequest: GenerationRequest = {
    gradeLevel: '2nd',
    subjectType: 'Mathematics',
    subject: 'Addition',
    state: 'CA',
    mainTopic: 'Basic Addition',
    subTopic: 'Single Digit Addition',
    template: 'worksheet_3_questions'
  };

  const mockTemplate = {
    id: 'worksheet_3_questions',
    name: 'Basic Worksheet - 3 Questions',
    description: 'A simple worksheet with 3 questions and answer key',
    placeholders: [
      'worksheetTitle',
      'instructions', 
      'question1', 'question2', 'question3',
      'answer1', 'answer2', 'answer3'
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockGetTemplate.mockReturnValue(mockTemplate);
    mockGetRelevantStandards.mockReturnValue([
      '2.OA.A.1 - Use addition and subtraction within 100',
      '2.OA.B.2 - Fluently add and subtract within 20',
      '2.NBT.A.1 - Understand place value'
    ]);
  });

  describe('generatePrompt', () => {
    it('should generate a complete prompt with all components', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      
      // Check for required sections
      expect(prompt).toContain('You are an expert teacher');
      expect(prompt).toContain('Grade Level: 2nd');
      expect(prompt).toContain('Subject Type: Mathematics');
      expect(prompt).toContain('Main Topic: Basic Addition');
      expect(prompt).toContain('Sub Topic: Single Digit Addition');
      expect(prompt).toContain('State: CA');
      expect(prompt).toContain('Template Type: Basic Worksheet - 3 Questions');
      expect(prompt).toContain('Generate a worksheet with exactly 3 questions');
      expect(prompt).toContain('worksheetTitle');
      expect(prompt).toContain('instructions');
      expect(prompt).toContain('question1');
      expect(prompt).toContain('answer1');
    });

    it('should include state standards when available', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toContain('STATE STANDARDS TO ALIGN WITH:');
      expect(prompt).toContain('2.OA.A.1 - Use addition and subtraction within 100');
      expect(prompt).toContain('2.OA.B.2 - Fluently add and subtract within 20');
      expect(prompt).toContain('2.NBT.A.1 - Understand place value');
      expect(prompt).toContain('Ensure your content aligns with these standards');
    });

    it('should handle case when no standards are available', () => {
      mockGetRelevantStandards.mockReturnValue([]);
      
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).not.toContain('STATE STANDARDS TO ALIGN WITH:');
      expect(prompt).not.toContain('Ensure your content aligns with these standards');
    });

    it('should include all template placeholders in output format', () => {
      const prompt = generatePrompt(validRequest);
      
      mockTemplate.placeholders.forEach(placeholder => {
        expect(prompt).toContain(placeholder);
      });
    });

    it('should include output format requirements', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toContain('OUTPUT REQUIREMENTS:');
      expect(prompt).toContain('Return ONLY a valid JSON object');
      expect(prompt).toContain('Use the exact keys specified above');
      expect(prompt).toContain('Make content engaging and age-appropriate');
      expect(prompt).toContain('Ensure all placeholders are filled with meaningful content');
      expect(prompt).toContain('Content should be educational and aligned with standards');
      expect(prompt).toContain('Keep responses concise but comprehensive');
    });

    it('should include example output format', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toContain('EXAMPLE OUTPUT FORMAT:');
      expect(prompt).toContain('"worksheetTitle": "Your title here"');
      expect(prompt).toContain('"instructions": "Your instructions here"');
      expect(prompt).toContain('"question1": "Your first question here"');
      expect(prompt).toContain('fill all required fields');
    });

    it('should throw error when template is not found', () => {
      mockGetTemplate.mockReturnValue(null);
      
      expect(() => generatePrompt(validRequest)).toThrow("Template 'worksheet_3_questions' not found");
    });

    it('should handle different grade levels appropriately', () => {
      const kindergartenRequest = { ...validRequest, gradeLevel: 'K' };
      const prompt = generatePrompt(kindergartenRequest);
      
      expect(prompt).toContain('Grade Level: K');
      expect(prompt).toContain('Make the questions appropriate for K grade level');
    });

    it('should handle different subject types appropriately', () => {
      const scienceRequest = { ...validRequest, subjectType: 'Science' };
      const prompt = generatePrompt(scienceRequest);
      
      expect(prompt).toContain('Subject Type: Science');
      expect(prompt).toContain('Generate a worksheet with exactly 3 questions about Basic Addition');
    });

    it('should handle different states appropriately', () => {
      const texasRequest = { ...validRequest, state: 'TX' };
      const prompt = generatePrompt(texasRequest);
      
      expect(prompt).toContain('State: TX');
    });

    it('should handle different topics appropriately', () => {
      const readingRequest = { ...validRequest, mainTopic: 'Reading Comprehension', subTopic: 'Main Idea' };
      const prompt = generatePrompt(readingRequest);
      
      expect(prompt).toContain('Main Topic: Reading Comprehension');
      expect(prompt).toContain('Sub Topic: Main Idea');
      expect(prompt).toContain('Generate a worksheet with exactly 3 questions about Reading Comprehension');
    });

    it('should include task description with main topic', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toContain('TASK: Generate a worksheet with exactly 3 questions about Basic Addition');
    });

    it('should include grade level in task description', () => {
      const prompt = generatePrompt(validRequest);
      
      expect(prompt).toContain('Make the questions appropriate for 2nd grade level');
    });
  });

  describe('generateSystemPrompt', () => {
    it('should generate a system prompt with correct content', () => {
      const systemPrompt = generateSystemPrompt();
      
      expect(systemPrompt).toBeDefined();
      expect(typeof systemPrompt).toBe('string');
      expect(systemPrompt.length).toBeGreaterThan(0);
    });

    it('should include TeacherPages identity', () => {
      const systemPrompt = generateSystemPrompt();
      
      expect(systemPrompt).toContain('You are TeacherPages');
      expect(systemPrompt).toContain('AI-powered educational content generator');
    });

    it('should include key responsibilities', () => {
      const systemPrompt = generateSystemPrompt();
      
      expect(systemPrompt).toContain('Generate engaging, age-appropriate content');
      expect(systemPrompt).toContain('Align with state educational standards');
      expect(systemPrompt).toContain('Follow template specifications exactly');
      expect(systemPrompt).toContain('Provide structured, consistent output');
      expect(systemPrompt).toContain('Ensure educational value and accuracy');
    });

    it('should include output format requirement', () => {
      const systemPrompt = generateSystemPrompt();
      
      expect(systemPrompt).toContain('Always respond with valid JSON');
      expect(systemPrompt).toContain('matches the requested template structure');
    });

    it('should be consistent across multiple calls', () => {
      const prompt1 = generateSystemPrompt();
      const prompt2 = generateSystemPrompt();
      
      expect(prompt1).toBe(prompt2);
    });
  });

  describe('integration scenarios', () => {
    it('should work with different template types', () => {
      const lessonPlanTemplate = {
        id: 'lesson_plan',
        name: 'Lesson Plan Template',
        description: 'A comprehensive lesson plan template',
        placeholders: ['title', 'objectives', 'materials', 'procedures', 'assessment']
      };
      
      mockGetTemplate.mockReturnValue(lessonPlanTemplate);
      
      const request = { ...validRequest, template: 'lesson_plan' };
      const prompt = generatePrompt(request);
      
      expect(prompt).toContain('Template Type: Lesson Plan Template');
      expect(prompt).toContain('title');
      expect(prompt).toContain('objectives');
      expect(prompt).toContain('materials');
      expect(prompt).toContain('procedures');
      expect(prompt).toContain('assessment');
    });

    it('should work with different subject types and standards', () => {
      const elaRequest = { ...validRequest, subjectType: 'English Language Arts' };
      mockGetRelevantStandards.mockReturnValue([
        '2.RL.1 - Ask and answer questions about key details',
        '2.RL.2 - Recount stories and determine central message',
        '2.RL.3 - Describe how characters respond to events'
      ]);
      
      const prompt = generatePrompt(elaRequest);
      
      expect(prompt).toContain('Subject Type: English Language Arts');
      expect(prompt).toContain('2.RL.1 - Ask and answer questions about key details');
      expect(prompt).toContain('2.RL.2 - Recount stories and determine central message');
      expect(prompt).toContain('2.RL.3 - Describe how characters respond to events');
    });

    it('should handle complex placeholder structures', () => {
      const complexTemplate = {
        id: 'complex_worksheet',
        name: 'Complex Worksheet Template',
        description: 'A worksheet with complex structure',
        placeholders: [
          'header.title',
          'header.subtitle',
          'content.section1.title',
          'content.section1.questions',
          'content.section2.title',
          'content.section2.questions',
          'footer.notes'
        ]
      };
      
      mockGetTemplate.mockReturnValue(complexTemplate);
      
      const request = { ...validRequest, template: 'complex_worksheet' };
      const prompt = generatePrompt(request);
      
      complexTemplate.placeholders.forEach(placeholder => {
        expect(prompt).toContain(placeholder);
      });
    });

    it('should maintain consistent prompt structure across different inputs', () => {
      const testCases = [
        { gradeLevel: 'K', subjectType: 'Mathematics', mainTopic: 'Counting', subTopic: 'Numbers 1-10' },
        { gradeLevel: '3rd', subjectType: 'Science', mainTopic: 'Plants', subTopic: 'Life Cycle' },
        { gradeLevel: '5th', subjectType: 'Social Studies', mainTopic: 'American History', subTopic: 'Revolutionary War' }
      ];
      
      testCases.forEach(testCase => {
        const request = { ...validRequest, ...testCase };
        const prompt = generatePrompt(request);
        
        // Check that basic structure is maintained
        expect(prompt).toContain('You are an expert teacher');
        expect(prompt).toContain(`Grade Level: ${testCase.gradeLevel}`);
        expect(prompt).toContain(`Subject Type: ${testCase.subjectType}`);
        expect(prompt).toContain(`Main Topic: ${testCase.mainTopic}`);
        expect(prompt).toContain(`Sub Topic: ${testCase.subTopic}`);
        expect(prompt).toContain('TASK: Generate a worksheet with exactly 3 questions');
        expect(prompt).toContain('OUTPUT REQUIREMENTS:');
        expect(prompt).toContain('EXAMPLE OUTPUT FORMAT:');
      });
    });
  });

  describe('error handling', () => {
    it('should handle missing template gracefully', () => {
      mockGetTemplate.mockReturnValue(null);
      
      expect(() => generatePrompt(validRequest)).toThrow();
      expect(() => generatePrompt(validRequest)).toThrow("Template 'worksheet_3_questions' not found");
    });

    it('should handle undefined template gracefully', () => {
      mockGetTemplate.mockReturnValue(undefined as any);
      
      expect(() => generatePrompt(validRequest)).toThrow();
    });

    it('should handle template with missing properties gracefully', () => {
      const incompleteTemplate = {
        id: 'incomplete',
        name: 'Incomplete Template'
        // Missing description and placeholders
      } as any;
      
      mockGetTemplate.mockReturnValue(incompleteTemplate);
      
      // This should not throw but might produce unexpected output
      expect(() => generatePrompt(validRequest)).not.toThrow();
    });
  });
}); 

describe('PromptGenerator with ResourceData', () => {
  const mockResourceData: ResourceData = {
    level: 'Elementary School',
    grade: '2nd',
    subject: 'Mathematics',
    topic: 'Addition & Subtraction within 100',
    state: 'CA',
    resourceType: 'worksheet'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePromptFromResourceData', () => {
    it('should generate a prompt with ResourceData', () => {
      const prompt = generatePromptFromResourceData(mockResourceData);

      expect(prompt).toContain('Elementary School');
      expect(prompt).toContain('2nd');
      expect(prompt).toContain('Mathematics');
      expect(prompt).toContain('Addition & Subtraction within 100');
      expect(prompt).toContain('CA');
      expect(prompt).toContain('worksheet');
      expect(prompt).toContain('CCSS.MATH.CONTENT.2.NBT.B.5');
    });

    it('should include all required template placeholders', () => {
      const prompt = generatePromptFromResourceData(mockResourceData);

      expect(prompt).toContain('- worksheetTitle');
      expect(prompt).toContain('- instructions');
      expect(prompt).toContain('- question1');
      expect(prompt).toContain('- question2');
      expect(prompt).toContain('- question3');
      expect(prompt).toContain('- answer1');
      expect(prompt).toContain('- answer2');
      expect(prompt).toContain('- answer3');
    });

    it('should use custom template name when provided', () => {
      const customTemplate = 'CustomTemplate';
      generatePromptFromResourceData(mockResourceData, customTemplate);

      const { getTemplate } = require('@/app/lib/teacherpages/templates');
      expect(getTemplate).toHaveBeenCalledWith(customTemplate);
    });

    it('should use default template when no template name provided', () => {
      generatePromptFromResourceData(mockResourceData);

      const { getTemplate } = require('@/app/lib/teacherpages/templates');
      expect(getTemplate).toHaveBeenCalledWith('ThreeQuestionTemplate');
    });

    it('should include state standards in the prompt', () => {
      const prompt = generatePromptFromResourceData(mockResourceData);

      expect(prompt).toContain('STATE STANDARDS TO ALIGN WITH:');
      expect(prompt).toContain('CCSS.MATH.CONTENT.2.NBT.B.5: Fluently add and subtract within 100');
      expect(prompt).toContain('CCSS.MATH.CONTENT.2.OA.B.2: Fluently add and subtract within 20');
    });

    it('should include output format requirements', () => {
      const prompt = generatePromptFromResourceData(mockResourceData);

      expect(prompt).toContain('OUTPUT REQUIREMENTS:');
      expect(prompt).toContain('Return ONLY a valid JSON object');
      expect(prompt).toContain('Use the exact keys specified above');
      expect(prompt).toContain('Make content engaging and age-appropriate');
    });

    it('should include example output format', () => {
      const prompt = generatePromptFromResourceData(mockResourceData);

      expect(prompt).toContain('EXAMPLE OUTPUT FORMAT:');
      expect(prompt).toContain('"worksheetTitle": "Your title here"');
      expect(prompt).toContain('"instructions": "Your instructions here"');
      expect(prompt).toContain('"question1": "Your first question here"');
    });

    it('should handle different resource types', () => {
      const activityResourceData: ResourceData = {
        ...mockResourceData,
        resourceType: 'activity'
      };

      const prompt = generatePromptFromResourceData(activityResourceData);
      expect(prompt).toContain('Generate a activity with exactly 3 questions');
    });

    it('should handle different school levels', () => {
      const highSchoolResourceData: ResourceData = {
        ...mockResourceData,
        level: 'High School',
        grade: '9th',
        subject: 'Biology',
        topic: 'Cell Structure'
      };

      const prompt = generatePromptFromResourceData(highSchoolResourceData);
      expect(prompt).toContain('High School');
      expect(prompt).toContain('9th');
      expect(prompt).toContain('Biology');
      expect(prompt).toContain('Cell Structure');
    });
  });
}); 