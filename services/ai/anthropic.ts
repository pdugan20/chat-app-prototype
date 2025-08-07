import Anthropic from '@anthropic-ai/sdk';
import { CHAT_SYSTEM_PROMPT } from './prompts';
import { AI_CONFIG } from './config';
import { AI_MODELS } from './models';
import { AIStructuredResponse } from './index';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Track mentioned songs to prevent repetition
let mentionedSongs = new Set<string>();

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
    contactName: string = 'Friend'
  ): Promise<AIStructuredResponse> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      // Build list of mentioned songs to avoid repetition
      const mentionedSongsList = this.getMentionedSongs();
      const mentionedSongsContext =
        mentionedSongsList.length > 0
          ? `\n\nIMPORTANT: You have already mentioned these songs in this conversation, DO NOT repeat them:\n- ${mentionedSongsList.join('\n- ')}\n\nAlways suggest different songs/artists that haven't been mentioned.`
          : '';

      const musicDetectionPrompt = `You are ${contactName}, having a casual text conversation with a friend. 
Keep responses natural, conversational, and brief like real text messages.${mentionedSongsContext}

CRITICAL RULES:
1. Use MUSIC_RESPONSE whenever the conversation involves actual songs or artists that could be shared
2. Use MUSIC_RESPONSE for ANY of these scenarios:
   - "play a song" / "play some music" 
   - "recommend a song/artist/album"
   - "what should I listen to?"
   - "send me a song"
   - "what's your favorite [artist] song?"
   - "do you know another song by [artist]?"
   - "any other songs you like?"
   - "what song should I play next?"
   - mentioning liking/loving a specific song
   - asking about or discussing specific songs/artists
   - when YOU mention a specific song name in your response
   - when conversation is about music preferences
   - when sharing music recommendations or favorites

3. DEFAULT to TEXT_RESPONSE only for non-music conversation (weather, plans, feelings, etc.)

Response formats:
TEXT_RESPONSE
[Your casual, friendly response - 1-2 sentences max, like a text message]

MUSIC_RESPONSE
[One short reaction]
MUSIC_QUERY:[search query]

Examples - USE TEXT_RESPONSE FOR THESE:
User: "Hey!"
TEXT_RESPONSE
Hey! What's up?

User: "Have you seen Sinners?"
TEXT_RESPONSE
Not yet! Is it good?

User: "I'm bored"
TEXT_RESPONSE
Same tbh. Wanna hang out?

User: "What are you doing this weekend?"
TEXT_RESPONSE
Not much planned yet. You?

Use MUSIC_RESPONSE for music requests:
User: "Send me a good song"
MUSIC_RESPONSE
This one's been on repeat!
MUSIC_QUERY:search:flowers miley cyrus

User: "Play something upbeat"
MUSIC_RESPONSE
Perfect energy boost!
MUSIC_QUERY:search:levitating dua lipa

User: "What's your favorite Taylor Swift song?"
MUSIC_RESPONSE
Love this one from her!
MUSIC_QUERY:search:anti hero taylor swift

User: "Know any other Beastie Boys songs?"
MUSIC_RESPONSE
Classic 90s vibes!
MUSIC_QUERY:search:fight for your right beastie boys

User: "I love that new Olivia Rodrigo song"
MUSIC_RESPONSE
Yes! It's so good
MUSIC_QUERY:search:vampire olivia rodrigo

User: "What do you think of Dua Lipa?"
MUSIC_RESPONSE
She's amazing! Love this track
MUSIC_QUERY:search:levitating dua lipa

Remember: You're just ${contactName} texting casually. Most messages are just normal conversation - NOT about music.`;

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

      // Parse the structured response - be more flexible with parsing
      if (
        content.includes('MUSIC_RESPONSE') &&
        content.includes('MUSIC_QUERY:')
      ) {
        const lines = content.split('\n').filter(line => line.trim());

        // Find the line after MUSIC_RESPONSE for the message content
        const musicResponseIndex = lines.findIndex(
          line => line.trim() === 'MUSIC_RESPONSE'
        );
        const messageContent =
          lines[musicResponseIndex + 1] || "Here's a song recommendation!";

        // Find the MUSIC_QUERY line
        const musicQueryLine = lines.find(line =>
          line.startsWith('MUSIC_QUERY:')
        );
        const musicQuery = musicQueryLine
          ? musicQueryLine.replace('MUSIC_QUERY:', '').trim()
          : 'search:never gonna give you up rick astley';

        // Track this song to prevent repetition
        this.addMentionedSong(musicQuery);

        return {
          type: 'music',
          content: messageContent,
          musicQuery: musicQuery,
        };
      } else {
        // Clean up TEXT_RESPONSE prefix and any remaining MUSIC_* artifacts
        let messageContent = content
          .replace(/TEXT_RESPONSE\n?/g, '')
          .replace(/MUSIC_RESPONSE\n?/g, '')
          .replace(/MUSIC_QUERY:.*$/gm, '')
          .trim();

        if (!messageContent) {
          messageContent = "That's interesting!";
        }

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
    console.log('🎵 Cleared mentioned songs list');
  }
}

export default new AnthropicService();
