import { OpenAIResponse } from './types';
import { generateSystemPrompt, generatePromptFromResourceData } from './promptGenerator';
import { ResourceData } from './types';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'https://aigateway.avalern.com/api/generate';
// Hardcoded API key
const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || 'ai-gateway-prod-a45e7d4519e9e2dc2e550b4a';
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
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Gateway error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`API Gateway returned error: ${data.error || 'Unknown error'}`);
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
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Gateway error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`API Gateway returned error: ${data.error || 'Unknown error'}`);
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
  const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'https://aigateway.avalern.com/api/generate';
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
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Gateway error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(`API Gateway returned error: ${data.error || 'Unknown error'}`);
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