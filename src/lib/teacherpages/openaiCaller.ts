import { OpenAIResponse } from './types';
import { generateSystemPrompt, generatePromptFromResourceData } from './promptGenerator';
import { ResourceData } from './types';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function callOpenAI(prompt: string): Promise<OpenAIResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const systemPrompt = generateSystemPrompt();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON content
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
    }

    return {
      content: parsedContent,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      }
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
    throw new Error('OpenAI API call failed with unknown error');
  }
}

export async function callOpenAIWithRetry(prompt: string, maxRetries: number = 3): Promise<OpenAIResponse> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callOpenAI(prompt);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

export async function callOpenAIWithResourceData(resourceData: ResourceData, templateName: string = 'WorksheetTemplate'): Promise<OpenAIResponse> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const systemPrompt = generateSystemPrompt();
    const userPrompt = generatePromptFromResourceData(resourceData, templateName);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Extract the content from the response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Parse the JSON content
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
    }

    return {
      content: parsedContent,
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      }
    };

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API call failed: ${error.message}`);
    }
    throw new Error('OpenAI API call failed with unknown error');
  }
}

export async function callOpenAIWithResourceDataAndRetry(resourceData: ResourceData, templateName: string = 'WorksheetTemplate', maxRetries: number = 3): Promise<OpenAIResponse> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callOpenAIWithResourceData(resourceData, templateName);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError!;
}

export function estimateTokenCost(tokens: number, model: string = OPENAI_MODEL): number {
  // Rough cost estimates per 1K tokens (as of 2024)
  const costPer1K = {
    'gpt-4o': 0.005,
    'gpt-4o-mini': 0.00015,
    'gpt-4-turbo': 0.01,
    'gpt-3.5-turbo': 0.0005
  };
  
  const baseCost = costPer1K[model as keyof typeof costPer1K] || costPer1K['gpt-4o-mini'];
  return (tokens / 1000) * baseCost;
} 