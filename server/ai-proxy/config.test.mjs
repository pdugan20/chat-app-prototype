import assert from 'node:assert/strict';
import test from 'node:test';

import { readConfig } from './config.mjs';

test('reads an Anthropic configuration', () => {
  assert.deepEqual(
    readConfig({
      AI_PROVIDER: 'anthropic',
      AI_ANTHROPIC_MODEL: 'claude-test',
      ANTHROPIC_API_KEY: ' secret ',
    }),
    {
      provider: 'anthropic',
      model: 'claude-test',
      apiKey: 'secret',
      port: 8787,
      timeoutMs: 20000,
    }
  );
});

test('reads an OpenAI configuration with a custom port', () => {
  assert.deepEqual(
    readConfig({
      AI_PROVIDER: 'openai',
      AI_OPENAI_MODEL: 'gpt-test',
      OPENAI_API_KEY: 'secret',
      AI_PROXY_PORT: '9000',
      AI_PROXY_TIMEOUT_MS: '30000',
    }),
    {
      provider: 'openai',
      model: 'gpt-test',
      apiKey: 'secret',
      port: 9000,
      timeoutMs: 30000,
    }
  );
});

for (const [name, env, message] of [
  ['missing provider', {}, 'AI_PROVIDER must be anthropic or openai'],
  [
    'invalid provider',
    { AI_PROVIDER: 'other' },
    'AI_PROVIDER must be anthropic or openai',
  ],
  [
    'missing Anthropic model',
    { AI_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: 'secret' },
    'AI_ANTHROPIC_MODEL is required',
  ],
  [
    'missing Anthropic key',
    { AI_PROVIDER: 'anthropic', AI_ANTHROPIC_MODEL: 'claude-test' },
    'ANTHROPIC_API_KEY is required',
  ],
  [
    'missing OpenAI model',
    { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'secret' },
    'AI_OPENAI_MODEL is required',
  ],
  [
    'missing OpenAI key',
    { AI_PROVIDER: 'openai', AI_OPENAI_MODEL: 'gpt-test' },
    'OPENAI_API_KEY is required',
  ],
  [
    'invalid port',
    {
      AI_PROVIDER: 'openai',
      AI_OPENAI_MODEL: 'gpt-test',
      OPENAI_API_KEY: 'secret',
      AI_PROXY_PORT: '70000',
    },
    'AI_PROXY_PORT must be an integer from 1 to 65535',
  ],
  [
    'invalid timeout',
    {
      AI_PROVIDER: 'openai',
      AI_OPENAI_MODEL: 'gpt-test',
      OPENAI_API_KEY: 'secret',
      AI_PROXY_TIMEOUT_MS: '999',
    },
    'AI_PROXY_TIMEOUT_MS must be an integer from 1000 to 60000',
  ],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => readConfig(env), new RegExp(message));
  });
}
