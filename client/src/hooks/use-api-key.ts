import { useState, useEffect } from 'react';

export function useApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openrouter-api-key', apiKey);
    } else {
      localStorage.removeItem('openrouter-api-key');
    }
  }, [apiKey]);

  const toggleShowApiKey = () => setShowApiKey(!showApiKey);

  return {
    apiKey,
    setApiKey,
    showApiKey,
    toggleShowApiKey
  };
}