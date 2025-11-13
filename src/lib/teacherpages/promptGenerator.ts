import { GenerationRequest, JSONTemplate, ResourceData } from './types';
import { getTemplate } from './templates';
import { getRelevantStandards } from './standards';

export function generatePrompt(request: GenerationRequest): string {
  const template = getTemplate(request.template);
  if (!template) {
    throw new Error(`Template '${request.template}' not found`);
  }

  // Get relevant state standards
  const standards = getRelevantStandards(request.state, request.subjectType, request.gradeLevel);

  // Build the base prompt
  let prompt = buildBasePrompt(request, template);

  // Add state standards if available
  if (standards.length > 0) {
    prompt += buildStandardsSection(standards);
  }

  // Add output format requirements
  prompt += buildOutputFormatRequirements(template);

  return prompt;
}

export function generatePromptFromResourceData(resourceData: ResourceData, templateName: string = 'WorksheetTemplate'): string {
  const template = getTemplate(templateName);
  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  // No state filtering for standards; use general guidance only
  const standards: string[] = [];

  // Build the base prompt
  let prompt = buildBasePromptFromResourceData(resourceData, template);

  // Add general standards note and difficulty guidance
  prompt += buildGeneralStandardsNote();
  prompt += buildDifficultyGuidance(resourceData.difficulty ?? 3);

  // Add output format requirements
  prompt += buildOutputFormatRequirements(template);

  return prompt;
}

function buildBasePrompt(request: GenerationRequest, template: JSONTemplate): string {
  return `You are an expert teacher creating educational content for ${request.gradeLevel} grade ${request.subjectType} students.

CONTEXT:
- Grade Level: ${request.gradeLevel}
- Subject Type: ${request.subjectType}
- Main Topic: ${request.mainTopic}
- Sub Topic: ${request.subTopic}
- State: ${request.state}
- Template Type: ${template.name}

TASK: Generate a worksheet with exactly 3 questions about ${request.mainTopic}. Include clear instructions and an answer key. Make the questions appropriate for ${request.gradeLevel} grade level.

IMPORTANT: Your response must be structured as a JSON object with the following keys:
${template.placeholders.map(placeholder => `- ${placeholder}`).join('\n')}

`;
}

function buildBasePromptFromResourceData(resourceData: ResourceData, template: JSONTemplate): string {
  let prompt = `You are an expert teacher creating educational content for ${resourceData.grade} grade ${resourceData.subject} students.

CONTEXT:
- School Level: ${resourceData.level}
- Grade Level: ${resourceData.grade}
- Subject: ${resourceData.subject}
- Topic: ${resourceData.topic}
- Standards Context: General (no state-specific alignment)
- Resource Type: ${resourceData.resourceType}
- Template Type: ${template.name}
 - Difficulty Level (1-5): ${resourceData.difficulty ?? 3}

TASK: Generate a ${resourceData.resourceType} with exactly 5 questions about ${resourceData.topic}. Include clear instructions and an answer key. Make the questions appropriate for ${resourceData.grade} grade level in ${resourceData.level}.

MATHEMATICAL NOTATION: Use proper mathematical notation in your questions and answers:
- Inverse trig functions: sin^(-1), cos^(-1), tan^(-1) (NOT arcsin, arccos, arctan)
- Exponents: x^2, x^3, e^(2x) (use ^ for powers)
- Subscripts: H_2O, CO_2, Ca(OH)_2 (use _ for subscripts)
- Square roots: sqrt(16), sqrt(x) (use sqrt)
- Fractions: 1/2, 3/4, 2/3 (simple fractions)
- Greek letters: pi, theta, alpha, beta (spell out)
- Chemical reactions: -> for reactions, <-> for reversible
- Ion charges: H^+, OH^-, SO4^2-, Ca^2+

EXAMPLES:
✓ "Find sin^(-1)(1/2)" - CORRECT
✓ "If cos^(-1)(x) = pi/3" - CORRECT  
✓ "Calculate tan^(-1)(sqrt(3))" - CORRECT
✗ "Find arcsin(1/2)" - WRONG (use sin^(-1) instead)
✗ "Calculate arctan(√3)" - WRONG (use tan^(-1)(sqrt(3)) instead)

IMPORTANT: Your response must be structured as a JSON object with the following keys:
${template.placeholders.map(placeholder => `- ${placeholder}`).join('\n')}

`;



  return prompt;
}

