import OpenAI from 'openai';
import { AIStructuredResponse } from '../types';
import { BaseAIProvider } from './base';
import {
  API_CONFIG,
  PROVIDER_CONFIG,
  ENV_KEYS,
  ERROR_MESSAGES,
  RESPONSE_TYPES,
  AI_RESPONSE_FORMATS,
  MUSIC_RESPONSE_FORMATS,
  MOCK_RESPONSES,
} from '../constants';
import { createStructuredPrompt } from '../prompts';
import { AI_MODELS } from '../models';
import { cleanAIResponseArtifacts } from '../utils';

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

  async generateStructuredResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    this.validateConfiguration();

    try {
      const mentionedSongsList = this.getMentionedSongs();
      const structuredPrompt = createStructuredPrompt(
        contactName,
        mentionedSongsList
      );

      const systemMessage = {
        role: 'system' as const,
        content: structuredPrompt,
      };

      const response = await this.client!.chat.completions.create({
        model: AI_MODELS.openai.default,
        messages: [systemMessage, ...messages],
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        presence_penalty: PROVIDER_CONFIG.openai.presencePenalty,
        frequency_penalty: PROVIDER_CONFIG.openai.frequencyPenalty,
      });

      const content = response.choices[0]?.message?.content || '';

      return this.parseStructuredResponse(content);
    } catch (error) {
      this.handleError(error, ERROR_MESSAGES.structuredResponseError);
    }
  }

  private parseStructuredResponse(content: string): AIStructuredResponse {
    // Check for special response types (currently music, can be extended)
    if (
      content.includes(AI_RESPONSE_FORMATS.responseTypes.music) &&
      content.includes(MUSIC_RESPONSE_FORMATS.queryPrefix)
    ) {
      return this.parseMusicResponse(content);
    }

    // Future special response types can be added here:
    // if (content.includes(ANTHROPIC_FORMATS.responseTypes.location)) {
    //   return this.parseLocationResponse(content);
    // }

    // Default to text response
    let messageContent = content.trim();

    // Remove TEXT_RESPONSE prefix if present
    if (messageContent.startsWith(AI_RESPONSE_FORMATS.responseTypes.text)) {
      messageContent = messageContent
        .replace(AI_RESPONSE_FORMATS.responseTypes.text, '')
        .trim();
    }

    // Clean any remaining artifacts
    messageContent = cleanAIResponseArtifacts(messageContent);

    if (!messageContent) {
      messageContent = MOCK_RESPONSES.defaultText;
    }

    return this.buildTextResponse(messageContent);
  }

  private parseMusicResponse(content: string): AIStructuredResponse {
    const lines = content.split('\n').filter(line => line.trim());

    const musicResponseIndex = lines.findIndex(
      line => line.trim() === AI_RESPONSE_FORMATS.responseTypes.music
    );
    const messageContent =
      lines[musicResponseIndex + 1] || MOCK_RESPONSES.defaultMusic;

    const musicQueryLine = lines.find(line =>
      line.startsWith(MUSIC_RESPONSE_FORMATS.queryPrefix)
    );
    const musicQuery = musicQueryLine
      ? musicQueryLine.replace(MUSIC_RESPONSE_FORMATS.queryPrefix, '').trim()
      : this.getRandomMusicQuery();

    this.addMentionedSong(musicQuery);

    return {
      type: RESPONSE_TYPES.MUSIC,
      content: messageContent,
      musicQuery: musicQuery,
    };
  }
}

export default new OpenAIService();
