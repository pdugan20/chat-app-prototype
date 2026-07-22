import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';

import { createHandler } from './handler.mjs';

const validBody = {
  systemPrompt: 'system',
  messages: [{ role: 'user', content: 'hello' }],
};

const fixture = async (t, options = {}) => {
  const calls = [];
  const handler = createHandler({
    provider: 'anthropic',
    generate:
      options.generate ??
      (async request => {
        calls.push(request);
        return 'TEXT_RESPONSE\nHello';
      }),
    logger: options.logger ?? { error() {} },
  });
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  assert(address && typeof address === 'object');
  return { baseUrl: `http://127.0.0.1:${address.port}`, calls };
};

const post = (
  baseUrl,
  body,
  headers = { 'Content-Type': 'application/json' }
) =>
  fetch(`${baseUrl}/v1/generate`, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

test('reports loopback proxy health without credentials', async t => {
  const { baseUrl } = await fixture(t);

  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: 'ok',
    provider: 'anthropic',
  });
});

test('generates content for a valid request', async t => {
  const { baseUrl, calls } = await fixture(t);

  const response = await post(baseUrl, validBody);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { content: 'TEXT_RESPONSE\nHello' });
  assert.deepEqual(calls, [validBody]);
});

test('returns 404 for an unknown route', async t => {
  const { baseUrl } = await fixture(t);

  const response = await fetch(`${baseUrl}/missing`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});

for (const [method, path] of [
  ['POST', '/health'],
  ['GET', '/v1/generate'],
]) {
  test(`returns 405 for ${method} ${path}`, async t => {
    const { baseUrl } = await fixture(t);

    const response = await fetch(`${baseUrl}${path}`, { method });

    assert.equal(response.status, 405);
    assert.deepEqual(await response.json(), { error: 'Method not allowed' });
  });
}

test('rejects a non-JSON media type before generation', async t => {
  const { baseUrl, calls } = await fixture(t);

  const response = await post(baseUrl, JSON.stringify(validBody), {
    'Content-Type': 'text/plain',
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Content-Type must be application/json',
  });
  assert.equal(calls.length, 0);
});

test('rejects malformed JSON before generation', async t => {
  const { baseUrl, calls } = await fixture(t);

  const response = await post(baseUrl, '{');

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Request body is invalid JSON',
  });
  assert.equal(calls.length, 0);
});

for (const [name, body, message] of [
  [
    'empty prompt',
    { ...validBody, systemPrompt: '  ' },
    'systemPrompt must be non-empty text',
  ],
  [
    'empty messages',
    { ...validBody, messages: [] },
    'messages must be non-empty',
  ],
  [
    'invalid role',
    { ...validBody, messages: [{ role: 'system', content: 'hello' }] },
    'message roles must be user or assistant',
  ],
  [
    'empty message content',
    { ...validBody, messages: [{ role: 'user', content: ' ' }] },
    'message content must be non-empty text',
  ],
]) {
  test(`rejects ${name} before generation`, async t => {
    const { baseUrl, calls } = await fixture(t);

    const response = await post(baseUrl, body);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: message });
    assert.equal(calls.length, 0);
  });
}

test('rejects a body larger than 64 KiB before generation', async t => {
  const { baseUrl, calls } = await fixture(t);

  const response = await post(baseUrl, {
    ...validBody,
    systemPrompt: 'x'.repeat(65537),
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: 'Request body is too large',
  });
  assert.equal(calls.length, 0);
});

test('sanitizes provider failures', async t => {
  const logged = [];
  const { baseUrl } = await fixture(t, {
    generate: async () => {
      throw new Error('provider body containing secret-key');
    },
    logger: { error: message => logged.push(message) },
  });

  const response = await post(baseUrl, validBody);
  const body = await response.json();

  assert.equal(response.status, 502);
  assert.deepEqual(body, { error: 'AI provider request failed' });
  assert.equal(JSON.stringify(body).includes('secret-key'), false);
  assert.deepEqual(logged, ['AI provider request failed (anthropic)']);
});
