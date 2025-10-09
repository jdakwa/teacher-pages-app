import { NextRequest, NextResponse } from 'next/server';
import { generateTeacherResource } from '@/lib/generateResource';
import { GenerationRequest } from '@/lib/teacherpages/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    // Validate the request structure
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Extract and validate required fields
    const { gradeLevel, subjectType, subject, state, mainTopic, subTopic, template } = body;

    if (!gradeLevel || !subjectType || !subject || !state || !mainTopic || !subTopic || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: gradeLevel, subjectType, subject, state, mainTopic, subTopic, template' },
        { status: 400 }
      );
    }

    // Create the generation request
    const generationRequest: GenerationRequest = {
      gradeLevel,
      subjectType,
      subject,
      state,
      mainTopic,
      subTopic,
      template
    };

    // Generate the resource
    const result = await generateTeacherResource(generationRequest);

    // Return the successful response
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Template') && error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('OpenAI API')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'TeacherPages Generation API',
      usage: 'POST with gradeLevel, subjectType, subject, state, mainTopic, subTopic, and template',
      availableMethods: ['POST']
    },
    { status: 200 }
  );
} 