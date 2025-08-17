import Anthropic from '@anthropic-ai/sdk';
import { AIStructuredResponse } from '../types';
import { BaseAIProvider } from './base';
import {
  API_CONFIG,
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

class AnthropicService extends BaseAIProvider {
  private client: Anthropic | null = null;

  constructor() {
    super(
      process.env[ENV_KEYS.anthropicApiKey],
      'Anthropic',
      ERROR_MESSAGES.anthropicNotConfigured
    );

    if (this.isConfigured()) {
      this.client = new Anthropic({ apiKey: this.apiKey });
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

      const response = await this.client!.messages.create({
        model: AI_MODELS.anthropic.default,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        system: structuredPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

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
    let messageContent = cleanAIResponseArtifacts(content);

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

export default new AnthropicService();
