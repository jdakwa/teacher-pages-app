import { OpenAIResponse } from './types';
import { generateSystemPrompt, generatePromptFromResourceData } from './promptGenerator';
import { ResourceData } from './types';

// Construct API Gateway URL - support both base URL and full URL
const getApiGatewayUrl = () => {
  const baseUrl = process.env.AI_GATEWAY_URL || process.env.API_GATEWAY_URL || 'https://aigateway.avalern.com';
  // If URL already includes /api/generate, use it as-is; otherwise append it
  if (baseUrl.includes('/api/generate')) {
    return baseUrl;
  }
  return `${baseUrl.replace(/\/$/, '')}/api/generate`;
};
const API_GATEWAY_URL = getApiGatewayUrl();
// Hardcoded API key (fallback for backward compatibility)
const API_GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY || process.env.API_GATEWAY_KEY || 'ai-gateway-prod-a45e7d4519e9e2dc2e550b4a';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

export async function callOpenAI(prompt: string): Promise<OpenAIResponse> {
  if (!API_GATEWAY_KEY) {
    throw new Error('API Gateway key is not configured');
  }

  try {
    const systemPrompt = generateSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const response = await fetch(API_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_GATEWAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: OPENAI_MODEL,
        maxTokens: 2000,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Handle AI Gateway error response format
      const errorCode = data.code || 'UNKNOWN_ERROR';
      const errorMessage = data.error || 'Unknown error';
      throw new Error(`AI Gateway error: ${errorMessage} (${errorCode})`);
    }

    const content = data.output;
    if (!content) {
      throw new Error('No content received from API Gateway');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse API Gateway response as JSON: ${parseError}`);
    }

    return {
      content: parsedContent,
      usage: {
        prompt_tokens: data.usage?.inputTokens || 0,
        completion_tokens: data.usage?.outputTokens || 0,
        total_tokens: (data.usage?.inputTokens || 0) + (data.usage?.outputTokens || 0),
      }
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Gateway call failed: ${error.message}`);
    }
    throw new Error('API Gateway call failed with unknown error');
  }
}

export async function callOpenAIWithRetry(prompt: string, maxRetries: number = 3): Promise<OpenAIResponse> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callOpenAI(prompt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (400, 401) - these are validation/auth errors
      if (lastError.message.includes('VALIDATION_ERROR') || 
          lastError.message.includes('MISSING_AUTH_HEADER') ||
          lastError.message.includes('MISSING_API_KEY') ||
          lastError.message.includes('UNAUTHORIZED')) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

export async function callOpenAIWithResourceData(resourceData: ResourceData, templateName: string = 'WorksheetTemplate'): Promise<OpenAIResponse> {
  if (!API_GATEWAY_KEY) {
    throw new Error('API Gateway key is not configured');
  }

  try {
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generatePromptFromResourceData(resourceData, templateName);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;

    const response = await fetch(API_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_GATEWAY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        model: OPENAI_MODEL,
        maxTokens: 2000,
        temperature: 0.7
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      // Handle AI Gateway error response format
      const errorCode = data.code || 'UNKNOWN_ERROR';
      const errorMessage = data.error || 'Unknown error';
      throw new Error(`AI Gateway error: ${errorMessage} (${errorCode})`);
    }

    const content = data.output;
    if (!content) {
      throw new Error('No content received from API Gateway');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse API Gateway response as JSON: ${parseError}`);
    }

    return {
      content: parsedContent,
      usage: {
        prompt_tokens: data.usage?.inputTokens || 0,
        completion_tokens: data.usage?.outputTokens || 0,
        total_tokens: (data.usage?.inputTokens || 0) + (data.usage?.outputTokens || 0),
      }
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`API Gateway call failed: ${error.message}`);
    }
    throw new Error('API Gateway call failed with unknown error');
  }
}

export async function callOpenAIWithResourceDataAndRetry(resourceData: ResourceData, templateName: string = 'WorksheetTemplate', maxRetries: number = 3): Promise<OpenAIResponse> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callOpenAIWithResourceData(resourceData, templateName);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (400, 401) - these are validation/auth errors
      if (lastError.message.includes('VALIDATION_ERROR') || 
          lastError.message.includes('MISSING_AUTH_HEADER') ||
          lastError.message.includes('MISSING_API_KEY') ||
          lastError.message.includes('UNAUTHORIZED')) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

// Version that accepts API key as parameter (for user-provided keys)
export async function callOpenAIWithResourceDataAndRetryWithKey(
  resourceData: ResourceData, 
  templateName: string = 'WorksheetTemplate', 
  maxRetries: number = 3,
  apiKey: string
): Promise<OpenAIResponse> {
  // Construct API Gateway URL - support both base URL and full URL
  const getApiGatewayUrl = () => {
    const baseUrl = process.env.AI_GATEWAY_URL || process.env.API_GATEWAY_URL || 'https://aigateway.avalern.com';
    // If URL already includes /api/generate, use it as-is; otherwise append it
    if (baseUrl.includes('/api/generate')) {
      return baseUrl;
    }
    return `${baseUrl.replace(/\/$/, '')}/api/generate`;
  };
  const API_GATEWAY_URL = getApiGatewayUrl();
  const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const systemPrompt = generateSystemPrompt();
      const userPrompt = generatePromptFromResourceData(resourceData, templateName);
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;

      const response = await fetch(API_GATEWAY_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: OPENAI_MODEL,
          maxTokens: 2000,
          temperature: 0.7
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle AI Gateway error response format
        const errorCode = data.code || 'UNKNOWN_ERROR';
        const errorMessage = data.error || 'Unknown error';
        
        // Don't retry on client errors (400, 401)
        if (response.status === 400 || response.status === 401) {
          throw new Error(`AI Gateway error: ${errorMessage} (${errorCode})`);
        }
        
        // For server errors, throw error that can be retried
        throw new Error(`AI Gateway error: ${errorMessage} (${errorCode})`);
      }

      const content = data.output;
      if (!content) {
        throw new Error('No content received from API Gateway');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Failed to parse API Gateway response as JSON: ${parseError}`);
      }

      return {
        content: parsedContent,
        usage: {
          prompt_tokens: data.usage?.inputTokens || 0,
          completion_tokens: data.usage?.outputTokens || 0,
          total_tokens: (data.usage?.inputTokens || 0) + (data.usage?.outputTokens || 0),
        }
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry on client errors (400, 401) - these are validation/auth errors
      if (lastError.message.includes('VALIDATION_ERROR') || 
          lastError.message.includes('MISSING_AUTH_HEADER') ||
          lastError.message.includes('MISSING_API_KEY') ||
          lastError.message.includes('UNAUTHORIZED')) {
        throw lastError;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

export function estimateTokenCost(tokens: number, model: string = OPENAI_MODEL): number {
  const costPer1K = {
    'gpt-4o': 0.005,
    'gpt-4o-mini': 0.00015,
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.0005
  };

  const baseCost = costPer1K[model as keyof typeof costPer1K] || costPer1K['gpt-4o-mini'];
  return (tokens / 1000) * baseCost;
}