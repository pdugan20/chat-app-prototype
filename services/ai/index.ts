import anthropicService from './anthropic';
import openaiService from './openai';
import {
  PROVIDER_NAMES,
  ENV_KEYS,
  WARNING_MESSAGES,
  MOCK_RESPONSES,
  MUSIC_KEYWORDS,
  MOCK_MUSIC_QUERIES,
  RESPONSE_TYPES,
} from './constants';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIStructuredResponse {
  type: 'text' | 'music';
  content: string;
  musicQuery?: string; // For music responses
}

export interface AIService {
  generateResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<string>;
  generateStructuredResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<AIStructuredResponse>;
  isConfigured(): boolean;
  // Song tracking methods (optional for non-anthropic services)
  addMentionedSong?(songQuery: string): void;
  getMentionedSongs?(): string[];
  resetMentionedSongs?(): void;
}

class AIServiceManager {
  private service: AIService;

  constructor() {
    const aiProvider =
      process.env[ENV_KEYS.provider] || PROVIDER_NAMES.ANTHROPIC;

    // Initialize based on provider
    switch (aiProvider) {
      case PROVIDER_NAMES.ANTHROPIC:
        this.service = anthropicService.isConfigured()
          ? anthropicService
          : this.getMockService();
        break;
      case PROVIDER_NAMES.OPENAI:
        this.service = openaiService.isConfigured()
          ? openaiService
          : this.getMockService();
        break;
      default:
        this.service = this.getMockService();
    }
  }

  private getMockService(): AIService {
    return {
      async generateResponse(): Promise<string> {
        const responses = MOCK_RESPONSES.general;
        // Simulate API delay
        await new Promise(resolve =>
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
        return responses[Math.floor(Math.random() * responses.length)];
      },
      async generateStructuredResponse(
        messages: AIMessage[]
      ): Promise<AIStructuredResponse> {
        // Simulate API delay
        await new Promise(resolve =>
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );

        const lastMessage =
          messages[messages.length - 1]?.content.toLowerCase() || '';

        // Detect music-related requests
        const containsMusicKeyword = MUSIC_KEYWORDS.some(keyword =>
          lastMessage.includes(keyword)
        );

        if (containsMusicKeyword) {
          const musicResponses = MOCK_RESPONSES.musicReactions;

          const queries = MOCK_MUSIC_QUERIES;

          const randomIndex = Math.floor(Math.random() * musicResponses.length);

          return {
            type: RESPONSE_TYPES.MUSIC,
            content: musicResponses[randomIndex],
            musicQuery: queries[randomIndex],
          };
        }

        return {
          type: RESPONSE_TYPES.TEXT,
          content: MOCK_RESPONSES.defaultText,
        };
      },
      isConfigured(): boolean {
        return true;
      },
    };
  }

  async generateResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<string> {
    if (!this.service.isConfigured()) {
      console.warn(WARNING_MESSAGES.serviceNotConfigured);
      return this.getFallbackResponse();
    }

    try {
      return await this.service.generateResponse(messages, contactName);
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackResponse();
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
      console.error('AI structured response error:', error);
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
    return process.env[ENV_KEYS.provider] || PROVIDER_NAMES.ANTHROPIC;
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
