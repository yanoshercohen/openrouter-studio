import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOpenRouter } from "@/hooks/use-openrouter";
import { useModelsCache } from "@/hooks/use-models-cache";
import { useApiKey } from "@/hooks/use-api-key";
import { CategoryChips } from "@/components/category-chips";
import { Key, Edit, Trash2, Send, Eye, EyeOff, AlertTriangle, Loader2, Settings } from "lucide-react";

interface RequestPanelProps {
  onResult: (data: { content: string; tokensUsed: number; responseTime: number; model: string }) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}

const quickPrompts = [
  {
    title: "Creative Writing",
    prompt: "Write a short story about a time traveler who accidentally changes history."
  },
  {
    title: "Code Review",
    prompt: "Review this JavaScript function and suggest improvements for performance and readability."
  },
  {
    title: "Explanation",
    prompt: "Explain quantum computing in simple terms that a high school student could understand."
  },
  {
    title: "Translation",
    prompt: "Translate the following text to French and maintain the tone and style."
  }
];

export default function RequestPanel({ onResult, onError, onLoadingChange }: RequestPanelProps) {
  const { apiKey, setApiKey, showApiKey, toggleShowApiKey } = useApiKey();
  const [model, setModel] = useState("deepseek/deepseek-chat:free");
  const [temperature, setTemperature] = useState([0.2]);
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const mutation = useOpenRouter();
  const { models: modelsData, isLoading: modelsLoading, error: modelsError, categorizeModels, getProviderChips } = useModelsCache();

  // Get categories and filter models based on selected category
  const categories = categorizeModels();
  const providerChips = getProviderChips();
  
  const filteredCategories = selectedCategory 
    ? { [selectedCategory]: categories[selectedCategory] || [] }
    : categories;

  // Auto-select first model when category changes
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (category && categories[category] && categories[category].length > 0) {
      setModel(categories[category][0].id);
    }
  };

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      onError("Please enter your OpenRouter API key");
      return;
    }

    if (!prompt.trim()) {
      onError("Please enter a prompt");
      return;
    }

    try {
      onLoadingChange(true);
      const result = await mutation.mutateAsync({
        apiKey: apiKey.trim(),
        prompt: prompt.trim(),
        model,
        temperature: temperature[0],
        systemPrompt: systemPrompt.trim() || undefined,
      });
      onResult(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      onLoadingChange(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setPrompt(promptText);
  };

  return (
    <div className="space-y-6">
      {/* API Configuration Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Key className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">API Configuration</h2>
          </div>
          
          {/* Security Warning */}
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              <span className="font-medium">Privacy Notice:</span> Your API key is sent directly to OpenRouter. Never share your key with others.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">API Key</Label>
              <div className="relative mt-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={toggleShowApiKey}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="model" className="text-sm font-medium text-foreground">Model</Label>
              
              {/* Category Chips - Show when we have models data */}
              {modelsData && providerChips.length > 0 && (
                <div className="mt-2 mb-3 bg-card rounded-lg p-3 border">
                  <CategoryChips 
                    categories={providerChips}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
              )}
              
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={modelsLoading ? "Loading models..." : "Select a model"} />
                </SelectTrigger>
                <SelectContent>
                  {modelsLoading ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Loading available models...
                    </div>
                  ) : modelsError ? (
                    <div className="p-2 text-center text-sm text-destructive">
                      {apiKey ? "Failed to load models" : "Enter API key to load models"}
                    </div>
                  ) : modelsData ? (
                    Object.entries(filteredCategories).map(([category, models]) => 
                      models.length > 0 && (
                        <div key={category}>
                          <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                            {category}
                          </div>
                          {models.map((model: any) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center gap-2">
                                <span>{model.id.replace(':free', '')}</span>
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1.5 py-0.5 rounded text-xs font-medium">FREE</span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      )
                    )
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No models available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-foreground">Temperature</Label>
              <div className="flex items-center space-x-3 mt-2">
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={2}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm font-mono text-muted-foreground min-w-[2rem]">
                  {temperature[0].toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Prompt Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">System Prompt</h2>
              <span className="text-xs text-muted-foreground">(Optional)</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSystemPrompt("")}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="Enter system instructions (e.g., 'You are a helpful assistant that explains concepts clearly...')"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              System prompts help guide the AI's behavior and response style
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Input Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Prompt</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPrompt("")}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <Trash2 className="h-4 w-4" />
              </button>

            </div>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {prompt.length} characters
              </div>
              <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {mutation.isPending ? "Processing..." : "Send Request"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Prompts */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Prompts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(item.prompt)}
                className="text-left p-3 rounded-lg border border-border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all text-sm"
              >
                <div className="font-medium text-foreground">{item.title}</div>
                <div className="text-muted-foreground truncate">{item.prompt}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
