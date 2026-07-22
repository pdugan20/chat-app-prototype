import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const OPENAI_MODEL = 'gpt-4o';
const MAX_TOKENS = 150;
const TEMPERATURE = 0.8;

const requireContent = content => {
  const normalized = content?.trim();
  if (!normalized) {
    throw new Error('AI provider returned an empty response');
  }
  return normalized;
};

export function createGenerator(config, clients = {}) {
  if (config.provider === 'anthropic') {
    const client =
      clients.anthropic ?? new Anthropic({ apiKey: config.apiKey });

    return async ({ systemPrompt, messages }) => {
      const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: systemPrompt,
        messages,
      });
      const textBlock = response.content.find(block => block.type === 'text');
      return requireContent(textBlock?.text);
    };
  }

  const client = clients.openai ?? new OpenAI({ apiKey: config.apiKey });

  return async ({ systemPrompt, messages }) => {
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });
    return requireContent(response.choices[0]?.message?.content);
  };
}
