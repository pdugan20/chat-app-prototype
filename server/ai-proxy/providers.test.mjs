import assert from 'node:assert/strict';
import test from 'node:test';

import { createGenerator } from './providers.mjs';

const request = {
  systemPrompt: 'system',
  messages: [{ role: 'user', content: 'hello' }],
};

test('generates Anthropic text', async () => {
  let payload;
  const clients = {
    anthropic: {
      messages: {
        create: async value => {
          payload = value;
          return { content: [{ type: 'text', text: 'Claude reply' }] };
        },
      },
    },
  };
  const generate = createGenerator(
    { provider: 'anthropic', apiKey: 'secret', port: 8787 },
    clients
  );

  assert.equal(await generate(request), 'Claude reply');
  assert.deepEqual(payload, {
    model: 'claude-sonnet-4-6',
    max_tokens: 150,
    temperature: 0.8,
    system: 'system',
    messages: request.messages,
  });
});

test('generates OpenAI text', async () => {
  let payload;
  const clients = {
    openai: {
      chat: {
        completions: {
          create: async value => {
            payload = value;
            return { choices: [{ message: { content: 'OpenAI reply' } }] };
          },
        },
      },
    },
  };
  const generate = createGenerator(
    { provider: 'openai', apiKey: 'secret', port: 8787 },
    clients
  );

  assert.equal(await generate(request), 'OpenAI reply');
  assert.deepEqual(payload, {
    model: 'gpt-4o',
    messages: [{ role: 'system', content: 'system' }, ...request.messages],
    max_tokens: 150,
    temperature: 0.8,
    presence_penalty: 0.6,
    frequency_penalty: 0.5,
  });
});

test('rejects an empty provider response', async () => {
  const generate = createGenerator(
    { provider: 'anthropic', apiKey: 'secret', port: 8787 },
    { anthropic: { messages: { create: async () => ({ content: [] }) } } }
  );

  await assert.rejects(() => generate(request), /empty response/);
});
