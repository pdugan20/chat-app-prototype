import OpenAI from 'openai';
import { CHAT_SYSTEM_PROMPT } from './prompts';
import { AI_CONFIG } from './config';
import { AI_MODELS } from './models';
import { AIStructuredResponse } from './index';

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

  async generateStructuredResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    // For simplicity, use the same mock logic as the mock service
    // In production, you'd implement OpenAI-specific structured response logic
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    const musicKeywords = ['song', 'music', 'track', 'artist', 'band', 'album', 'listen', 'playlist', 'recommend'];
    const containsMusicKeyword = musicKeywords.some(keyword => lastMessage.includes(keyword));
    
    if (containsMusicKeyword) {
      return {
        type: 'music',
        content: "Here's a song you might like!",
        musicQuery: 'search:never gonna give you up rick astley'
      };
    }
    
    // Otherwise, generate a normal text response
    const textResponse = await this.generateResponse(messages, contactName);
    return {
      type: 'text',
      content: textResponse,
    };
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export default new OpenAIService();
