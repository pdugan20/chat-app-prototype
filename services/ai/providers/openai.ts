import OpenAI from 'openai';
import { AIStructuredResponse } from '../types';
import { BaseAIProvider } from './base';
import {
  API_CONFIG,
  PROVIDER_CONFIG,
  ENV_KEYS,
  ERROR_MESSAGES,
} from '../constants';
import { createChatPrompt } from '../prompts';
import { AI_MODELS } from '../models';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class OpenAIService extends BaseAIProvider {
  private client: OpenAI | null = null;

  constructor() {
    super(
      process.env[ENV_KEYS.openaiApiKey],
      'OpenAI',
      ERROR_MESSAGES.openaiNotConfigured
    );

    if (this.isConfigured()) {
      this.client = new OpenAI({ apiKey: this.apiKey });
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<string> {
    this.validateConfiguration();

    try {
      const systemMessage = {
        role: 'system' as const,
        content: createChatPrompt(contactName),
      };

      const response = await this.client!.chat.completions.create({
        model: AI_MODELS.openai.default,
        messages: [systemMessage, ...messages],
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        presence_penalty: PROVIDER_CONFIG.openai.presencePenalty,
        frequency_penalty: PROVIDER_CONFIG.openai.frequencyPenalty,
      });

      return response.choices[0]?.message?.content || this.getDefaultFallback();
    } catch (error) {
      this.handleError(error, ERROR_MESSAGES.apiError);
    }
  }

  async generateStructuredResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    // For now, use simple detection. Could be enhanced with function calling later
    if (this.detectMusicIntent(messages)) {
      return this.buildSimpleMusicResponse();
    }

    const textResponse = await this.generateResponse(messages, contactName);
    return this.buildTextResponse(textResponse);
  }
}

export default new OpenAIService();
