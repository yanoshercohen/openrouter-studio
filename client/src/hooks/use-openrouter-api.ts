import { useState } from 'react';

interface ApiResponse {
  content: string;
  tokensUsed: number;
  responseTime: number;
  model: string;
  error?: string;
}

interface UseOpenRouterApiProps {
  apiKey: string;
  onError: (error: string) => void;
}

export function useOpenRouterApi({ apiKey, onError }: UseOpenRouterApiProps) {
  const [isLoading, setIsLoading] = useState(false);

  const makeApiCall = async (
    model: string,
    prompt: string,
    systemPrompt?: string,
    retries = 3
  ): Promise<ApiResponse> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const startTime = Date.now();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'OpenRouter Studio'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: false
          })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const responseTime = Date.now() - startTime;

        return {
          model,
          content: data.choices[0]?.message?.content || 'No response generated',
          tokensUsed: data.usage?.total_tokens || 0,
          responseTime
        };
      } catch (error) {
        const isLastAttempt = attempt === retries - 1;
        
        if (error instanceof Error && error.name === 'AbortError') {
          if (isLastAttempt) {
            return {
              model,
              content: '',
              tokensUsed: 0,
              responseTime: 0,
              error: 'Request timeout - model took too long to respond'
            };
          }
          continue;
        }

        if (isLastAttempt) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          return {
            model,
            content: '',
            tokensUsed: 0,
            responseTime: 0,
            error: errorMessage
          };
        }

        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    return {
      model,
      content: '',
      tokensUsed: 0,
      responseTime: 0,
      error: 'All retry attempts failed'
    };
  };

  const executeMultipleModels = async (
    models: string[],
    prompt: string,
    systemPrompt?: string,
    onProgress?: (completed: number, total: number) => void
  ) => {
    setIsLoading(true);
    
    try {
      const responses: ApiResponse[] = [];
      
      for (let i = 0; i < models.length; i++) {
        const response = await makeApiCall(models[i], prompt, systemPrompt);
        responses.push(response);
        onProgress?.(i + 1, models.length);
      }
      
      return responses;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    makeApiCall,
    executeMultipleModels,
    isLoading
  };
}