import { useState, useEffect } from "react";

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  name?: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    tokenizer?: string;
    instruct_type?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  per_request_limits?: any;
}

interface ModelsResponse {
  data: Model[];
}

// Global cache to share between components
let modelsCache: ModelsResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useModelsCache() {
  const [models, setModels] = useState<ModelsResponse | null>(modelsCache);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    // Check if cache is still valid
    const now = Date.now();
    if (modelsCache && (now - cacheTimestamp) < CACHE_DURATION) {
      setModels(modelsCache);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data: ModelsResponse = await response.json();
      
      // Update global cache
      modelsCache = data;
      cacheTimestamp = now;
      
      setModels(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const getFreeModels = () => {
    return models?.data.filter(model => model.id.endsWith(':free')) || [];
  };

  const categorizeModels = () => {
    const freeModels = getFreeModels();
    const categories: Record<string, Model[]> = {};
    
    freeModels.forEach(model => {
      // Extract provider from model ID
      const parts = model.id.split('/');
      const provider = parts[0] || 'other';
      
      // Clean up provider name for display
      const displayProvider = provider
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (!categories[displayProvider]) {
        categories[displayProvider] = [];
      }
      categories[displayProvider].push(model);
    });
    
    return categories;
  };

  const getProviderChips = () => {
    const categories = categorizeModels();
    return Object.keys(categories).sort();
  };

  return {
    models,
    isLoading,
    error,
    refetch: fetchModels,
    getFreeModels,
    categorizeModels,
    getProviderChips
  };
}