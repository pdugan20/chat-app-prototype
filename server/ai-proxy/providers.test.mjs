import assert from 'node:assert/strict';
import test from 'node:test';
import Anthropic from '@anthropic-ai/sdk';

import { createGenerator } from './providers.mjs';

const request = {
  systemPrompt: 'system',
  messages: [{ role: 'user', content: 'hello' }],
};

test('generates Anthropic text', async () => {
  let payload;
  let requestOptions;
  const clients = {
    anthropic: {
      messages: {
        create: async (value, options) => {
          payload = value;
          requestOptions = options;
          return { content: [{ type: 'text', text: 'Claude reply' }] };
        },
      },
    },
  };
  const config = {
    provider: 'anthropic',
    model: 'claude-test',
    apiKey: 'secret',
    port: 8787,
    timeoutMs: 20000,
  };
  const generate = createGenerator(config, clients);

  assert.equal(await generate(request), 'Claude reply');
  assert.equal(requestOptions.timeout, 20000);
  assert.equal(requestOptions.maxRetries, 0);
  assert.ok(requestOptions.signal instanceof AbortSignal);
  assert.deepEqual(payload, {
    model: 'claude-test',
    max_tokens: 220,
    system: 'system',
    messages: request.messages,
  });
});

test('generates OpenAI text', async () => {
  let payload;
  let requestOptions;
  const clients = {
    openai: {
      responses: {
        create: async (value, options) => {
          payload = value;
          requestOptions = options;
          return { output_text: 'OpenAI reply' };
        },
      },
    },
  };
  const generate = createGenerator(
    {
      provider: 'openai',
      model: 'gpt-test',
      apiKey: 'secret',
      port: 8787,
      timeoutMs: 20000,
    },
    clients
  );

  assert.equal(await generate(request), 'OpenAI reply');
  assert.equal(requestOptions.timeout, 20000);
  assert.equal(requestOptions.maxRetries, 0);
  assert.ok(requestOptions.signal instanceof AbortSignal);
  assert.deepEqual(payload, {
    model: 'gpt-test',
    instructions: 'system',
    input: request.messages,
    store: false,
    max_output_tokens: 220,
    reasoning: { effort: 'none' },
  });
});

test('rejects an empty provider response', async () => {
  const generate = createGenerator(
    {
      provider: 'anthropic',
      model: 'claude-test',
      apiKey: 'secret',
      port: 8787,
      timeoutMs: 20000,
    },
    { anthropic: { messages: { create: async () => ({ content: [] }) } } }
  );

  await assert.rejects(() => generate(request), /empty response/);
});

test('aborts an Anthropic body that stalls after response headers arrive', async () => {
  let fetchSignal;
  const client = new Anthropic({
    apiKey: 'synthetic-test-key',
    fetch: async (_url, init) => {
      fetchSignal = init.signal;
      return new Response(
        new ReadableStream({
          start(controller) {
            const timer = setTimeout(() => {
              controller.enqueue(
                new TextEncoder().encode(
                  JSON.stringify({
                    content: [{ type: 'text', text: 'late reply' }],
                  })
                )
              );
              controller.close();
            }, 200);
            fetchSignal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer);
                controller.error(new DOMException('Aborted', 'AbortError'));
              },
              { once: true }
            );
          },
        }),
        { headers: { 'content-type': 'application/json' } }
      );
    },
  });
  const generate = createGenerator(
    {
      provider: 'anthropic',
      model: 'claude-test',
      apiKey: 'synthetic-test-key',
      timeoutMs: 20,
    },
    { anthropic: client }
  );

  await assert.rejects(() => generate(request), /abort/i);
  assert.equal(fetchSignal.aborted, true);
});
