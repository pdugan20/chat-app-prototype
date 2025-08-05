import Anthropic from '@anthropic-ai/sdk';
import { CHAT_SYSTEM_PROMPT } from './prompts';
import { AI_CONFIG } from './config';
import { AI_MODELS } from './models';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class AnthropicService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    if (apiKey && apiKey.trim()) {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const response = await this.client.messages.create({
        model: AI_MODELS.anthropic.default,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        system: CHAT_SYSTEM_PROMPT(contactName),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      // Extract text from response
      const textContent = response.content.find(
        content => content.type === 'text'
      );

      return textContent?.text || AI_CONFIG.defaultFallback;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export default new AnthropicService();
