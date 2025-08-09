import OpenAI from 'openai';
import { AIStructuredResponse } from './index';
import {
  AI_MODELS,
  API_CONFIG,
  PROVIDER_CONFIG,
  ENV_KEYS,
  ERROR_MESSAGES,
  RESPONSE_TYPES,
  MUSIC_KEYWORDS,
  MOCK_MUSIC_QUERIES,
  createChatPrompt,
} from './constants';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    const apiKey = process.env[ENV_KEYS.openaiApiKey];
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
      throw new Error(ERROR_MESSAGES.openaiNotConfigured);
    }

    try {
      const systemMessage = {
        role: 'system' as const,
        content: createChatPrompt(contactName),
      };

      // Use the default model for OpenAI
      const model = AI_MODELS.openai.default;

      const response = await this.client.chat.completions.create({
        model: model,
        messages: [systemMessage, ...messages],
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        presence_penalty: PROVIDER_CONFIG.openai.presencePenalty,
        frequency_penalty: PROVIDER_CONFIG.openai.frequencyPenalty,
      });

      // Extract text from response
      const messageContent = response.choices[0]?.message?.content;

      return messageContent || API_CONFIG.defaultFallback;
    } catch (error) {
      console.error(ERROR_MESSAGES.apiError, error);
      throw error;
    }
  }

  async generateStructuredResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    // For simplicity, use the same mock logic as the mock service
    // In production, you'd implement OpenAI-specific structured response logic
    const lastMessage =
      messages[messages.length - 1]?.content.toLowerCase() || '';
    const containsMusicKeyword = MUSIC_KEYWORDS.some(keyword =>
      lastMessage.includes(keyword)
    );

    if (containsMusicKeyword) {
      return {
        type: RESPONSE_TYPES.MUSIC,
        content: "Here's a song you might like!",
        musicQuery: MOCK_MUSIC_QUERIES[0],
      };
    }

    // Otherwise, generate a normal text response
    const textResponse = await this.generateResponse(messages, contactName);
    return {
      type: RESPONSE_TYPES.TEXT,
      content: textResponse,
    };
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export default new OpenAIService();
