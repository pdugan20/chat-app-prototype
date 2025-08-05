import OpenAI from 'openai';
import { CHAT_SYSTEM_PROMPT } from './prompts';
import { AI_CONFIG } from './config';
import { AI_MODELS } from './models';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (apiKey && apiKey.trim()) {
      this.client = new OpenAI({
        apiKey: apiKey,
      });
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const systemMessage = {
        role: 'system' as const,
        content: CHAT_SYSTEM_PROMPT(contactName),
      };

      // Use the default model for OpenAI
      const model = AI_MODELS.openai.default;

      const response = await this.client.chat.completions.create({
        model: model,
        messages: [systemMessage, ...messages],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        presence_penalty: 0.6,
        frequency_penalty: 0.5,
      });

      // Extract text from response
      const messageContent = response.choices[0]?.message?.content;

      return messageContent || AI_CONFIG.defaultFallback;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export default new OpenAIService();
