import Anthropic from '@anthropic-ai/sdk';
import { CHAT_SYSTEM_PROMPT } from './prompts';
import { AI_CONFIG } from './config';
import { AI_MODELS } from './models';
import { AIStructuredResponse } from './index';

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

  async generateStructuredResponse(
    messages: ChatMessage[],
    _contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const musicDetectionPrompt = `You are a helpful assistant in a chat app. Analyze the conversation and determine if the user is asking for music recommendations, songs, or anything music-related.

If the message is about music, respond with exactly this format:
MUSIC_RESPONSE
[One short sentence - be specific to the song/artist when possible, or reference their request. Examples: "Beastie Boys never disappoint!" or "Perfect for that upbeat vibe!" or "Classic 90s energy!"]
MUSIC_QUERY:[search query for Apple Music, like "search:song title artist name"]

If the message is NOT about music, respond with exactly this format:
TEXT_RESPONSE
[Your normal helpful response]

Examples:
User: "Can you recommend a good song?"
MUSIC_RESPONSE
Queen always delivers! 🎵
MUSIC_QUERY:search:bohemian rhapsody queen

User: "I need something upbeat"
MUSIC_RESPONSE
Perfect for that energy boost!
MUSIC_QUERY:search:uptown funk bruno mars

User: "Play some Beastie Boys"
MUSIC_RESPONSE
Classic 90s hip-hop vibes!
MUSIC_QUERY:search:sabotage beastie boys

User: "What's the weather like?"
TEXT_RESPONSE
I don't have access to current weather data, but you could check a weather app for the latest conditions!

CRITICAL: Music responses must be ONE SHORT SENTENCE - be specific to the artist/song or user's request when possible!

Now respond to the conversation:`;

      const response = await this.client.messages.create({
        model: AI_MODELS.anthropic.default,
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
        system: musicDetectionPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const content =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      // Parse the structured response
      if (content.startsWith('MUSIC_RESPONSE')) {
        const lines = content.split('\n').filter(line => line.trim());
        const messageContent = lines[1] || "Here's a song recommendation!";
        const musicQueryLine = lines.find(line =>
          line.startsWith('MUSIC_QUERY:')
        );
        const musicQuery = musicQueryLine
          ? musicQueryLine.replace('MUSIC_QUERY:', '')
          : 'search:never gonna give you up rick astley';

        return {
          type: 'music',
          content: messageContent,
          musicQuery: musicQuery,
        };
      } else {
        const messageContent =
          content.replace('TEXT_RESPONSE\n', '').trim() ||
          "That's interesting!";
        return {
          type: 'text',
          content: messageContent,
        };
      }
    } catch (error) {
      console.error('Anthropic structured response error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }
}

export default new AnthropicService();
