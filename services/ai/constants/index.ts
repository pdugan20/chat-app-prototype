/**
 * Central export point for all AI service constants
 * Provides organized access to all constant values used across AI services
 */

// Configuration exports
export { API_CONFIG, PROVIDER_CONFIG, MOCK_CONFIG, ENV_KEYS } from './config';

// Message exports
export {
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  MOCK_RESPONSES,
  LOG_MESSAGES,
} from './messages';

// Music-related exports
export {
  MUSIC_KEYWORDS,
  MOCK_MUSIC_QUERIES,
  MUSIC_RESPONSE_FORMATS,
} from './music';

// Provider-specific exports
export {
  PROVIDER_NAMES,
  RESPONSE_TYPES,
  ANTHROPIC_FORMATS,
  type ResponseType,
  type ProviderName,
} from './providers';

// Prompt exports
export {
  createChatPrompt,
  createMentionedSongsContext,
  createMusicDetectionPrompt,
  CHAT_SYSTEM_PROMPT,
} from './prompts';

// Re-export models (keeping backward compatibility)
export { AI_MODELS } from '../models';
export type { AIProvider, AnthropicModel, OpenAIModel } from '../models';
