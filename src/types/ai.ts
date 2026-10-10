export type AIProvider = 'deepseek' | 'kimi';

export type AIProfile = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type AISettings = {
  provider: AIProvider;
  profiles: Record<AIProvider, AIProfile>;
};
