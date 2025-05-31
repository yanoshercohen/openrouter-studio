import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Moon, Sun, ArrowLeft, Trophy, Users, Loader2, RefreshCw, Key, Eye, EyeOff, Info, X, Plus, Expand, Copy } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ErrorToast } from "@/components/error-toast";
import { CategoryChips } from "@/components/category-chips";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useModelsCache } from "@/hooks/use-models-cache";
import { useOpenRouterApi } from "@/hooks/use-openrouter-api";
import { useApiKey } from "@/hooks/use-api-key";
import { ApiKeyInput } from "@/components/api-key-input";

// Default model sets for the arena - using verified FREE models
const modelSets = {
  "Latest AI Leaders": [
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat:free",
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "qwen/qwen-2.5-72b-instruct:free"
  ],
  "Creative Models": [
    "meta-llama/llama-3.3-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "mistralai/mistral-nemo:free",
    "google/gemma-2-9b-it:free",
    "nousresearch/deephermes-3-mistral-24b-preview:free"
  ],
  "Reasoning Specialists": [
    "deepseek/deepseek-r1:free",
    "microsoft/phi-4-reasoning-plus:free",
    "microsoft/phi-4-reasoning:free",
    "qwen/qwq-32b:free",
    "meta-llama/llama-3.1-405b:free"
  ],
  "Code Experts": [
    "deepseek/deepseek-chat:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/devstral-small:free",
    "agentica-org/deepcoder-14b-preview:free"
  ],
  "Vision Models": [
    "qwen/qwen2.5-vl-72b-instruct:free",
    "qwen/qwen2.5-vl-32b-instruct:free",
    "qwen/qwen2.5-vl-7b-instruct:free",
    "qwen/qwen2.5-vl-3b-instruct:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free"
  ],
  "Large Scale Models": [
    "meta-llama/llama-3.1-405b:free",
    "qwen/qwen3-235b-a22b:free",
    "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    "shisa-ai/shisa-v2-llama3.3-70b:free"
  ]
};

interface ArenaResponse {
  model: string;
  content: string;
  tokensUsed: number;
  responseTime: number;
  vote?: number;
  error?: string;
}

interface ConsensusResult {
  winner: string;
  scores: Record<string, number>;
  reasoning: string;
}

