import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const MAX_TOKENS = 220;

const requireContent = content => {
  const normalized = content?.trim();
  if (!normalized) {
    throw new Error('AI provider returned an empty response');
  }
  return normalized;
};

export function createGenerator(config, clients = {}) {
  const withDeadline = async generate => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      return await generate({
        timeout: config.timeoutMs,
        maxRetries: 0,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  };

  if (config.provider === 'anthropic') {
    const client =
      clients.anthropic ?? new Anthropic({ apiKey: config.apiKey });

    return async ({ systemPrompt, messages }) =>
      withDeadline(async requestOptions => {
        const response = await client.messages.create(
          {
            model: config.model,
            max_tokens: MAX_TOKENS,
            system: systemPrompt,
            messages,
          },
          requestOptions
        );
        const textBlock = response.content.find(block => block.type === 'text');
        return requireContent(textBlock?.text);
      });
  }

  const client = clients.openai ?? new OpenAI({ apiKey: config.apiKey });

  return async ({ systemPrompt, messages }) =>
    withDeadline(async requestOptions => {
      const response = await client.responses.create(
        {
          model: config.model,
          instructions: systemPrompt,
          input: messages,
          store: false,
          max_output_tokens: MAX_TOKENS,
          reasoning: { effort: 'none' },
        },
        requestOptions
      );
      return requireContent(response.output_text);
    });
}
