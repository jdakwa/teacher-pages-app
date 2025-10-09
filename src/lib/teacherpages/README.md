# TeacherPages Backend System

## Overview
TeacherPages is an AI-powered educational resource generator that creates standards-aligned worksheets, lesson plans, and quizzes. The backend system is designed to be lightweight and focused on AI content generation using structured templates.

## Architecture

### Core Components

1. **Types & Interfaces** (`types.ts`)
   - Defines all TypeScript interfaces for the system
   - Includes `GenerationRequest`, `JSONTemplate`, `GenerationResponse`, etc.

2. **Templates** (`templates.ts`)
   - Single template for 3-question worksheets
   - Simple structure with placeholders for content
   - No complex nested structures or styles

3. **State Standards** (`standards.ts`)
   - Educational standards for different states (CA, TX, NY)
   - Organized by subject type and grade level
   - Used to align generated content with curriculum requirements

4. **Validation** (`validators.ts`)
   - Input validation for generation requests
   - Ensures all required fields are present and valid
   - Validates state/subject/grade combinations

5. **Prompt Generation** (`promptGenerator.ts`)
   - Builds structured prompts for OpenAI
   - Incorporates state standards and template instructions
   - Ensures consistent AI output format

6. **OpenAI Integration** (`openaiCaller.ts`)
   - Handles communication with OpenAI API
   - Includes retry logic and error handling
   - Supports different models and cost estimation

7. **Content Processing** (`contentProcessor.ts`)
   - Utilities for manipulating generated content
   - Template merging and placeholder replacement
   - Content validation and formatting

8. **Server Actions** (`generateResource.ts`)
   - Main orchestration logic
   - Coordinates the entire generation process
   - Helper functions for getting available options

9. **API Routes** (`/api/teacherpages/generate`)
   - RESTful endpoint for resource generation
   - Input validation and error handling
   - Returns structured JSON responses

## How It Works

### 1. User Input
- User selects state, subject type, grade level, and template
- User provides subject, main topic, and sub topic
- All inputs are validated against available options

### 2. Prompt Generation
- System builds a structured prompt using the template
- Incorporates relevant state standards
- Ensures proper formatting for AI consumption

### 3. AI Generation
- Prompt is sent to OpenAI API
- AI generates content matching the template structure
- Response is validated for completeness

### 4. Content Processing
- Generated content is merged with template structure
- Placeholders are replaced with actual content
- Final response includes template, content, and metadata

## Template System

### Template Structure
The current template includes:
- **Simple Structure**: 3 questions + instructions + answer key
- **Content Fields**: 8 specific fields for worksheet content
- **No Complex Nesting**: Flat structure for easy processing

### Available Templates
1. **worksheet_3_questions**: Basic worksheet with 3 questions and answer key
   - Simple structure for easy PDF generation
   - Works for any subject and grade level
   - AI adapts content automatically

## State Standards Integration

### Supported States
- **CA (California)**: Full coverage for K-5 in all subjects
- **TX (Texas)**: Mathematics coverage for K-1st
- **NY (New York)**: Mathematics coverage for K

### Subject Types
- Mathematics
- English Language Arts
- Science
- Social Studies

### Grade Levels
- K, 1st, 2nd, 3rd, 4th, 5th

## API Usage

### Generate Resource
```http
POST /api/teacherpages/generate
Content-Type: application/json

{
  "gradeLevel": "2nd",
  "subjectType": "Mathematics",
  "subject": "Addition",
  "state": "CA",
  "mainTopic": "Basic Addition",
  "subTopic": "Single Digit Addition",
  "template": "worksheet_3_questions"
}
```

### Response Format
```json
{
  "content": {
    "worksheetTitle": "Fun Addition Practice for 2nd Graders",
    "instructions": "Solve each addition problem...",
    "question1": "What is 7 + 5?",
    "question2": "Solve: 9 + 3 = ?",
    "question3": "How much is 6 + 4?",
    "answer1": "12",
    "answer2": "12",
    "answer3": "10"
  },
  "metadata": {
    "gradeLevel": "2nd",
    "subject": "Addition",
    "generatedAt": "2024-01-15T10:30:00Z",
    "requestId": "req_1705312200000_abc123def"
  }
}
```

## Environment Variables

Required environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # optional, defaults to gpt-4o-mini
```

## Error Handling

The system handles various error types:
- **Validation Errors**: Missing or invalid input fields
- **Template Errors**: Requested template not found
- **OpenAI Errors**: API failures or rate limiting
- **Processing Errors**: Content validation failures

## Extensibility

### Adding New Templates
1. Define template structure in `templates.ts`
2. Add corresponding prompt instructions
3. Define required placeholders
4. Update types if needed

### Adding New States
1. Add state data to `standards.ts`
2. Include subject types and grade levels
3. Add corresponding standards

### Customizing AI Prompts
1. Modify `promptGenerator.ts`
2. Adjust system prompts in `openaiCaller.ts`
3. Update template instructions

## Performance Considerations

- **Caching**: Templates and standards are loaded once at startup
- **Retry Logic**: OpenAI API calls include exponential backoff
- **Validation**: Input validation happens before expensive API calls
- **Error Handling**: Graceful degradation for service failures

## Security

- **Input Validation**: All user inputs are sanitized and validated
- **API Key Protection**: OpenAI API key is stored in environment variables
- **Error Sanitization**: Internal errors are not exposed to users
- **Rate Limiting**: Built-in retry logic prevents API abuse

## Testing

The backend can be tested using:
1. **Direct Function Calls**: Test individual functions
2. **API Endpoints**: Test via HTTP requests
3. **Frontend Integration**: Test through the UI
4. **Error Scenarios**: Test validation and error handling

## Future Enhancements

Potential improvements:
- **Template Management**: Admin interface for creating/editing templates
- **Content Caching**: Store generated content for reuse
- **User Preferences**: Save user settings and history
- **Batch Generation**: Generate multiple resources at once
- **Export Formats**: Support for different output formats
- **Analytics**: Track usage and generation patterns 