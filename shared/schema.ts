import { z } from "zod";

// API schemas
export const completionRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  model: z.string().min(1, "Model is required"),
  temperature: z.number().min(0).max(2),
  apiKey: z.string().min(1, "API key is required"),
  systemPrompt: z.string().optional(),
});

export type CompletionRequest = z.infer<typeof completionRequestSchema>;

export const completionResponseSchema = z.object({
  content: z.string(),
  tokensUsed: z.number(),
  responseTime: z.number(),
  model: z.string(),
});

export type CompletionResponse = z.infer<typeof completionResponseSchema>;
