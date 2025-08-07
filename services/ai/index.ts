import anthropicService from './anthropic';
import openaiService from './openai';

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
    const aiProvider = process.env.EXPO_PUBLIC_AI_PROVIDER || 'anthropic';

    // Initialize based on provider
    switch (aiProvider) {
      case 'anthropic':
        this.service = anthropicService.isConfigured()
          ? anthropicService
          : this.getMockService();
        break;
      case 'openai':
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
        const responses = [
          "Hey! How's it going?",
          "That's awesome!",
          'Tell me more about that',
          'Interesting! 🤔',
          'For sure!',
          'I totally get that',
        ];
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
        const musicKeywords = [
          'song',
          'music',
          'track',
          'artist',
          'band',
          'album',
          'listen',
          'playlist',
          'recommend',
        ];
        const containsMusicKeyword = musicKeywords.some(keyword =>
          lastMessage.includes(keyword)
        );

        if (containsMusicKeyword) {
          const musicResponses = [
            "Perfect classic! You're gonna love this one 🎵",
            'This track is absolutely infectious!',
            'Great choice - pure nostalgia and fun!',
            'This one always makes me smile!',
          ];

          const queries = [
            'search:never gonna give you up rick astley',
            'search:sweet child o mine guns n roses',
            "search:don't stop believin journey",
            'search:mr brightside the killers',
          ];

          const randomIndex = Math.floor(Math.random() * musicResponses.length);

          return {
            type: 'music',
            content: musicResponses[randomIndex],
            musicQuery: queries[randomIndex],
          };
        }

        return {
          type: 'text',
          content: "That's interesting!",
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
      console.warn('AI service not configured');
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
      console.warn('AI service not configured');
      return {
        type: 'text',
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
        type: 'text',
        content: this.getFallbackResponse(),
      };
    }
  }

  private getFallbackResponse(): string {
    const responses = [
      "Hey! I'm having trouble connecting right now.",
      'Let me get back to you on that!',
      "That's interesting!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  isConfigured(): boolean {
    return this.service.isConfigured();
  }

  getCurrentProvider(): string {
    return process.env.EXPO_PUBLIC_AI_PROVIDER || 'anthropic';
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
