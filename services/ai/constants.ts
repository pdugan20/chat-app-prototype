export const MOCK_CONFIG = {
  minDelay: 1000,
  maxDelay: 2000,
} as const;

export const ENV_KEYS = {
  proxyUrl: 'EXPO_PUBLIC_AI_PROXY_URL',
} as const;

export const PROVIDER_NAMES = {
  PROXY: 'proxy',
  MOCK: 'mock',
} as const;

export const RESPONSE_TYPES = {
  TEXT: 'text',
  MUSIC: 'music',
} as const;

export const AI_RESPONSE_FORMATS = {
  responseTypes: {
    text: 'TEXT_RESPONSE',
    music: 'MUSIC_RESPONSE',
  },
} as const;

export const MUSIC_RESPONSE_FORMATS = {
  searchPrefix: 'search:',
  queryPrefix: 'MUSIC_QUERY:',
} as const;

export const ERROR_MESSAGES = {
  proxyNotConfigured: 'AI proxy URL not configured',
  structuredResponseError: 'AI structured response error:',
} as const;

export const WARNING_MESSAGES = {
  serviceNotConfigured: 'AI service not configured',
} as const;

export const LOG_MESSAGES = {
  clearedMentionedSongs: '🎵 Cleared mentioned songs list',
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

// Keywords for detecting special intents (currently music, can be extended)
export const MUSIC_KEYWORDS = [
  'song',
  'music',
  'track',
  'artist',
  'band',
  'album',
  'listen',
  'playlist',
  'recommend',
  'play',
  'spotify',
  'apple music',
  'favorite',
] as const;

export const MOCK_MUSIC_QUERIES = [
  'search:never gonna give you up rick astley',
  'search:sweet child o mine guns n roses',
  "search:don't stop believin journey",
  'search:mr brightside the killers',
] as const;