export default function Arena() {
  const { theme, toggleTheme } = useTheme();
  const { apiKey, setApiKey, showApiKey, toggleShowApiKey } = useApiKey();
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedModelSet, setSelectedModelSet] = useState("Latest AI Leaders");
  const [customModels, setCustomModels] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [responses, setResponses] = useState<ArenaResponse[]>([]);
  const [consensusResult, setConsensusResult] = useState<ConsensusResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [failedModels, setFailedModels] = useState<Set<string>>(new Set());

  // Use shared models cache
  const { getFreeModels } = useModelsCache();
  
  // Available models for custom selection - get from cache
  const availableModels = getFreeModels().map(model => model.id);

  // Fallback static list if cache is not ready
  const fallbackModels = [
    "deepseek/deepseek-r1-0528-qwen3-8b:free",
    "deepseek/deepseek-r1-0528:free",
    "deepseek/deepseek-r1:free",
    "deepseek/deepseek-chat:free",
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-prover-v2:free",
    "deepseek/deepseek-v3-base:free",
    "deepseek/deepseek-r1-zero:free",
    "deepseek/deepseek-r1-distill-qwen-32b:free",
    "deepseek/deepseek-r1-distill-qwen-14b:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3n-e4b-it:free",
    "google/gemma-3-1b-it:free",
    "google/gemma-3-4b-it:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-27b-it:free",
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.3-8b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "meta-llama/llama-3.2-1b-instruct:free",
    "meta-llama/llama-3.1-405b:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "qwen/qwen3-30b-a3b:free",
    "qwen/qwen3-8b:free",
    "qwen/qwen3-14b:free",
    "qwen/qwen3-32b:free",
    "qwen/qwen3-235b-a22b:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "qwen/qwen-2.5-7b-instruct:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "qwen/qwen2.5-vl-72b-instruct:free",
    "qwen/qwen2.5-vl-32b-instruct:free",
    "qwen/qwen2.5-vl-7b-instruct:free",
    "qwen/qwen2.5-vl-3b-instruct:free",
    "qwen/qwq-32b:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "mistralai/mistral-small-24b-instruct-2501:free",
    "mistralai/mistral-7b-instruct:free",
    "mistralai/mistral-nemo:free",
    "mistralai/devstral-small:free",
    "microsoft/phi-4-reasoning-plus:free",
    "microsoft/phi-4-reasoning:free",
    "microsoft/mai-ds-r1:free",
    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
    "nousresearch/deephermes-3-mistral-24b-preview:free",
    "nousresearch/deephermes-3-llama-3-8b-preview:free",
    "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    "cognitivecomputations/dolphin3.0-mistral-24b:free",
    "thudm/glm-z1-32b:free",
    "thudm/glm-4-32b:free",
    "shisa-ai/shisa-v2-llama3.3-70b:free",
    "arliai/qwq-32b-arliai-rpr-v1:free",
    "agentica-org/deepcoder-14b-preview:free",
    "moonshotai/kimi-vl-a3b-thinking:free",
    "moonshotai/moonlight-16b-a3b-instruct:free",
    "featherless/qwerky-72b:free",
    "open-r1/olympiccoder-32b:free",
    "rekaai/reka-flash-3:free",
    "tngtech/deepseek-r1t-chimera:free",
    "sarvamai/sarvam-m:free",
    "opengvlab/internvl3-14b:free",
    "opengvlab/internvl3-2b:free"
  ];

  const makeApiCall = async (model: string, prompt: string, systemPrompt?: string, retries = 3): Promise<ArenaResponse> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const startTime = Date.now();
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'X-Title': 'Arena Mode'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            stream: false // Ensure no streaming
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
          content: data.choices[0]?.message?.content || "No response generated",
          tokensUsed: data.usage?.total_tokens || 0,
          responseTime
        };
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt === retries - 1) {
            return {
              model,
              content: "",
              tokensUsed: 0,
              responseTime: 60000,
              error: "Request timeout (60 seconds)"
            };
          }
        } else if (attempt === retries - 1) {
          return {
            model,
            content: "",
            tokensUsed: 0,
            responseTime: 0,
            error: error instanceof Error ? error.message : "Unknown error occurred"
          };
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error("Max retries exceeded");
  };

  const evaluateResponses = async (responses: ArenaResponse[], originalPrompt: string): Promise<ConsensusResult> => {
    try {
      const validResponses = responses.filter(r => !r.error && r.content.trim());
      
      if (validResponses.length === 0) {
        return {
          winner: "No valid responses",
          scores: {},
          reasoning: "All models failed to generate valid responses."
        };
      }

      const evaluationPrompt = `You are an expert AI evaluator using STAR voting methodology. Analyze these responses to: "${originalPrompt}"

STAR VOTING CRITERIA (Rate 0-5 stars per criterion):
- Accuracy (30%): Factual correctness, no hallucinations
- Relevance (25%): Directly addresses the request  
- Coherence (25%): Logical structure and flow
- Helpfulness (20%): Practical value and usefulness

For each response, analyze each criterion separately with reasoning, then calculate:
Star Score = (Accuracy×0.3) + (Relevance×0.25) + (Coherence×0.25) + (Helpfulness×0.2)
Final Score = Star Score × 2 (convert to 0-10 scale)

Responses to evaluate:
${validResponses.map((r, i) => `\n${i + 1}. Model: ${r.model}\nResponse: ${r.content.substring(0, 800)}${r.content.length > 800 ? '...' : ''}\n`).join('\n')}

Respond in JSON format:
{
  "evaluations": {
    "${validResponses[0]?.model}": {
      "accuracy": {"score": 4, "reasoning": "..."},
      "relevance": {"score": 5, "reasoning": "..."},
      "coherence": {"score": 3, "reasoning": "..."},
      "helpfulness": {"score": 4, "reasoning": "..."},
      "final_score": 7.8
    }
  },
  "winner": "exact_model_name",
  "reasoning": "Winner explanation based on highest STAR score"
}`;

      const evaluatorResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-Title': 'Arena Evaluator'
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat:free",
          messages: [{ role: 'user', content: evaluationPrompt }],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!evaluatorResponse.ok) {
        throw new Error('Evaluation failed');
      }

      const evaluatorData = await evaluatorResponse.json();
      const evaluationContent = evaluatorData.choices[0]?.message?.content || "";
      
      try {
        const parsedEvaluation = JSON.parse(evaluationContent);
        
        // Convert STAR evaluation to 0-10 scale scores
        const scores: Record<string, number> = {};
        if (parsedEvaluation.evaluations) {
          Object.entries(parsedEvaluation.evaluations).forEach(([model, evaluation]: [string, any]) => {
            let score = evaluation.final_score || 0;
            // Ensure score is on 0-10 scale (convert from 0-5 if needed)
            if (score <= 5) {
              score = score * 2; // Convert 0-5 to 0-10
            }
            scores[model] = Math.round(score * 10) / 10; // Round to 1 decimal
          });
        }
        
        return {
          scores,
          winner: parsedEvaluation.winner,
          reasoning: parsedEvaluation.reasoning || "STAR voting evaluation complete"
        };
      } catch {
        // Fallback STAR scoring
        const scores: Record<string, number> = {};
        validResponses.forEach(r => {
          // Simple fallback STAR calculation (0-5 scale converted to 0-10)
          const accuracy = Math.min(5, Math.max(0, Math.floor(r.content.length / 200)));
          const relevance = Math.min(5, Math.max(0, 3 + Math.floor(Math.random() * 3)));
          const coherence = Math.min(5, Math.max(0, 3 + Math.floor(Math.random() * 3)));
          const helpfulness = Math.min(5, Math.max(0, 3 + Math.floor(Math.random() * 3)));
          
          const starScore = (accuracy * 0.3) + (relevance * 0.25) + (coherence * 0.25) + (helpfulness * 0.2);
          scores[r.model] = Math.round((starScore * 2) * 10) / 10; // Convert to 0-10 scale
        });
        
        const winner = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
        
        return {
          scores,
          winner,
          reasoning: "Fallback scoring applied - AI evaluator response could not be parsed."
        };
      }
    } catch (error) {
      // Fallback STAR evaluation
      const validResponses = responses.filter(r => !r.error);
      if (validResponses.length === 0) {
        return {
          winner: "No winner",
          scores: {},
          reasoning: "All models failed to respond."
        };
      }

      const scores: Record<string, number> = {};
      validResponses.forEach(r => {
        // Fallback STAR scoring (0-5 scale with weighted criteria) - convert to 0-10 scale
        const accuracy = Math.min(5, Math.max(1, Math.floor(r.content.length / 200) + 2));
        const relevance = Math.min(5, Math.max(1, 3 + Math.floor(Math.random() * 2)));
        const coherence = Math.min(5, Math.max(1, 3 + Math.floor(Math.random() * 2)));
        const helpfulness = Math.min(5, Math.max(1, 3 + Math.floor(Math.random() * 2)));
        
        // Calculate weighted score and convert to 0-10 scale
        const starScore = (accuracy * 0.3) + (relevance * 0.25) + (coherence * 0.25) + (helpfulness * 0.2);
        scores[r.model] = Math.round((starScore * 2) * 10) / 10; // Convert 0-5 to 0-10 and round to 1 decimal
      });

      const winner = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];

      return {
        scores,
        winner,
        reasoning: "Fallback scoring applied - AI evaluator unavailable. Scores based on response length and basic criteria."
      };
    }
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError("Please enter your OpenRouter API key");
      setShowErrorToast(true);
      return;
    }

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      setShowErrorToast(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowErrorToast(false);
    setResponses([]);
    setConsensusResult(null);

    try {
      const models = isCustomMode ? customModels : modelSets[selectedModelSet as keyof typeof modelSets];
      
      if (models.length === 0) {
        setError("Please select at least one model for the arena");
        setShowErrorToast(true);
        return;
      }

      // Make all API calls in parallel
      const responsePromises = models.map(model => 
        makeApiCall(model, prompt.trim(), systemPrompt.trim() || undefined)
      );

      const arenaResponses = await Promise.all(responsePromises);
      setResponses(arenaResponses);

      // Track failed models
      const failed = new Set(arenaResponses.filter(r => r.error).map(r => r.model));
      setFailedModels(failed);

      // Evaluate responses
      const consensus = await evaluateResponses(arenaResponses, prompt.trim());
      setConsensusResult(consensus);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setError(errorMessage);
      setShowErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleSubmit();
  };

  const retryFailedModel = async (model: string) => {
    setIsLoading(true);
    try {
      const newResponse = await makeApiCall(model, prompt.trim(), systemPrompt.trim() || undefined);
      
      // Update responses array
      setResponses(prev => prev.map(r => r.model === model ? newResponse : r));
      
      // Remove from failed models if successful
      if (!newResponse.error) {
        setFailedModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(model);
          return newSet;
        });
        
        // Re-evaluate with updated responses
        const updatedResponses = responses.map(r => r.model === model ? newResponse : r);
        const consensus = await evaluateResponses(updatedResponses, prompt.trim());
        setConsensusResult(consensus);
      }
    } catch (error) {
      setError(`Failed to retry ${model}: ${error instanceof Error ? error.message : "Unknown error"}`);
      setShowErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const replaceFailedModel = (oldModel: string, newModel: string) => {
    if (isCustomMode) {
      setCustomModels(prev => prev.map(m => m === oldModel ? newModel : m));
    } else {
      // For preset modes, we'd need to temporarily switch to custom mode
      const currentModels = modelSets[selectedModelSet as keyof typeof modelSets];
      const updatedModels = currentModels.map(m => m === oldModel ? newModel : m);
      setCustomModels(updatedModels);
      setIsCustomMode(true);
    }
    
    // Remove from failed models
    setFailedModels(prev => {
      const newSet = new Set(prev);
      newSet.delete(oldModel);
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getModelDisplayName = (model: string) => {
    return model.split('/')[1]?.replace(':free', '') || model;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Studio
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 dark:from-yellow-700 dark:to-yellow-800 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-yellow-800 dark:text-yellow-200" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">AI Arena</h1>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs">
                  FREE
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Info className="h-4 w-4 mr-2" />
                    How it Works
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span>AI Arena - How it Works</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">STAR Voting AI Arena</h3>
                      <p className="text-sm text-muted-foreground">
                        The AI Arena uses STAR (Score Then Automatic Runoff) voting methodology to evaluate AI model responses objectively.
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">How STAR Voting Works:</h4>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li><strong>Multi-Model Execution:</strong> Your prompt is sent to multiple AI models simultaneously</li>
                        <li><strong>Response Collection:</strong> Each model generates its own unique response (up to 3 retries per model)</li>
                        <li><strong>STAR Evaluation:</strong> An AI evaluator rates each response on 4 criteria (0-5 stars each):</li>
                        <div className="ml-6 mt-2 space-y-1 text-xs">
                          <div>• <strong>Accuracy (30%)</strong>: Factual correctness, no hallucinations</div>
                          <div>• <strong>Relevance (25%)</strong>: Directly addresses the request</div>
                          <div>• <strong>Coherence (25%)</strong>: Logical structure and flow</div>
                          <div>• <strong>Helpfulness (20%)</strong>: Practical value and usefulness</div>
                        </div>
                        <li><strong>Final Score:</strong> Weighted criteria scores are converted to a 0-10 scale</li>
                        <li><strong>Winner Selection:</strong> The model with the highest total score wins</li>
                      </ol>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium mb-2">Benefits:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Compare different AI model strengths and weaknesses</li>
                        <li>Get objective evaluation of response quality</li>
                        <li>Discover which models work best for your specific use cases</li>
                        <li>Benefit from ensemble intelligence</li>
                        <li>Runs entirely client-side for privacy</li>
                      </ul>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-3">
                      <strong>Note:</strong> All models used are free-tier models from OpenRouter. The arena runs client-side using your API key.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <span className="text-sm text-muted-foreground">v1.0.0</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* API Key Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>API Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">OpenRouter API Key</Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your OpenRouter API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={toggleShowApiKey}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      openrouter.ai
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Model Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={!isCustomMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCustomMode(false)}
                    >
                      Preset Sets
                    </Button>
                    <Button
                      variant={isCustomMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsCustomMode(true)}
                    >
                      Custom Selection
                    </Button>
                  </div>

                  {!isCustomMode ? (
                    <>
                      <CategoryChips
                        categories={Object.keys(modelSets)}
                        selectedCategory={selectedModelSet}
                        onCategorySelect={(category) => setSelectedModelSet(category || "Latest AI Leaders")}
                        showAllButton={false}
                      />
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">Models in this set:</div>
                        <div className="flex flex-wrap gap-2">
                          {modelSets[selectedModelSet as keyof typeof modelSets].map((model) => (
                            <Badge key={model} variant="secondary" className="text-xs">
                              {getModelDisplayName(model)}
                              <Badge variant="outline" className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                FREE
                              </Badge>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Add Models to Arena:</Label>
                        <span className="text-xs text-muted-foreground">
                          {customModels.length} selected
                        </span>
                      </div>
                      <Select
                        onValueChange={(model) => {
                          if (!customModels.includes(model)) {
                            setCustomModels([...customModels, model]);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select models to add..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(availableModels.length > 0 ? availableModels : fallbackModels)
                            .filter(model => !customModels.includes(model))
                            .map((model) => (
                              <SelectItem key={model} value={model}>
                                {getModelDisplayName(model)} (FREE)
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {customModels.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Selected models:</div>
                          <div className="flex flex-wrap gap-2">
                            {customModels.map((model) => (
                              <Badge key={model} variant="secondary" className="text-xs flex items-center gap-1">
                                {getModelDisplayName(model)}
                                <Badge variant="outline" className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                  FREE
                                </Badge>
                                <button
                                  onClick={() => setCustomModels(customModels.filter(m => m !== model))}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>Prompt Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-sm font-medium text-foreground">Main Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter your prompt here..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt" className="text-sm font-medium text-foreground">System Prompt (Optional)</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="Enter system prompt (optional)..."
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    disabled={isLoading || !apiKey.trim() || !prompt.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Arena Battle...
                      </>
                    ) : (
                      <>
                        <Trophy className="mr-2 h-4 w-4" />
                        Start Arena Battle
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Consensus Result */}
            {consensusResult && (
              <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <span>Arena Winner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                      🏆 {getModelDisplayName(consensusResult.winner)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(consensusResult.scores).map(([model, score]) => (
                        <div key={model} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{getModelDisplayName(model)}:</span>
                          <span className="font-medium">{score}/10</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="text-sm text-muted-foreground">
                      <strong>Reasoning:</strong> {consensusResult.reasoning}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Individual Responses */}
            {responses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Model Responses</h3>
                  {error && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4">
                  {responses.map((response, index) => (
                    <Card key={index} className={`${response.error ? "border-red-200 dark:border-red-800" : ""} transition-all`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {getModelDisplayName(response.model)}
                            </Badge>
                            <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                              FREE
                            </Badge>
                            {consensusResult?.scores[response.model] && (
                              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                {consensusResult.scores[response.model]}/10
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{response.tokensUsed} tokens</span>
                            <span>•</span>
                            <span>{response.responseTime}ms</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {response.error ? (
                          <div className="space-y-3">
                            <div className="text-red-600 dark:text-red-400 text-sm">
                              Error: {response.error}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => retryFailedModel(response.model)}
                                disabled={isLoading}
                                variant="outline"
                                size="sm"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Replace Model
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Replace Failed Model</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                      Replace <strong>{getModelDisplayName(response.model)}</strong> with a different model:
                                    </p>
                                    <Select
                                      onValueChange={(newModel) => {
                                        replaceFailedModel(response.model, newModel);
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select replacement model..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {(availableModels.length > 0 ? availableModels : fallbackModels)
                                          .filter(model => 
                                            !responses.some(r => r.model === model) && 
                                            model !== response.model
                                          )
                                          .map((model) => (
                                            <SelectItem key={model} value={model}>
                                              {getModelDisplayName(model)} (FREE)
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="relative">
                              <div className="text-sm text-muted-foreground leading-relaxed">
                                {truncateContent(response.content)}
                              </div>
                              {response.content.length > 150 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Expand className="h-4 w-4 mr-2" />
                                    View Full Response
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <span>{getModelDisplayName(response.model)}</span>
                                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                        FREE
                                      </Badge>
                                      {consensusResult?.scores[response.model] && (
                                        <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                          {consensusResult.scores[response.model]}/10
                                        </Badge>
                                      )}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="mt-4 flex flex-col flex-1 min-h-0">
                                    <Tabs defaultValue="rendered" className="w-full flex flex-col flex-1 min-h-0">
                                      <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="rendered">Rendered</TabsTrigger>
                                        <TabsTrigger value="raw">Raw Text</TabsTrigger>
                                      </TabsList>
                                      <TabsContent value="rendered" className="mt-4 flex-1 min-h-0">
                                        <div className="h-[50vh] overflow-y-auto">
                                          <MarkdownRenderer content={response.content} className="prose-sm" />
                                        </div>
                                      </TabsContent>
                                      <TabsContent value="raw" className="mt-4 flex-1 min-h-0">
                                        <div className="h-[50vh] overflow-y-auto">
                                          <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                                            {response.content}
                                          </pre>
                                        </div>
                                      </TabsContent>
                                    </Tabs>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t bg-background sticky bottom-0">
                                      <div className="text-xs text-muted-foreground flex-1">
                                        {response.tokensUsed} tokens • {response.responseTime}ms
                                      </div>
                                      <Button 
                                        onClick={() => copyToClipboard(response.content)}
                                        variant="outline" 
                                        size="sm"
                                        className="ml-4"
                                      >
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                onClick={() => copyToClipboard(response.content)}
                                variant="ghost" 
                                size="sm"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <div className="text-muted-foreground">
                      Running arena battle with multiple AI models...
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && responses.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div className="text-muted-foreground">
                      Enter a prompt and start the arena battle to see results
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>AI Arena</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                100% FREE
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span>Powered by OpenRouter</span>
              <span>•</span>
              <span>Made with ♥ by yan</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Error Toast */}
      {showErrorToast && error && (
        <ErrorToast 
          message={error} 
          onClose={() => setShowErrorToast(false)} 
        />
      )}
    </div>
  );
}