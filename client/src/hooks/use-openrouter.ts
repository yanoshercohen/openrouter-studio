import { useMutation } from "@tanstack/react-query";
import { CompletionRequest, CompletionResponse } from "shared/schema";

export function useOpenRouter() {
  return useMutation({
    mutationFn: async (request: CompletionRequest): Promise<CompletionResponse> => {
      const startTime = Date.now();
      
      const response = await fetch('/api/openrouter/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.content,
        tokensUsed: data.tokensUsed,
        responseTime,
        model: request.model,
      };
    },
  });
}