import { 
  getRelevantStandards, 
  getAvailableStates, 
  getAvailableSubjects, 
  getAvailableGrades,
  STATE_STANDARDS 
} from '@/app/lib/teacherpages/standards';

describe('TeacherPages Standards', () => {
  describe('getAvailableStates', () => {
    it('should return all available states', () => {
      const states = getAvailableStates();
      
      expect(states).toBeInstanceOf(Array);
      expect(states.length).toBeGreaterThan(0);
      expect(states).toContain('CA');
      expect(states).toContain('TX');
      expect(states).toContain('NY');
    });

    it('should return states in correct format', () => {
      const states = getAvailableStates();
      
      states.forEach(state => {
        expect(typeof state).toBe('string');
        expect(state.length).toBe(2); // State codes are 2 characters
        expect(state).toMatch(/^[A-Z]{2}$/); // State codes are uppercase letters
      });
    });

    it('should include expected states', () => {
      const states = getAvailableStates();
      
      // Check for specific states we know exist
      expect(states).toContain('CA');
      expect(states).toContain('TX');
      expect(states).toContain('NY');
    });
  });

  describe('getAvailableSubjects', () => {
    it('should return subjects for valid state', () => {
      const subjects = getAvailableSubjects('CA');
      
      expect(subjects).toBeInstanceOf(Array);
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects).toContain('Mathematics');
      expect(subjects).toContain('English Language Arts');
      expect(subjects).toContain('Science');
      expect(subjects).toContain('Social Studies');
    });

    it('should return subjects for another valid state', () => {
      const subjects = getAvailableSubjects('TX');
      
      expect(subjects).toBeInstanceOf(Array);
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects).toContain('Mathematics');
    });

    it('should return empty array for invalid state', () => {
      const subjects = getAvailableSubjects('INVALID');
      
      expect(subjects).toEqual([]);
    });

    it('should return empty array for empty string state', () => {
      const subjects = getAvailableSubjects('');
      
      expect(subjects).toEqual([]);
    });

    it('should return empty array for undefined state', () => {
      const subjects = getAvailableSubjects(undefined as any);
      
      expect(subjects).toEqual([]);
    });

    it('should handle case sensitivity', () => {
      const subjects = getAvailableSubjects('ca'); // lowercase
      
      expect(subjects).toEqual([]);
    });
  });

  describe('getAvailableGrades', () => {
    it('should return grades for valid state and subject', () => {
      const grades = getAvailableGrades('CA', 'Mathematics');
      
      expect(grades).toBeInstanceOf(Array);
      expect(grades.length).toBeGreaterThan(0);
      expect(grades).toContain('K');
      expect(grades).toContain('1st');
      expect(grades).toContain('2nd');
      expect(grades).toContain('3rd');
      expect(grades).toContain('4th');
      expect(grades).toContain('5th');
    });

    it('should return grades for another valid combination', () => {
      const grades = getAvailableGrades('CA', 'English Language Arts');
      
      expect(grades).toBeInstanceOf(Array);
      expect(grades.length).toBeGreaterThan(0);
      expect(grades).toContain('K');
      expect(grades).toContain('1st');
      expect(grades).toContain('2nd');
      expect(grades).toContain('3rd');
      expect(grades).toContain('4th');
      expect(grades).toContain('5th');
    });

    it('should return empty array for invalid state', () => {
      const grades = getAvailableGrades('INVALID', 'Mathematics');
      
      expect(grades).toEqual([]);
    });

    it('should return empty array for invalid subject', () => {
      const grades = getAvailableGrades('CA', 'InvalidSubject');
      
      expect(grades).toEqual([]);
    });

    it('should return empty array for invalid state and subject combination', () => {
      const grades = getAvailableGrades('INVALID', 'InvalidSubject');
      
      expect(grades).toEqual([]);
    });

    it('should return empty array for empty string inputs', () => {
      const grades = getAvailableGrades('', 'Mathematics');
      expect(grades).toEqual([]);
      
      const grades2 = getAvailableGrades('CA', '');
      expect(grades2).toEqual([]);
    });

    it('should handle case sensitivity', () => {
      const grades = getAvailableGrades('ca', 'mathematics'); // lowercase
      
      expect(grades).toEqual([]);
    });
  });

  describe('getRelevantStandards', () => {
    it('should return standards for valid state, subject, and grade', () => {
      const standards = getRelevantStandards('CA', 'Mathematics', '2nd');
      
      expect(standards).toBeInstanceOf(Array);
      expect(standards.length).toBeGreaterThan(0);
      
      // Check for specific standards we know exist
      expect(standards).toContain('2.OA.A.1 - Use addition and subtraction within 100');
      expect(standards).toContain('2.OA.B.2 - Fluently add and subtract within 20');
      expect(standards).toContain('2.NBT.A.1 - Understand place value');
      expect(standards).toContain('2.NBT.B.5 - Fluently add and subtract within 100');
      expect(standards).toContain('2.MD.A.1 - Measure and estimate lengths');
    });

    it('should return standards for another valid combination', () => {
      const standards = getRelevantStandards('CA', 'English Language Arts', '3rd');
      
      expect(standards).toBeInstanceOf(Array);
      expect(standards.length).toBeGreaterThan(0);
      
      expect(standards).toContain('3.RL.1 - Ask and answer questions about key details');
      expect(standards).toContain('3.RL.2 - Recount stories and determine central message');
      expect(standards).toContain('3.RL.3 - Describe characters and explain actions');
      expect(standards).toContain('3.RF.1 - Demonstrate understanding of organization');
      expect(standards).toContain('3.RF.2 - Demonstrate understanding of spoken words');
    });

    it('should return standards for kindergarten', () => {
      const standards = getRelevantStandards('CA', 'Mathematics', 'K');
      
      expect(standards).toBeInstanceOf(Array);
      expect(standards.length).toBeGreaterThan(0);
      
      expect(standards).toContain('K.CC.A.1 - Count to 100 by ones and by tens');
      expect(standards).toContain('K.CC.A.2 - Count forward beginning from a given number');
      expect(standards).toContain('K.CC.A.3 - Write numbers from 0 to 20');
      expect(standards).toContain('K.OA.A.1 - Represent addition and subtraction with objects');
      expect(standards).toContain('K.OA.A.2 - Solve addition and subtraction word problems');
    });

    it('should return standards for 5th grade', () => {
      const standards = getRelevantStandards('CA', 'Mathematics', '5th');
      
      expect(standards).toBeInstanceOf(Array);
      expect(standards.length).toBeGreaterThan(0);
      
      expect(standards).toContain('5.NBT.A.1 - Recognize place value');
      expect(standards).toContain('5.NBT.B.5 - Fluently multiply multi-digit whole numbers');
      expect(standards).toContain('5.NF.A.1 - Add and subtract fractions');
      expect(standards).toContain('5.MD.A.1 - Convert among different-sized measurement units');
      expect(standards).toContain('5.G.A.1 - Use a pair of perpendicular number lines');
    });

    it('should return empty array for invalid state', () => {
      const standards = getRelevantStandards('INVALID', 'Mathematics', '2nd');
      
      expect(standards).toEqual([]);
    });

    it('should return empty array for invalid subject', () => {
      const standards = getRelevantStandards('CA', 'InvalidSubject', '2nd');
      
      expect(standards).toEqual([]);
    });

    it('should return empty array for invalid grade', () => {
      const standards = getRelevantStandards('CA', 'Mathematics', 'InvalidGrade');
      
      expect(standards).toEqual([]);
    });

    it('should return empty array for invalid combination', () => {
      const standards = getRelevantStandards('INVALID', 'InvalidSubject', 'InvalidGrade');
      
      expect(standards).toEqual([]);
    });

    it('should handle case sensitivity', () => {
      const standards = getRelevantStandards('ca', 'mathematics', '2nd'); // lowercase
      
      expect(standards).toEqual([]);
    });

    it('should handle empty string inputs', () => {
      const standards = getRelevantStandards('', 'Mathematics', '2nd');
      expect(standards).toEqual([]);
      
      const standards2 = getRelevantStandards('CA', '', '2nd');
      expect(standards2).toEqual([]);
      
      const standards3 = getRelevantStandards('CA', 'Mathematics', '');
      expect(standards3).toEqual([]);
    });
  });

  describe('STATE_STANDARDS constant', () => {
    it('should have the expected structure', () => {
      expect(STATE_STANDARDS).toBeDefined();
      expect(typeof STATE_STANDARDS).toBe('object');
      
      // Check for expected states
      expect(STATE_STANDARDS).toHaveProperty('CA');
      expect(STATE_STANDARDS).toHaveProperty('TX');
      expect(STATE_STANDARDS).toHaveProperty('NY');
    });

    it('should have correct structure for CA state', () => {
      const caStandards = (STATE_STANDARDS as any)['CA'];
      
      expect(caStandards).toBeDefined();
      expect(caStandards).toHaveProperty('Mathematics');
      expect(caStandards).toHaveProperty('English Language Arts');
      expect(caStandards).toHaveProperty('Science');
      expect(caStandards).toHaveProperty('Social Studies');
    });

    it('should have correct structure for Mathematics subject', () => {
      const mathStandards = (STATE_STANDARDS as any)['CA']['Mathematics'];
      
      expect(mathStandards).toBeDefined();
      expect(mathStandards).toHaveProperty('K');
      expect(mathStandards).toHaveProperty('1st');
      expect(mathStandards).toHaveProperty('2nd');
      expect(mathStandards).toHaveProperty('3rd');
      expect(mathStandards).toHaveProperty('4th');
      expect(mathStandards).toHaveProperty('5th');
    });

    it('should have standards content for specific grade and subject', () => {
      const standards = (STATE_STANDARDS as any)['CA']['Mathematics']['2nd'];
      
      expect(standards).toBeInstanceOf(Array);
      expect(standards.length).toBeGreaterThan(0);
      
      // Check that standards are strings with expected format
      standards.forEach(standard => {
        expect(typeof standard).toBe('string');
        expect(standard).toMatch(/^2\.[A-Z]+\.[A-Z]+\d+ - .+/); // Format: 2.OA.A.1 - Description
      });
    });

    it('should have consistent structure across states', () => {
      const states = Object.keys(STATE_STANDARDS);
      
      states.forEach(state => {
        const stateStandards = (STATE_STANDARDS as any)[state];
        expect(typeof stateStandards).toBe('object');
        
        const subjects = Object.keys(stateStandards);
        subjects.forEach(subject => {
          const subjectStandards = stateStandards[subject];
          expect(typeof subjectStandards).toBe('object');
          
          const grades = Object.keys(subjectStandards);
          grades.forEach(grade => {
            const gradeStandards = subjectStandards[grade];
            expect(Array.isArray(gradeStandards)).toBe(true);
            
            gradeStandards.forEach(standard => {
              expect(typeof standard).toBe('string');
              expect(standard.length).toBeGreaterThan(0);
            });
          });
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work together for complete standards lookup', () => {
      // 1. Get available states
      const states = getAvailableStates();
      expect(states.length).toBeGreaterThan(0);
      
      // 2. Get subjects for a specific state
      const state = states[0]; // Use first available state
      const subjects = getAvailableSubjects(state);
      expect(subjects.length).toBeGreaterThan(0);
      
      // 3. Get grades for a specific state and subject
      const subject = subjects[0]; // Use first available subject
      const grades = getAvailableGrades(state, subject);
      expect(grades.length).toBeGreaterThan(0);
      
      // 4. Get standards for the complete combination
      const grade = grades[0]; // Use first available grade
      const standards = getRelevantStandards(state, subject, grade);
      expect(standards.length).toBeGreaterThan(0);
      
      // 5. Verify the complete flow works
      expect(states).toContain(state);
      expect(subjects).toContain(subject);
      expect(grades).toContain(grade);
      expect(standards.length).toBeGreaterThan(0);
    });

    it('should handle edge cases gracefully', () => {
      // Test with various invalid inputs
      const invalidInputs = [
        { state: '', subject: 'Mathematics', grade: '2nd' },
        { state: 'CA', subject: '', grade: '2nd' },
        { state: 'CA', subject: 'Mathematics', grade: '' },
        { state: 'INVALID', subject: 'Mathematics', grade: '2nd' },
        { state: 'CA', subject: 'INVALID', grade: '2nd' },
        { state: 'CA', subject: 'Mathematics', grade: 'INVALID' },
        { state: null as any, subject: 'Mathematics', grade: '2nd' },
        { state: 'CA', subject: null as any, grade: '2nd' },
        { state: 'CA', subject: 'Mathematics', grade: null as any },
        { state: undefined as any, subject: 'Mathematics', grade: '2nd' },
        { state: 'CA', subject: undefined as any, grade: '2nd' },
        { state: 'CA', subject: 'Mathematics', grade: undefined as any }
      ];
      
      invalidInputs.forEach(({ state, subject, grade }) => {
        const standards = getRelevantStandards(state, subject, grade);
        expect(standards).toEqual([]);
      });
    });
  });
}); 