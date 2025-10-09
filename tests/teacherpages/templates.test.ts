import { getTemplate, getAllTemplates, addTemplate, TEMPLATES } from '@/app/lib/teacherpages/templates';
import { JSONTemplate } from '@/app/lib/teacherpages/types';

describe('TeacherPages Templates', () => {
  const originalTemplates = { ...TEMPLATES };
  
  afterEach(() => {
    // Restore original templates after each test
    Object.keys(TEMPLATES).forEach(key => {
      delete (TEMPLATES as any)[key];
    });
    Object.assign(TEMPLATES, originalTemplates);
  });

  describe('getTemplate', () => {
    it('should return template for valid template ID', () => {
      const template = getTemplate('worksheet_3_questions');
      
      expect(template).toBeDefined();
      expect(template?.id).toBe('worksheet_3_questions');
      expect(template?.name).toBe('Basic Worksheet - 3 Questions');
      expect(template?.description).toBe('A simple worksheet with 3 questions and answer key');
      expect(template?.placeholders).toEqual([
        'worksheetTitle',
        'instructions', 
        'question1', 'question2', 'question3',
        'answer1', 'answer2', 'answer3'
      ]);
    });

    it('should return null for invalid template ID', () => {
      const template = getTemplate('nonexistent_template');
      
      expect(template).toBeNull();
    });

    it('should return null for empty string template ID', () => {
      const template = getTemplate('');
      
      expect(template).toBeNull();
    });

    it('should return null for undefined template ID', () => {
      const template = getTemplate(undefined as any);
      
      expect(template).toBeNull();
    });

    it('should handle case-sensitive template IDs', () => {
      const template = getTemplate('WORKSHEET_3_QUESTIONS');
      
      expect(template).toBeNull();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all available templates', () => {
      const templates = getAllTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      
      // Check that all returned templates have required properties
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('placeholders');
        expect(Array.isArray(template.placeholders)).toBe(true);
      });
    });

    it('should return empty array when no templates exist', () => {
      // Clear all templates
      Object.keys(TEMPLATES).forEach(key => {
        delete (TEMPLATES as any)[key];
      });
      
      const templates = getAllTemplates();
      
      expect(templates).toEqual([]);
    });

    it('should return templates in correct format', () => {
      const templates = getAllTemplates();
      
      // Find the worksheet template
      const worksheetTemplate = templates.find(t => t.id === 'worksheet_3_questions');
      
      expect(worksheetTemplate).toBeDefined();
      expect(worksheetTemplate).toMatchObject({
        id: 'worksheet_3_questions',
        name: 'Basic Worksheet - 3 Questions',
        description: 'A simple worksheet with 3 questions and answer key'
      });
      expect(Array.isArray(worksheetTemplate?.placeholders)).toBe(true);
    });
  });

  describe('addTemplate', () => {
    it('should add a new template successfully', () => {
      const newTemplate: JSONTemplate = {
        id: 'lesson_plan',
        name: 'Lesson Plan Template',
        description: 'A comprehensive lesson plan template',
        placeholders: ['title', 'objectives', 'materials', 'procedures', 'assessment']
      };
      
      addTemplate('lesson_plan', newTemplate);
      
      const retrievedTemplate = getTemplate('lesson_plan');
      expect(retrievedTemplate).toEqual(newTemplate);
      
      const allTemplates = getAllTemplates();
      expect(allTemplates).toContainEqual(newTemplate);
    });

    it('should overwrite existing template with same ID', () => {
      const originalTemplate = getTemplate('worksheet_3_questions');
      expect(originalTemplate).toBeDefined();
      
      const updatedTemplate: JSONTemplate = {
        id: 'worksheet_3_questions',
        name: 'Updated Worksheet Template',
        description: 'An updated version of the worksheet template',
        placeholders: ['title', 'questions', 'answers']
      };
      
      addTemplate('worksheet_3_questions', updatedTemplate);
      
      const retrievedTemplate = getTemplate('worksheet_3_questions');
      expect(retrievedTemplate).toEqual(updatedTemplate);
      expect(retrievedTemplate).not.toEqual(originalTemplate);
    });

    it('should handle template with empty placeholders array', () => {
      const emptyTemplate: JSONTemplate = {
        id: 'empty_template',
        name: 'Empty Template',
        description: 'Template with no placeholders',
        placeholders: []
      };
      
      addTemplate('empty_template', emptyTemplate);
      
      const retrievedTemplate = getTemplate('empty_template');
      expect(retrievedTemplate).toEqual(emptyTemplate);
      expect(retrievedTemplate?.placeholders).toEqual([]);
    });

    it('should handle template with complex placeholders', () => {
      const complexTemplate: JSONTemplate = {
        id: 'complex_template',
        name: 'Complex Template',
        description: 'Template with complex placeholder structure',
        placeholders: [
          'header.title',
          'header.subtitle',
          'content.section1.title',
          'content.section1.content',
          'content.section2.title',
          'content.section2.content',
          'footer.notes'
        ]
      };
      
      addTemplate('complex_template', complexTemplate);
      
      const retrievedTemplate = getTemplate('complex_template');
      expect(retrievedTemplate).toEqual(complexTemplate);
      expect(retrievedTemplate?.placeholders).toHaveLength(7);
    });
  });

  describe('TEMPLATES constant', () => {
    it('should have the expected default template', () => {
      expect(TEMPLATES).toHaveProperty('worksheet_3_questions');
      
      const defaultTemplate = TEMPLATES.worksheet_3_questions;
      expect(defaultTemplate.id).toBe('worksheet_3_questions');
      expect(defaultTemplate.name).toBe('Basic Worksheet - 3 Questions');
      expect(defaultTemplate.description).toBe('A simple worksheet with 3 questions and answer key');
      expect(defaultTemplate.placeholders).toEqual([
        'worksheetTitle',
        'instructions', 
        'question1', 'question2', 'question3',
        'answer1', 'answer2', 'answer3'
      ]);
    });

    it('should maintain template structure integrity', () => {
      const template = TEMPLATES.worksheet_3_questions;
      
      // Verify all required properties exist
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('placeholders');
      
      // Verify property types
      expect(typeof template.id).toBe('string');
      expect(typeof template.name).toBe('string');
      expect(typeof template.description).toBe('string');
      expect(Array.isArray(template.placeholders)).toBe(true);
      
      // Verify placeholders are strings
      template.placeholders.forEach(placeholder => {
        expect(typeof placeholder).toBe('string');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should support full template lifecycle', () => {
      // 1. Start with default templates
      const initialTemplates = getAllTemplates();
      expect(initialTemplates.length).toBeGreaterThan(0);
      
      // 2. Add a new template
      const newTemplate: JSONTemplate = {
        id: 'quiz_template',
        name: 'Quiz Template',
        description: 'A quiz template with multiple choice questions',
        placeholders: ['title', 'question1', 'options1', 'answer1', 'question2', 'options2', 'answer2']
      };
      
      addTemplate('quiz_template', newTemplate);
      
      // 3. Verify template was added
      const retrievedTemplate = getTemplate('quiz_template');
      expect(retrievedTemplate).toEqual(newTemplate);
      
      // 4. Verify it appears in all templates
      const updatedTemplates = getAllTemplates();
      expect(updatedTemplates).toContainEqual(newTemplate);
      expect(updatedTemplates.length).toBe(initialTemplates.length + 1);
      
      // 5. Update the template
      const updatedTemplate: JSONTemplate = {
        ...newTemplate,
        description: 'Updated quiz template with better structure'
      };
      
      addTemplate('quiz_template', updatedTemplate);
      
      // 6. Verify update
      const finalTemplate = getTemplate('quiz_template');
      expect(finalTemplate).toEqual(updatedTemplate);
      expect(finalTemplate?.description).toBe('Updated quiz template with better structure');
    });

    it('should handle multiple template operations', () => {
      const templates = [
        {
          id: 'template1',
          name: 'Template 1',
          description: 'First template',
          placeholders: ['field1', 'field2']
        },
        {
          id: 'template2',
          name: 'Template 2',
          description: 'Second template',
          placeholders: ['field3', 'field4', 'field5']
        },
        {
          id: 'template3',
          name: 'Template 3',
          description: 'Third template',
          placeholders: []
        }
      ];
      
      // Add multiple templates
      templates.forEach(template => {
        addTemplate(template.id, template);
      });
      
      // Verify all were added
      templates.forEach(template => {
        const retrieved = getTemplate(template.id);
        expect(retrieved).toEqual(template);
      });
      
      // Verify count in getAllTemplates
      const allTemplates = getAllTemplates();
      const addedTemplates = allTemplates.filter(t => 
        templates.some(added => added.id === t.id)
      );
      expect(addedTemplates).toHaveLength(templates.length);
    });
  });
}); 