import type { AIProvider, AISettings } from '../types/ai';

export const AI_PROVIDERS: Record<AIProvider, { name: string; baseUrl: string; model: string }> = {
  deepseek: { name: 'DeepSeek', baseUrl: 'https://api.deepseek.com', model: 'deepseek-flash' },
  kimi: { name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'kimi-k3' },
};

export function createAISettings(): AISettings {
  return {
    provider: 'deepseek',
    profiles: {
      deepseek: { baseUrl: AI_PROVIDERS.deepseek.baseUrl, model: AI_PROVIDERS.deepseek.model, apiKey: '' },
      kimi: { baseUrl: AI_PROVIDERS.kimi.baseUrl, model: AI_PROVIDERS.kimi.model, apiKey: '' },
    },
  };
}
