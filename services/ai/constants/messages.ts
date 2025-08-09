/**
 * Message Constants
 * Contains error messages, warnings, and response templates
 */

export const ERROR_MESSAGES = {
  anthropicNotConfigured: 'Anthropic API key not configured',
  openaiNotConfigured: 'OpenAI API key not configured',
  serviceNotConfigured: 'AI service not configured',
  apiError: 'AI service error:',
  structuredResponseError: 'AI structured response error:',
} as const;

export const WARNING_MESSAGES = {
  serviceNotConfigured: 'AI service not configured',
} as const;

export const MOCK_RESPONSES = {
  fallback: ['Let me get back to you on that!'],
  general: [
    "Hey! How's it going?",
    "That's awesome!",
    'Tell me more about that',
    'For sure!',
    'I totally get that',
  ],
  musicReactions: [
    "Perfect classic! You're gonna love this one 🎵",
    'This track is absolutely infectious!',
    'Great choice - pure nostalgia and fun!',
    'This one always makes me smile!',
  ],
  defaultMusic: "Here's a song recommendation!",
  defaultText: "That's interesting!",
} as const;

export const LOG_MESSAGES = {
  clearedMentionedSongs: '🎵 Cleared mentioned songs list',
} as const;
