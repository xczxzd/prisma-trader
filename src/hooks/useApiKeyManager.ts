import { useState, useEffect, useCallback } from 'react';
import { geminiService } from '@/services/geminiService';

export function useApiKeyManager() {
  const [apiKeys, setApiKeys] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const keys = geminiService.getApiKeys();
    setApiKeys(keys);
    setIsConfigured(geminiService.hasKeys());
  }, []);

  const saveApiKeys = useCallback((keys: string) => {
    geminiService.setApiKeys(keys);
    setApiKeys(keys);
    setIsConfigured(geminiService.hasKeys());
    setShowConfig(false);
  }, []);

  const toggleConfig = useCallback(() => {
    setShowConfig(prev => !prev);
  }, []);

  return {
    apiKeys,
    isConfigured,
    showConfig,
    setApiKeys,
    saveApiKeys,
    toggleConfig,
    setShowConfig,
  };
}
