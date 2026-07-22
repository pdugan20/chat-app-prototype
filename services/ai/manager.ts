import { AIService, AIMessage, AIStructuredResponse } from './types';
import proxyService from './providers/proxy';
import mockService from './providers/mock';
import {
  PROVIDER_NAMES,
  WARNING_MESSAGES,
  ERROR_MESSAGES,
  MOCK_RESPONSES,
  RESPONSE_TYPES,
} from './constants';

export class AIServiceManager implements AIService {
  private service: AIService;
  private currentProvider: string;

  constructor(
    liveService: AIService = proxyService,
    fallbackService: AIService = mockService
  ) {
    if (liveService.isConfigured()) {
      this.service = liveService;
      this.currentProvider = PROVIDER_NAMES.PROXY;
    } else {
      this.service = fallbackService;
      this.currentProvider = PROVIDER_NAMES.MOCK;
    }
  }

  async generateStructuredResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<AIStructuredResponse> {
    if (!this.service.isConfigured()) {
      console.warn(WARNING_MESSAGES.serviceNotConfigured);
      return {
        type: RESPONSE_TYPES.TEXT,
        content: this.getFallbackResponse(),
      };
    }

    try {
      return await this.service.generateStructuredResponse(
        messages,
        contactName
      );
    } catch (error) {
      console.error(ERROR_MESSAGES.structuredResponseError, error);
      return {
        type: RESPONSE_TYPES.TEXT,
        content: this.getFallbackResponse(),
      };
    }
  }

  private getFallbackResponse(): string {
    const responses = MOCK_RESPONSES.fallback;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isConfigured(): boolean {
    return this.service.isConfigured();
  }

  getCurrentProvider(): string {
    return this.currentProvider;
  }

  // Song tracking methods - pass through to underlying service
  addMentionedSong(songQuery: string): void {
    if (this.service.addMentionedSong) {
      this.service.addMentionedSong(songQuery);
    }
  }

  getMentionedSongs(): string[] {
    if (this.service.getMentionedSongs) {
      return this.service.getMentionedSongs();
    }
    return [];
  }

  resetMentionedSongs(): void {
    if (this.service.resetMentionedSongs) {
      this.service.resetMentionedSongs();
    }
  }
}

export default new AIServiceManager();
