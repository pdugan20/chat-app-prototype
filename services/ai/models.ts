export const AI_MODELS = {
  anthropic: {
    default: 'claude-3-5-sonnet-20241022',
    models: {
      'claude-3-5-haiku-20241022': {
        name: 'Claude 3.5 Haiku',
        description: 'Fastest, most affordable',
      },
      'claude-3-5-sonnet-20241022': {
        name: 'Claude 3.5 Sonnet',
        description: 'Best balance of speed and capability',
      },
      'claude-3-opus-20240229': {
        name: 'Claude 3 Opus',
        description: 'Most capable for complex tasks',
      },
    },
  },
  openai: {
    default: 'gpt-3.5-turbo',
    models: {
      'gpt-3.5-turbo': {
        name: 'GPT-3.5 Turbo',
        description: 'Fast and affordable',
      },
      'gpt-4': {
        name: 'GPT-4',
        description: 'Most capable',
      },
      'gpt-4-turbo-preview': {
        name: 'GPT-4 Turbo',
        description: 'Latest GPT-4 with longer context',
      },
    },
  },
} as const;

export type AIProvider = keyof typeof AI_MODELS;
export type AnthropicModel = keyof typeof AI_MODELS.anthropic.models;
export type OpenAIModel = keyof typeof AI_MODELS.openai.models;
