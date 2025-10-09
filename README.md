# Teacher Pages App

AI-powered educational resource generator for teachers - part of the PDBrite organization.

## Features

- Generate standards-aligned worksheets, lesson plans, and quizzes
- Support for multiple states (CA, TX, NY)
- AI-powered content generation using OpenAI
- Simple, focused interface for teachers

## Getting Started

```bash
npm install
npm run dev
```

## API

### Generate Resource
```http
POST /api/generate
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

## Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key
```

## License

Private - PDBrite Organization

