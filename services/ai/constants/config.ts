/**
 * AI Service Configuration Constants
 * Contains API configurations, token limits, and service settings
 */

export const API_CONFIG = {
  maxTokens: 150,
  temperature: 0.8,
  defaultFallback: 'Hey!',
} as const;

export const PROVIDER_CONFIG = {
  anthropic: {
    presencePenalty: 0,
    frequencyPenalty: 0,
  },
  openai: {
    presencePenalty: 0.6,
    frequencyPenalty: 0.5,
  },
} as const;

export const MOCK_CONFIG = {
  minDelay: 1000,
  maxDelay: 2000,
} as const;

export const ENV_KEYS = {
  provider: 'EXPO_PUBLIC_AI_PROVIDER',
  anthropicApiKey: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
  openaiApiKey: 'EXPO_PUBLIC_OPENAI_API_KEY',
} as const;
