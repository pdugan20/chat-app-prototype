import { AIService, AIMessage, AIStructuredResponse } from '../types';
import {
  API_CONFIG,
  MUSIC_KEYWORDS,
  MOCK_MUSIC_QUERIES,
  RESPONSE_TYPES,
} from '../constants';

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

  abstract generateResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<string>;

  abstract generateStructuredResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<AIStructuredResponse>;

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

  protected detectMusicIntent(messages: AIMessage[]): boolean {
    const lastMessage =
      messages[messages.length - 1]?.content.toLowerCase() || '';
    return MUSIC_KEYWORDS.some(keyword => lastMessage.includes(keyword));
  }

  protected getRandomMusicQuery(): string {
    const queries = MOCK_MUSIC_QUERIES;
    return queries[Math.floor(Math.random() * queries.length)];
  }

  protected buildSimpleMusicResponse(): AIStructuredResponse {
    return {
      type: RESPONSE_TYPES.MUSIC,
      content: "Here's a song you might like!",
      musicQuery: this.getRandomMusicQuery(),
    };
  }

  protected buildTextResponse(content: string): AIStructuredResponse {
    return {
      type: RESPONSE_TYPES.TEXT,
      content,
    };
  }
}
