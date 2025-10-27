import { callOpenAI, callOpenAIWithRetry, estimateTokenCost } from '@/app/lib/teacherpages/openaiCaller';
import { OpenAIResponse } from '@/app/lib/teacherpages/types';

// Mock the dependencies
jest.mock('@/app/lib/teacherpages/promptGenerator', () => ({
  generateSystemPrompt: jest.fn().mockReturnValue('Mock system prompt')
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('TeacherPages OpenAI Caller', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  
  const mockOpenAIResponse = {
    choices: [{
      message: {
        content: JSON.stringify({
          worksheetTitle: 'Addition Practice',
          instructions: 'Solve the following addition problems',
          question1: 'What is 2 + 3?',
          question2: 'What is 5 + 4?',
          question3: 'What is 7 + 1?',
          answer1: '5',
          answer2: '9',
          answer3: '8'
        })
      }
    }],
    usage: {
      prompt_tokens: 150,
      completion_tokens: 200,
      total_tokens: 350
    }
  };

  const mockOpenAIErrorResponse = {
    error: {
      message: 'Rate limit exceeded'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Reset environment variables
    delete process.env.OPENAI_MODEL;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('callOpenAI', () => {
    it('should make successful API call with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAI(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer mock-api-key',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Mock system prompt'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
          })
        })
      );

      expect(result).toEqual({
        content: {
          worksheetTitle: 'Addition Practice',
          instructions: 'Solve the following addition problems',
          question1: 'What is 2 + 3?',
          question2: 'What is 5 + 4?',
          question3: 'What is 7 + 1?',
          answer1: '5',
          answer2: '9',
          answer3: '8'
        },
        usage: {
          prompt_tokens: 150,
          completion_tokens: 200,
          total_tokens: 350
        }
      });
    });

    it('should use environment variable for model when available', async () => {
      process.env.OPENAI_MODEL = 'gpt-4';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      await callOpenAI(prompt);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('"model":"gpt-4"')
        })
      );
    });

    it('should handle API error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => mockOpenAIErrorResponse
      } as Response);

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'OpenAI API error: 429 Too Many Requests - Rate limit exceeded'
      );
    });

    it('should handle API error responses without error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({})
      } as Response);

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'OpenAI API error: 500 Internal Server Error - Unknown error'
      );
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'OpenAI API call failed: Network error'
      );
    });

    it('should handle missing content in response', async () => {
      const responseWithoutContent = {
        choices: [{
          message: {}
        }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 0,
          total_tokens: 150
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutContent
      } as Response);

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'No content received from OpenAI'
      );
    });

    it('should handle invalid JSON content', async () => {
      const responseWithInvalidJSON = {
        choices: [{
          message: {
            content: 'Invalid JSON content'
          }
        }],
        usage: {
          prompt_tokens: 150,
          completion_tokens: 50,
          total_tokens: 200
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithInvalidJSON
      } as Response);

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'Failed to parse OpenAI response as JSON'
      );
    });

    it('should handle missing usage information', async () => {
      const responseWithoutUsage = {
        choices: [{
          message: {
            content: JSON.stringify({
              worksheetTitle: 'Addition Practice'
            })
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutUsage
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAI(prompt);

      expect(result.usage).toEqual({
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      });
    });
  });

  describe('callOpenAIWithRetry', () => {
    it('should succeed on first attempt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAIWithRetry(prompt);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        content: expect.any(Object),
        usage: expect.any(Object)
      });
    });

    it('should retry on failure and succeed', async () => {
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAIWithRetry(prompt, 2);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        content: expect.any(Object),
        usage: expect.any(Object)
      });
    });

    it('should retry multiple times and eventually succeed', async () => {
      // First two calls fail
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      mockFetch.mockRejectedValueOnce(new Error('Timeout error'));
      
      // Third call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAIWithRetry(prompt, 3);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        content: expect.any(Object),
        usage: expect.any(Object)
      });
    });

    it('should fail after max retries', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAIWithRetry(prompt, 3)).rejects.toThrow(
        'Persistent network error'
      );

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should use default max retries when not specified', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const prompt = 'Generate a math worksheet';

      await expect(callOpenAIWithRetry(prompt)).rejects.toThrow(
        'Persistent network error'
      );

      expect(mockFetch).toHaveBeenCalledTimes(3); // Default max retries
    });

    it('should handle different error types during retries', async () => {
      // First call fails with network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call fails with API error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      } as Response);
      
      // Third call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const result = await callOpenAIWithRetry(prompt, 3);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        content: expect.any(Object),
        usage: expect.any(Object)
      });
    });

    it('should wait between retries with exponential backoff', async () => {
      jest.useFakeTimers();
      
      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a math worksheet';
      const promise = callOpenAIWithRetry(prompt, 2);

      // Fast-forward time to simulate waiting
      jest.advanceTimersByTime(2000); // 2^1 * 1000ms

      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        content: expect.any(Object),
        usage: expect.any(Object)
      });

      jest.useRealTimers();
    });
  });

  describe('estimateTokenCost', () => {
    it('should estimate cost for default model', () => {
      const tokens = 1000;
      const cost = estimateTokenCost(tokens);
      
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });

    it('should estimate cost for specific model', () => {
      const tokens = 1000;
      const model = 'gpt-4';
      const cost = estimateTokenCost(tokens, model);
      
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });

    it('should handle zero tokens', () => {
      const cost = estimateTokenCost(0);
      
      expect(cost).toBe(0);
    });

    it('should handle large token counts', () => {
      const tokens = 100000;
      const cost = estimateTokenCost(tokens);
      
      expect(typeof cost).toBe('number');
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete successful workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a comprehensive math worksheet for 2nd grade students';
      const result = await callOpenAI(prompt);

      // Verify the complete response structure
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('usage');
      
      expect(result.content).toHaveProperty('worksheetTitle');
      expect(result.content).toHaveProperty('instructions');
      expect(result.content).toHaveProperty('question1');
      expect(result.content).toHaveProperty('answer1');
      
      expect(result.usage).toHaveProperty('prompt_tokens');
      expect(result.usage).toHaveProperty('completion_tokens');
      expect(result.usage).toHaveProperty('total_tokens');
    });

    it('should handle retry workflow with eventual success', async () => {
      // Simulate a scenario where the first call fails due to rate limiting
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      } as Response);
      
      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOpenAIResponse
      } as Response);

      const prompt = 'Generate a science worksheet';
      const result = await callOpenAIWithRetry(prompt, 2);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.content).toBeDefined();
      expect(result.usage).toBeDefined();
    });

    it('should handle various error scenarios gracefully', async () => {
      const errorScenarios = [
        { error: new Error('Network timeout'), expectedMessage: 'OpenAI API call failed: Network timeout' },
        { 
          response: { ok: false, status: 401, statusText: 'Unauthorized', json: async () => ({ error: { message: 'Invalid API key' } }) },
          expectedMessage: 'OpenAI API error: 401 Unauthorized - Invalid API key'
        },
        { 
          response: { ok: false, status: 500, statusText: 'Internal Server Error', json: async () => ({}) },
          expectedMessage: 'OpenAI API error: 500 Internal Server Error - Unknown error'
        }
      ];

      for (const scenario of errorScenarios) {
        if ('error' in scenario) {
          mockFetch.mockRejectedValueOnce(scenario.error);
        } else {
          mockFetch.mockResolvedValueOnce(scenario.response as Response);
        }

        const prompt = 'Generate a worksheet';
        
        await expect(callOpenAI(prompt)).rejects.toThrow(scenario.expectedMessage);
      }
    });
  });

  describe('error handling edge cases', () => {
    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      const prompt = 'Generate a worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'OpenAI API call failed with unknown error'
      );
    });

    it('should handle null response', async () => {
      mockFetch.mockResolvedValueOnce(null as any);

      const prompt = 'Generate a worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'OpenAI API call failed with unknown error'
      );
    });

    it('should handle response without choices array', async () => {
      const invalidResponse = {
        usage: {
          prompt_tokens: 150,
          completion_tokens: 0,
          total_tokens: 150
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse
      } as Response);

      const prompt = 'Generate a worksheet';

      await expect(callOpenAI(prompt)).rejects.toThrow(
        'No content received from OpenAI'
      );
    });
  });
}); 