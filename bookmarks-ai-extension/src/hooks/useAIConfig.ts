import { useState, useEffect, useCallback } from 'react';
import type { AIConfig } from '../types';
import { DEFAULT_CONFIG } from '../types';

const STORAGE_KEY = 'ai_config';

export function useAIConfig() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          setConfig({ ...DEFAULT_CONFIG, ...result[STORAGE_KEY] });
        }
      } catch (error) {
        console.error('加载配置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadConfig();
  }, []);

  const updateConfig = useCallback(async (newConfig: AIConfig) => {
    setConfig(newConfig);
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: newConfig });
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }, []);

  const isConfigured = Boolean(config.apiKey && config.baseUrl && config.model);

  return { config, updateConfig, isConfigured, isLoading };
}
