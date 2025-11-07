import { NextRequest, NextResponse } from 'next/server';
import { callOpenAIWithResourceDataAndRetryWithKey } from '@/lib/teacherpages/openaiCaller';
import { ResourceData } from '@/lib/teacherpages/types';

export async function POST(request: NextRequest) {
  try {
    const resourceData: ResourceData = await request.json();
    
    // Use hardcoded key or environment variable
    const apiGatewayKey = process.env.API_GATEWAY_KEY || 'sk-avalern-7f3a9b2c4d5e6f8a1b3c4d5e6f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6';
    
    const response = await callOpenAIWithResourceDataAndRetryWithKey(resourceData, 'WorksheetTemplate', 3, apiGatewayKey);
    
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

