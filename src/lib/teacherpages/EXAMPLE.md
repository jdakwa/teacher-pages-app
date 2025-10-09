# TeacherPages Library Usage Examples

This document provides examples of how to use the TeacherPages library for generating educational content.

## Basic Usage with GenerationRequest

```typescript
import { generateTeacherResource } from '@/actions/teacherpages/generateResource';
import { GenerationRequest } from '@/app/lib/teacherpages/types';

const request: GenerationRequest = {
  gradeLevel: "2nd",
  subjectType: "Mathematics",
  subject: "Addition",
  state: "CA",
  mainTopic: "Basic Addition",
  subTopic: "Single Digit Addition",
  template: "ThreeQuestionTemplate"
};

try {
  const result = await generateTeacherResource(request);
  console.log('Generated content:', result.content);
  console.log('Metadata:', result.metadata);
} catch (error) {
  console.error('Generation failed:', error);
}
```

## New: Usage with ResourceData (from ResourceGenerator)

```typescript
import { generateTeacherResourceFromResourceData } from '@/actions/teacherpages/generateResource';
import { ResourceData } from '@/app/lib/teacherpages/types';

const resourceData: ResourceData = {
  level: "Elementary School",
  grade: "2nd",
  subject: "Mathematics",
  topic: "Addition & Subtraction within 100",
  state: "CA",
  resourceType: "worksheet"
};

try {
  const result = await generateTeacherResourceFromResourceData(resourceData);
  console.log('Generated content:', result.content);
  console.log('Metadata:', result.metadata);
} catch (error) {
  console.error('Generation failed:', error);
}
```

## Direct OpenAI Calls

### Using GenerationRequest
```typescript
import { callOpenAIWithRetry } from '@/app/lib/teacherpages/openaiCaller';
import { generatePrompt } from '@/app/lib/teacherpages/promptGenerator';
import { GenerationRequest } from '@/app/lib/teacherpages/types';

const request: GenerationRequest = {
  gradeLevel: "3rd",
  subjectType: "Science",
  subject: "Life Cycles",
  state: "TX",
  mainTopic: "Butterfly Life Cycle",
  subTopic: "Metamorphosis",
  template: "ThreeQuestionTemplate"
};

const prompt = generatePrompt(request);
const response = await callOpenAIWithRetry(prompt);
console.log('OpenAI response:', response.content);
```

### Using ResourceData
```typescript
import { callOpenAIWithResourceDataAndRetry } from '@/app/lib/teacherpages/openaiCaller';
import { ResourceData } from '@/app/lib/teacherpages/types';

const resourceData: ResourceData = {
  level: "Elementary School",
  grade: "3rd",
  subject: "Science",
  topic: "Butterfly Life Cycle",
  state: "TX",
  resourceType: "worksheet"
};

const response = await callOpenAIWithResourceDataAndRetry(resourceData);
console.log('OpenAI response:', response.content);
```

## Integration with ResourceGenerator Component

You can now easily integrate the TeacherPages library with your ResourceGenerator component:

```typescript
// In your ResourceGenerator component
const handleGenerateResource = async () => {
  if (!selectedLevel || !selectedGrade || !selectedSubject || !selectedTopic) {
    alert('Please fill in all required fields');
    return;
  }

  setIsGenerating(true);

  try {
    const resourceData = {
      level: selectedLevel,
      grade: selectedGrade,
      subject: selectedSubject,
      topic: selectedTopic,
      state: selectedState,
      resourceType: resourceType,
    };

    // Generate content using TeacherPages
    const result = await generateTeacherResourceFromResourceData(resourceData);
    
    // Use the generated content in your PDF template
    const doc = <ThreeQuestionTemplate 
      resourceData={resourceData} 
      generatedContent={result.content} 
    />;

    // Generate PDF blob
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resourceData.subject}-${resourceData.topic}-${resourceData.resourceType}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);

    console.log('PDF generated successfully with AI content:', result.content);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error generating PDF. Please try again.');
  } finally {
    setIsGenerating(false);
  }
};
```

## Testing with CURL

You can test the OpenAI integration directly using CURL:

```bash
# Test with ResourceData structure
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "You are TeacherPages, an AI-powered educational content generator..."
      },
      {
        "role": "user",
        "content": "Generate a worksheet for 2nd grade Mathematics students about Addition & Subtraction within 100. School Level: Elementary School, State: CA, Resource Type: worksheet"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 2000,
    "response_format": { "type": "json_object" }
  }'
```

## Available Templates

- `ThreeQuestionTemplate` - Default template with 3 questions and answers
- Add more templates as needed in `templates.ts`

## Error Handling

The library includes comprehensive error handling:

```typescript
try {
  const result = await generateTeacherResourceFromResourceData(resourceData);
  // Success
} catch (error) {
  if (error.message.includes('Validation failed')) {
    // Handle validation errors
  } else if (error.message.includes('OpenAI API error')) {
    // Handle API errors
  } else if (error.message.includes('Template not found')) {
    // Handle template errors
  } else {
    // Handle other errors
  }
}
```

## State Standards Integration

The library automatically includes relevant state standards when available:

```typescript
// The prompt will automatically include standards like:
// "CCSS.MATH.CONTENT.2.NBT.B.5: Fluently add and subtract within 100..."
```

This integration ensures that generated content aligns with educational standards. 