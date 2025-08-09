/**
 * Provider-Specific Constants
 * Contains constants specific to each AI provider
 */

export const PROVIDER_NAMES = {
  ANTHROPIC: 'anthropic',
  OPENAI: 'openai',
  MOCK: 'mock',
} as const;

export const RESPONSE_TYPES = {
  TEXT: 'text',
  MUSIC: 'music',
} as const;

export const ANTHROPIC_FORMATS = {
  responseTypes: {
    text: 'TEXT_RESPONSE',
    music: 'MUSIC_RESPONSE',
  },
} as const;

export type ResponseType = (typeof RESPONSE_TYPES)[keyof typeof RESPONSE_TYPES];
export type ProviderName = (typeof PROVIDER_NAMES)[keyof typeof PROVIDER_NAMES];
