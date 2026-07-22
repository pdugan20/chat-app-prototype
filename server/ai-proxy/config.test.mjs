import assert from 'node:assert/strict';
import test from 'node:test';

import { readConfig } from './config.mjs';

test('reads an Anthropic configuration', () => {
  assert.deepEqual(
    readConfig({ AI_PROVIDER: 'anthropic', ANTHROPIC_API_KEY: ' secret ' }),
    { provider: 'anthropic', apiKey: 'secret', port: 8787 }
  );
});

test('reads an OpenAI configuration with a custom port', () => {
  assert.deepEqual(
    readConfig({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'secret',
      AI_PROXY_PORT: '9000',
    }),
    { provider: 'openai', apiKey: 'secret', port: 9000 }
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
    'missing Anthropic key',
    { AI_PROVIDER: 'anthropic' },
    'ANTHROPIC_API_KEY is required',
  ],
  [
    'missing OpenAI key',
    { AI_PROVIDER: 'openai' },
    'OPENAI_API_KEY is required',
  ],
  [
    'invalid port',
    {
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'secret',
      AI_PROXY_PORT: '70000',
    },
    'AI_PROXY_PORT must be an integer from 1 to 65535',
  ],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => readConfig(env), new RegExp(message));
  });
}
