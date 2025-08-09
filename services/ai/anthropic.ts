import Anthropic from '@anthropic-ai/sdk';
import { AIStructuredResponse } from './index';
import {
  AI_MODELS,
  API_CONFIG,
  ENV_KEYS,
  ERROR_MESSAGES,
  RESPONSE_TYPES,
  ANTHROPIC_FORMATS,
  MUSIC_RESPONSE_FORMATS,
  MOCK_RESPONSES,
  MOCK_MUSIC_QUERIES,
  LOG_MESSAGES,
  createChatPrompt,
  createMusicDetectionPrompt,
} from './constants';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Track mentioned songs to prevent repetition
let mentionedSongs = new Set<string>();

class AnthropicService {
  private client: Anthropic | null = null;

  constructor() {
    const apiKey = process.env[ENV_KEYS.anthropicApiKey];
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
      throw new Error(ERROR_MESSAGES.anthropicNotConfigured);
    }

    try {
      const response = await this.client.messages.create({
        model: AI_MODELS.anthropic.default,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        system: createChatPrompt(contactName),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      // Extract text from response
      const textContent = response.content.find(
        content => content.type === 'text'
      );

      return textContent?.text || API_CONFIG.defaultFallback;
    } catch (error) {
      console.error(ERROR_MESSAGES.apiError, error);
      throw error;
    }
  }

  async generateStructuredResponse(
    messages: ChatMessage[],
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    if (!this.client) {
      throw new Error(ERROR_MESSAGES.anthropicNotConfigured);
    }

    try {
      // Build list of mentioned songs to avoid repetition
      const mentionedSongsList = this.getMentionedSongs();
      const musicDetectionPrompt = createMusicDetectionPrompt(
        contactName,
        mentionedSongsList
      );

      const response = await this.client.messages.create({
        model: AI_MODELS.anthropic.default,
        max_tokens: API_CONFIG.maxTokens,
        temperature: API_CONFIG.temperature,
        system: musicDetectionPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      // Parse the structured response - be more flexible with parsing
      if (
        content.includes(ANTHROPIC_FORMATS.responseTypes.music) &&
        content.includes(MUSIC_RESPONSE_FORMATS.queryPrefix)
      ) {
        const lines = content.split('\n').filter(line => line.trim());

        // Find the line after MUSIC_RESPONSE for the message content
        const musicResponseIndex = lines.findIndex(
          line => line.trim() === ANTHROPIC_FORMATS.responseTypes.music
        );
        const messageContent =
          lines[musicResponseIndex + 1] || MOCK_RESPONSES.defaultMusic;

        // Find the MUSIC_QUERY line
        const musicQueryLine = lines.find(line =>
          line.startsWith(MUSIC_RESPONSE_FORMATS.queryPrefix)
        );
        const musicQuery = musicQueryLine
          ? musicQueryLine
              .replace(MUSIC_RESPONSE_FORMATS.queryPrefix, '')
              .trim()
          : MOCK_MUSIC_QUERIES[0];

        // Track this song to prevent repetition
        this.addMentionedSong(musicQuery);

        return {
          type: RESPONSE_TYPES.MUSIC,
          content: messageContent,
          musicQuery: musicQuery,
        };
      } else {
        // Clean up TEXT_RESPONSE prefix and any remaining MUSIC_* artifacts
        let messageContent = content
          .replace(
            new RegExp(`${ANTHROPIC_FORMATS.responseTypes.text}\n?`, 'g'),
            ''
          )
          .replace(
            new RegExp(`${ANTHROPIC_FORMATS.responseTypes.music}\n?`, 'g'),
            ''
          )
          .replace(
            new RegExp(`${MUSIC_RESPONSE_FORMATS.queryPrefix}.*$`, 'gm'),
            ''
          )
          .trim();

        if (!messageContent) {
          messageContent = MOCK_RESPONSES.defaultText;
        }

        return {
          type: RESPONSE_TYPES.TEXT,
          content: messageContent,
        };
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.structuredResponseError, error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  // Add song to mentioned list
  addMentionedSong(songQuery: string): void {
    mentionedSongs.add(songQuery.toLowerCase().trim());
  }

  // Get list of mentioned songs for prompt context
  getMentionedSongs(): string[] {
    return Array.from(mentionedSongs);
  }

  // Reset mentioned songs (for chat reset)
  resetMentionedSongs(): void {
    mentionedSongs.clear();
    console.log(LOG_MESSAGES.clearedMentionedSongs);
  }
}

export default new AnthropicService();
