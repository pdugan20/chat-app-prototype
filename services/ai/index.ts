import anthropicService from './anthropic';
import openaiService from './openai';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIService {
  generateResponse(
    messages: AIMessage[],
    contactName?: string
  ): Promise<string>;
  isConfigured(): boolean;
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
}

export default new AIServiceManager();