function buildStandardsSection(standards: string[]): string {
  return `STATE STANDARDS TO ALIGN WITH:
${standards.map(standard => `- ${standard}`).join('\n')}

Ensure your content aligns with these standards and is appropriate for the specified grade level.

`;
}

function buildGeneralStandardsNote(): string {
  return `STANDARDS CONTEXT:
- No specific state provided. Align content with generally accepted grade-level standards for the subject.
- Ensure clarity, rigor, and appropriateness for the specified grade and school level.

`;
}

function buildDifficultyGuidance(level: number): string {
  const guidance = {
    1: `DIFFICULTY TARGET: 1 (Easiest)
- Use simple, single-step questions
- Provide scaffolding and clear hints
- Prefer concrete numbers/examples

`,
    2: `DIFFICULTY TARGET: 2
- Mostly single-step with mild variation
- Include subtle prompts towards the method
- Maintain straightforward language

`,
    3: `DIFFICULTY TARGET: 3 (Moderate)
- Mix single- and multi-step reasoning
- Avoid trivial prompts; encourage explanation in answers
- Introduce moderate variation in contexts

`,
    4: `DIFFICULTY TARGET: 4
- Primarily multi-step questions
- Require strategic thinking and justification
- Use less obvious setups and distractors

`,
    5: `DIFFICULTY TARGET: 5 (Hardest)
- Multi-step, rigorous reasoning required
- Minimal scaffolding; emphasize abstraction/transfer
- Allow for extension or generalization prompts

`
  } as Record<number, string>;

  return guidance[level] || guidance[3];
}



function buildOutputFormatRequirements(template: JSONTemplate): string {
  return `OUTPUT REQUIREMENTS:
1. Return ONLY a valid JSON object
2. Use the exact keys specified above
3. Make content engaging and age-appropriate
4. Ensure all placeholders are filled with meaningful content
5. Content should be educational and aligned with standards
6. Keep responses concise but comprehensive

EXAMPLE OUTPUT FORMAT:
{
  "worksheetTitle": "Your title here",
  "instructions": "Your instructions here",
  "question1": "Your first question here",
  // ... fill all required fields
}

Now generate the content following these requirements:`;
}

export function generateSystemPrompt(): string {
  return `You are TeacherPages, an AI-powered educational content generator. Your role is to create high-quality, standards-aligned educational materials for teachers.

Key responsibilities:
- Generate engaging, age-appropriate content
- Align with state educational standards
- Follow template specifications exactly
- Provide structured, consistent output
- Ensure educational value and accuracy
- Use proper mathematical and scientific notation

MATHEMATICAL NOTATION GUIDELINES:
- Inverse trig functions: sin^(-1), cos^(-1), tan^(-1) (NOT arcsin, arccos, arctan)
- Exponents: x^2, x^3, e^(2x) (use ^ for powers)
- Subscripts: H_2O, CO_2, Ca(OH)_2 (use _ for subscripts)
- Square roots: sqrt(16), sqrt(x) (use sqrt, not √)
- Fractions: 1/2, 3/4, 2/3 (simple fractions)
- Greek letters: pi, theta, alpha, beta (spell out, not symbols)
- Chemical reactions: -> for reactions, <-> for reversible
- Ion charges: H^+, OH^-, SO4^2-, Ca^2+

CRITICAL: Always use sin^(-1), cos^(-1), tan^(-1) format, NEVER arcsin, arccos, arctan!

Always respond with valid JSON that matches the requested template structure.`;
}