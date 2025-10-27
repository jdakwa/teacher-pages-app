import { NextRequest, NextResponse } from 'next/server';
import { callOpenAIWithResourceDataAndRetry } from '@/lib/teacherpages/openaiCaller';
import { ResourceData } from '@/lib/teacherpages/types';

export async function POST(request: NextRequest) {
  try {
    const resourceData: ResourceData = await request.json();
    
    const response = await callOpenAIWithResourceDataAndRetry(resourceData);
    
    return NextResponse.json({
      success: true,
      content: response.content,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
