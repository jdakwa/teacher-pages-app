import { NextRequest, NextResponse } from 'next/server';
import { callOpenAIWithResourceDataAndRetryWithKey } from '@/lib/teacherpages/openaiCaller';
import { ResourceData } from '@/lib/teacherpages/types';

export async function POST(request: NextRequest) {
  try {
    const resourceData: ResourceData = await request.json();
    
    // Use hardcoded key or environment variable
    const apiGatewayKey = process.env.API_GATEWAY_KEY || 'ai-gateway-prod-a45e7d4519e9e2dc2e550b4a';
    
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

