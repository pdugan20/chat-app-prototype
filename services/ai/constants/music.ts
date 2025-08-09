/**
 * Music-Related Constants
 * Contains music detection keywords, sample queries, and music-specific configurations
 */

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

export const MUSIC_RESPONSE_FORMATS = {
  searchPrefix: 'search:',
  queryPrefix: 'MUSIC_QUERY:',
} as const;
