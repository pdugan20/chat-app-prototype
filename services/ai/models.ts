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
    default: 'gpt-4-turbo',
    models: {
      'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        description: 'Fastest, most cost-efficient version',
      },
      'gpt-4o': {
        name: 'GPT-4o',
        description: 'Best balance of speed and capability',
      },
      'gpt-4-turbo': {
        name: 'GPT-4 Turbo',
        description: 'Most capable for complex tasks',
      },
    },
  },
} as const;
