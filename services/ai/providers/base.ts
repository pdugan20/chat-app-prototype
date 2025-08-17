import { AIService, AIMessage, AIStructuredResponse } from '../types';
import {
  API_CONFIG,
  MUSIC_KEYWORDS,
  MOCK_MUSIC_QUERIES,
  RESPONSE_TYPES,
  LOG_MESSAGES,
} from '../constants';

// Track mentioned songs to prevent repetition
let mentionedSongs = new Set<string>();

export abstract class BaseAIProvider implements AIService {
  protected apiKey: string | undefined;
  protected serviceName: string;
  protected errorMessage: string;

  constructor(
    apiKey: string | undefined,
    serviceName: string,
    errorMessage: string
  ) {
    this.apiKey = apiKey?.trim();
    this.serviceName = serviceName;
    this.errorMessage = errorMessage;
  }

  abstract generateStructuredResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<AIStructuredResponse>;

  // Song tracking methods - shared implementation
  addMentionedSong(songQuery: string): void {
    mentionedSongs.add(songQuery.toLowerCase().trim());
  }

  getMentionedSongs(): string[] {
    return Array.from(mentionedSongs);
  }

  resetMentionedSongs(): void {
    mentionedSongs.clear();
    console.log(LOG_MESSAGES.clearedMentionedSongs);
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  protected validateConfiguration(): void {
    if (!this.isConfigured()) {
      throw new Error(this.errorMessage);
    }
  }

  protected handleError(error: any, errorType: string): never {
    console.error(errorType, error);
    throw error;
  }

  protected getDefaultFallback(): string {
    return API_CONFIG.defaultFallback;
  }

  protected detectSpecialIntent(messages: AIMessage[]): boolean {
    const lastMessage =
      messages[messages.length - 1]?.content.toLowerCase() || '';
    // Currently only detecting music, but can be extended for other intents
    return MUSIC_KEYWORDS.some(keyword => lastMessage.includes(keyword));
  }

  protected getRandomMusicQuery(): string {
    const queries = MOCK_MUSIC_QUERIES;
    return queries[Math.floor(Math.random() * queries.length)];
  }

  protected buildSpecialResponse(type: 'music'): AIStructuredResponse {
    // Can be extended to handle different special response types
    if (type === 'music') {
      return {
        type: RESPONSE_TYPES.MUSIC,
        content: "Here's a song you might like!",
        musicQuery: this.getRandomMusicQuery(),
      };
    }
    // Default fallback for unknown types
    return this.buildTextResponse("I'll help you with that!");
  }

  protected buildTextResponse(content: string): AIStructuredResponse {
    return {
      type: RESPONSE_TYPES.TEXT,
      content,
    };
  }
}
