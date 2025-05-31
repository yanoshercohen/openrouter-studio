import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateCompletion } from "./openrouter";
import { completionRequestSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate text completion
  app.post("/api/openrouter/completions", async (req, res) => {
    try {
      const validatedData = completionRequestSchema.parse(req.body);
      const { prompt, model, temperature, apiKey, systemPrompt } = validatedData;

      const startTime = Date.now();
      
      const result = await generateCompletion(apiKey, prompt, model, temperature, systemPrompt);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      res.json({
        content: result.content,
        tokensUsed: result.tokensUsed,
        responseTime,
        model,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      res.status(500).json({ 
        error: errorMessage,
        model: req.body.model || "unknown"
      });
    }
  });

  // Simple stats endpoint (no longer using storage)
  app.get("/api/stats", async (req, res) => {
    res.json({
      requests: 0,
      tokens: 0,
      avgTime: 0,
      successRate: 100
    });
  });



  const httpServer = createServer(app);
  return httpServer;
}
