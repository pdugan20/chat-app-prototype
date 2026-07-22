# Local AI Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Anthropic and OpenAI credentials out of the Expo bundle while
preserving live AI responses in the iOS Simulator through a loopback-only Node
proxy.

**Architecture:** The mobile app imports one proxy-backed `AIService` that
sends its existing structured prompt and recent messages to
`http://127.0.0.1:8787`. A small Node HTTP service validates that request,
chooses Anthropic or OpenAI using server-only environment variables, and
returns raw generated text for the mobile parser.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript 5.9, Jest 29, Node.js
22 built-in HTTP/test APIs, Anthropic TypeScript SDK 0.57, OpenAI Node SDK 5,
dotenv 17.

## Global Constraints

- Bind the AI proxy to exactly `127.0.0.1`; do not accept a host override.
- Keep `AI_PROVIDER`, `ANTHROPIC_API_KEY`, and `OPENAI_API_KEY` readable only by
  the Node process.
- The Expo app may read only
  `EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787` for AI configuration.
- Preserve the existing structured prompt, response parser, song tracking,
  mock service, manager fallback, and chat animation flow.
- Limit request bodies to 64 KiB and mobile requests to 30 seconds.
- Never return provider errors, stack traces, request headers, or credentials
  in HTTP responses.
- Do not add hosting, authentication, accounts, quotas, billing, rate limiting,
  new models, new prompts, or physical-device networking.
- Write each behavior test first, run it to observe the expected failure, then
  add only the implementation needed to pass it.

---

## File Map

- Create `.env.example`: document public mobile URL and private server values.
- Create `server/ai-proxy/config.mjs`: parse and validate server configuration.
- Create `server/ai-proxy/providers.mjs`: adapt the neutral request to provider
  SDK calls.
- Create `server/ai-proxy/handler.mjs`: validate HTTP requests and sanitize
  responses.
- Create `server/ai-proxy/index.mjs`: load `.env` and listen on loopback.
- Create three adjacent `*.test.mjs` files under `server/ai-proxy/`: exercise
  server behavior with Node's test runner.
- Create `services/ai/providers/proxy.ts`: mobile transport plus existing
  structured-response parsing.
- Create `services/ai/providers/__tests__/proxy.test.ts`: exercise mobile proxy
  behavior with injected `fetch`.
- Create `services/ai/__tests__/manager.test.ts`: verify live-versus-mock
  selection with injected services.
- Create `scripts/ai-security-boundary.test.mjs`: prevent provider credentials
  and SDK imports from returning to mobile production source.
- Modify `services/ai/providers/base.ts`: name its configuration value
  generically instead of treating every provider as an API-key owner.
- Modify `services/ai/manager.ts`: import only proxy and mock providers.
- Modify `services/ai/constants.ts`: replace public provider/key settings with
  the proxy URL setting.
- Delete `services/ai/providers/anthropic.ts`,
  `services/ai/providers/openai.ts`, and `services/ai/models.ts`: remove direct
  provider implementations from the mobile tree.
- Modify `package.json`, `package-lock.json`, and `knip.json`: add proxy scripts,
  make dotenv a runtime dependency, and register the server entrypoint.
- Modify `README.md`, `CLAUDE.md`, `docs/AI_SETUP.md`, `docs/AI_FLOW.md`, and
  `docs/BUBBLE_TYPES.md`: document the two-process Simulator workflow.

### Task 1: Server Configuration and Provider Adapters

**Files:**

- Create: `server/ai-proxy/config.test.mjs`
- Create: `server/ai-proxy/config.mjs`
- Create: `server/ai-proxy/providers.test.mjs`
- Create: `server/ai-proxy/providers.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**

- Produces: `readConfig(env): { provider, apiKey, port }`
- Produces: `createGenerator(config, clients?): (request) => Promise<string>`
- Consumes later: `request` is
  `{ systemPrompt: string, messages: Array<{ role, content }> }`.

- [ ] **Step 1: Move dotenv to runtime dependencies and add the server test
      script**

Run:

```bash
npm install --save-prod dotenv@^17.2.1
npm pkg set scripts.test:ai-proxy="node --test server/ai-proxy/config.test.mjs server/ai-proxy/providers.test.mjs server/ai-proxy/handler.test.mjs"
```

Expected: `dotenv` appears only in `dependencies`, the lockfile updates, and
`test:ai-proxy` names each server-side Node test file explicitly.

- [ ] **Step 2: Write failing configuration tests**

Create `server/ai-proxy/config.test.mjs` with table-driven assertions that:

```js
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
    { AI_PROVIDER: 'openai', OPENAI_API_KEY: 'secret', AI_PROXY_PORT: '70000' },
    'AI_PROXY_PORT must be an integer from 1 to 65535',
  ],
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => readConfig(env), new RegExp(message));
  });
}
```

- [ ] **Step 3: Run the configuration tests and confirm RED**

Run:

```bash
node --test server/ai-proxy/config.test.mjs
```

Expected: FAIL because `server/ai-proxy/config.mjs` does not exist.

- [ ] **Step 4: Implement minimal configuration parsing**

Create `server/ai-proxy/config.mjs`. Normalize the provider, select only its
matching key, trim secrets, default the port to `8787`, and reject non-integer
or out-of-range ports. Do not read any host variable. The core implementation
must be equivalent to:

```js
const PROVIDERS = new Set(['anthropic', 'openai']);

export function readConfig(env = process.env) {
  const provider = env.AI_PROVIDER?.trim().toLowerCase();
  if (!PROVIDERS.has(provider)) {
    throw new Error('AI_PROVIDER must be anthropic or openai');
  }

  const keyName =
    provider === 'anthropic' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY';
  const apiKey = env[keyName]?.trim();
  if (!apiKey) throw new Error(`${keyName} is required`);

  const port =
    env.AI_PROXY_PORT === undefined ? 8787 : Number(env.AI_PROXY_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('AI_PROXY_PORT must be an integer from 1 to 65535');
  }

  return { provider, apiKey, port };
}
```

- [ ] **Step 5: Run the configuration tests and confirm GREEN**

Run: `node --test server/ai-proxy/config.test.mjs`

Expected: 7 tests pass and 0 fail.

- [ ] **Step 6: Write failing provider-adapter tests**

Create `server/ai-proxy/providers.test.mjs`. Inject fake clients and assert the
exact provider payloads without network calls:

```js
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
```

- [ ] **Step 7: Run the provider tests and confirm RED**

Run: `node --test server/ai-proxy/providers.test.mjs`

Expected: FAIL because `providers.mjs` does not exist.

- [ ] **Step 8: Implement the provider factory**

Create `server/ai-proxy/providers.mjs`. Import both SDKs only in this server
module. Construct a real client only when the corresponding injected client is
absent. Preserve the current model and tuning values shown in the tests. Return
trimmed generated text and throw `AI provider returned an empty response` for
missing or whitespace-only content.

The public shape is:

```js
export function createGenerator(config, clients = {}) {
  if (config.provider === 'anthropic') {
    const client =
      clients.anthropic ?? new Anthropic({ apiKey: config.apiKey });
    return async ({ systemPrompt, messages }) => {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 150,
        temperature: 0.8,
        system: systemPrompt,
        messages,
      });
      return requireContent(
        response.content.find(block => block.type === 'text')?.text
      );
    };
  }

  const client = clients.openai ?? new OpenAI({ apiKey: config.apiKey });
  return async ({ systemPrompt, messages }) => {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 150,
      temperature: 0.8,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
    });
    return requireContent(response.choices[0]?.message?.content);
  };
}
```

- [ ] **Step 9: Run both server unit files and commit**

Run:

```bash
node --test server/ai-proxy/config.test.mjs server/ai-proxy/providers.test.mjs
git add package.json package-lock.json server/ai-proxy
git commit -m "feat: add server-side AI provider adapters"
```

Expected: all configuration/provider tests pass; the commit contains no HTTP
listener or mobile changes.

### Task 2: Loopback HTTP Boundary

**Files:**

- Create: `server/ai-proxy/handler.test.mjs`
- Create: `server/ai-proxy/handler.mjs`
- Create: `server/ai-proxy/index.mjs`
- Create: `.env.example`
- Modify: `package.json`
- Modify: `knip.json`

**Interfaces:**

- Consumes: `generate({ systemPrompt, messages }): Promise<string>`
- Produces: `createHandler({ generate, provider, logger? })`
- Produces: `GET /health` and `POST /v1/generate`

- [ ] **Step 1: Write an in-process HTTP test harness and failing route tests**

In `server/ai-proxy/handler.test.mjs`, start `node:http.createServer` on an
ephemeral loopback port for each test and close it with `test.after`. Test real
HTTP behavior with `fetch`:

```js
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
  const { port } = server.address();
  return { baseUrl: `http://127.0.0.1:${port}`, calls };
};
```

Add separate tests for:

- `GET /health` returning
  `{ status: 'ok', provider: 'anthropic' }`;
- valid `POST /v1/generate` returning `{ content }` and forwarding the parsed
  request exactly once;
- unknown routes returning `404`;
- wrong methods on either known route returning `405`;
- non-JSON media types returning `400`;
- malformed JSON, empty prompt, empty messages, invalid role, and empty message
  content each returning `400` without calling `generate`;
- a body larger than 65,536 bytes returning `413` without calling `generate`;
- a thrown provider error returning exactly
  `{ error: 'AI provider request failed' }` with `502`, with no thrown message
  in the body; and
- the logger receiving only `AI provider request failed (anthropic)`.

- [ ] **Step 2: Run the handler tests and confirm RED**

Run: `node --test server/ai-proxy/handler.test.mjs`

Expected: FAIL because `handler.mjs` does not exist.

- [ ] **Step 3: Implement request validation and sanitized responses**

Create `server/ai-proxy/handler.mjs` with:

```js
const MAX_BODY_BYTES = 64 * 1024;

export function createHandler({ generate, provider, logger = console }) {
  return async function handler(request, response) {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    if (path !== '/health' && path !== '/v1/generate') {
      return sendJson(response, 404, { error: 'Not found' });
    }
    if (path === '/health') {
      if (request.method !== 'GET') {
        return sendJson(response, 405, { error: 'Method not allowed' });
      }
      return sendJson(response, 200, { status: 'ok', provider });
    }
    if (request.method !== 'POST') {
      return sendJson(response, 405, { error: 'Method not allowed' });
    }

    try {
      const body = await readAndValidateRequest(request, MAX_BODY_BYTES);
      const content = await generate(body);
      return sendJson(response, 200, { content });
    } catch (error) {
      if (error instanceof ClientError) {
        return sendJson(response, error.status, { error: error.message });
      }
      logger.error(`AI provider request failed (${provider})`);
      return sendJson(response, 502, { error: 'AI provider request failed' });
    }
  };
}
```

Implement private `ClientError`, `readBody`, `validateBody`, and `sendJson`
helpers. Count raw bytes before JSON parsing, keep consuming an oversized
stream instead of destroying the socket, set
`Content-Type: application/json; charset=utf-8`, and never serialize a caught
provider error.

- [ ] **Step 4: Run handler tests and confirm GREEN**

Run: `node --test server/ai-proxy/handler.test.mjs`

Expected: all route, validation, limit, and sanitization tests pass.

- [ ] **Step 5: Add the fixed-host entrypoint and environment example**

Create `server/ai-proxy/index.mjs`:

```js
import 'dotenv/config';
import { createServer } from 'node:http';
import { readConfig } from './config.mjs';
import { createHandler } from './handler.mjs';
import { createGenerator } from './providers.mjs';

const HOST = '127.0.0.1';
const config = readConfig();
const server = createServer(
  createHandler({
    generate: createGenerator(config),
    provider: config.provider,
  })
);

server.listen(config.port, HOST, () => {
  console.log(
    `AI proxy ready for ${config.provider} at http://${HOST}:${config.port}`
  );
});
```

Add `"ai-proxy": "node server/ai-proxy/index.mjs"` to `package.json` and add
`server/ai-proxy/index.mjs` to `knip.json`'s entry list.

Create `.env.example` with:

```dotenv
# Public, non-secret URL embedded in the Expo app
EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787

# Private values read only by the local Node process
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_PROXY_PORT=8787
```

- [ ] **Step 6: Smoke-test the fixed loopback listener and commit**

Run the proxy with a non-billable placeholder key:

```bash
AI_PROVIDER=anthropic ANTHROPIC_API_KEY=smoke-test npm run ai-proxy
```

In another shell run:

```bash
curl --fail --silent http://127.0.0.1:8787/health
```

Expected: `{"status":"ok","provider":"anthropic"}`. Stop the proxy, then
run:

```bash
npm run test:ai-proxy
git add .env.example package.json package-lock.json knip.json server/ai-proxy
git commit -m "feat: add loopback-only AI proxy"
```

Expected: all currently present Node tests pass and the committed listener has
no configurable host.

### Task 3: Mobile Proxy Provider and Manager Selection

**Files:**

- Create: `services/ai/providers/__tests__/proxy.test.ts`
- Create: `services/ai/providers/proxy.ts`
- Create: `services/ai/__tests__/manager.test.ts`
- Modify: `services/ai/providers/base.ts`
- Modify: `services/ai/providers/mock.ts`
- Modify: `services/ai/manager.ts`
- Modify: `services/ai/constants.ts`
- Delete: `services/ai/providers/anthropic.ts`
- Delete: `services/ai/providers/openai.ts`
- Delete: `services/ai/models.ts`

**Interfaces:**

- Produces: `new ProxyService(proxyUrl?, fetchImpl?, timeoutMs?)`
- Produces: `new AIServiceManager(liveService?, fallbackService?)`
- Preserves: the existing `AIService` methods and structured response types.

- [ ] **Step 1: Write failing mobile proxy tests**

Create `services/ai/providers/__tests__/proxy.test.ts`. Inject a typed fetch
mock and use a 10 ms timeout in the timeout test. Cover:

```ts
const response = (body: unknown, ok = true, status = 200) =>
  ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response);

it('is configured only with a non-empty proxy URL', () => {
  const fetchMock = jest.fn() as unknown as typeof fetch;
  expect(new ProxyService(undefined, fetchMock).isConfigured()).toBe(false);
  expect(new ProxyService('  ', fetchMock).isConfigured()).toBe(false);
  expect(
    new ProxyService('http://127.0.0.1:8787/', fetchMock).isConfigured()
  ).toBe(true);
});

it('posts the structured prompt and parses a text response', async () => {
  const fetchMock = jest
    .fn()
    .mockResolvedValue(
      response({ content: 'TEXT_RESPONSE\nHey there' })
    ) as unknown as typeof fetch;
  const service = new ProxyService('http://127.0.0.1:8787/', fetchMock);
  const result = await service.generateStructuredResponse(
    [{ role: 'user', content: 'hello' }],
    'Ruth'
  );
  expect(fetchMock).toHaveBeenCalledWith(
    'http://127.0.0.1:8787/v1/generate',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.stringContaining('"systemPrompt":"You are Ruth'),
      signal: expect.any(Object),
    })
  );
  expect(result).toEqual({ type: 'text', content: 'Hey there' });
});
```

Add independent tests that parse a `MUSIC_RESPONSE` and track its query, throw
on non-2xx responses, throw on non-JSON responses, throw when success content
is absent/blank, and abort a fetch that listens for `signal.abort` after the
injected 10 ms timeout.

- [ ] **Step 2: Run the proxy-provider tests and confirm RED**

Run:

```bash
npm test -- services/ai/providers/__tests__/proxy.test.ts --runInBand
```

Expected: FAIL because `proxy.ts` does not exist.

- [ ] **Step 3: Generalize the base provider configuration name**

In `services/ai/providers/base.ts`, rename protected `apiKey` to
`configurationValue`, trim it in the constructor, and make `isConfigured()`
check that value. Remove the unused key-specific `getDefaultFallback()` helper
and its `API_CONFIG` import. Update `mock.ts` only as necessary for the generic
constructor wording; preserve all mock behavior.

- [ ] **Step 4: Implement the proxy provider**

Create `services/ai/providers/proxy.ts` with an exported class for tests and a
default singleton for production:

```ts
export class ProxyService extends BaseAIProvider {
  private readonly proxyUrl?: string;

  constructor(
    proxyUrl = process.env[ENV_KEYS.proxyUrl],
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly timeoutMs = 30_000
  ) {
    super(proxyUrl, 'AI Proxy', ERROR_MESSAGES.proxyNotConfigured);
    this.proxyUrl = this.configurationValue?.replace(/\/+$/, '');
  }

  async generateStructuredResponse(
    messages: AIMessage[],
    contactName = 'Friend'
  ): Promise<AIStructuredResponse> {
    this.validateConfiguration();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(`${this.proxyUrl}/v1/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: createStructuredPrompt(
            contactName,
            this.getMentionedSongs()
          ),
          messages,
        }),
        signal: controller.signal,
      });
      const body = await readProxyBody(response);
      if (!response.ok) {
        throw new Error(`AI proxy returned ${response.status}: ${body.error}`);
      }
      if (typeof body.content !== 'string' || !body.content.trim()) {
        throw new Error('AI proxy returned an invalid response');
      }
      return this.parseStructuredResponse(body.content);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export default new ProxyService();
```

Define a local discriminated response-body type and `readProxyBody()` that
converts JSON parsing failure into `AI proxy returned invalid JSON`. Do not log
or fall back inside this provider.

- [ ] **Step 5: Run proxy-provider tests and confirm GREEN**

Run:

```bash
npm test -- services/ai/providers/__tests__/proxy.test.ts --runInBand
```

Expected: all proxy transport, parsing, error, and timeout tests pass.

- [ ] **Step 6: Write failing manager-selection tests**

Export `AIServiceManager` from `manager.ts` and create
`services/ai/__tests__/manager.test.ts` using simple `AIService` fakes. Assert:

- a configured live service is selected and reports provider name `proxy`;
- an unconfigured live service selects the configured mock service and reports
  `mock`;
- a live-service rejection returns one of `MOCK_RESPONSES.fallback`; and
- song tracking methods delegate to the selected service.

The wished-for constructor is:

```ts
new AIServiceManager(liveService, fallbackService);
```

- [ ] **Step 7: Run manager tests and confirm RED**

Run: `npm test -- services/ai/__tests__/manager.test.ts --runInBand`

Expected: FAIL because the manager class is not exported and does not accept
service injection.

- [ ] **Step 8: Replace direct provider selection with proxy selection**

Change `services/ai/constants.ts` to retain only the relevant values:

```ts
export const ENV_KEYS = {
  proxyUrl: 'EXPO_PUBLIC_AI_PROXY_URL',
} as const;

export const PROVIDER_NAMES = {
  PROXY: 'proxy',
  MOCK: 'mock',
} as const;
```

Add `proxyNotConfigured: 'AI proxy URL not configured'` to `ERROR_MESSAGES` and
remove Anthropic/OpenAI configuration messages and unused provider tuning from
mobile constants.

In `manager.ts`, import only `proxyService` and `mockService`. Export the class,
inject those defaults in the constructor, and choose the live service only when
`isConfigured()` is true. Store the selected provider name so
`getCurrentProvider()` returns `proxy` or `mock` without reading an environment
variable. Preserve the current generation try/catch and tracking delegation.

Delete the two direct provider files and `models.ts` only after the tests are
green so there is no mobile import path to either SDK.

- [ ] **Step 9: Run focused and existing AI tests, then commit**

Run:

```bash
npm test -- services/ai --runInBand
npx tsc --noEmit --skipLibCheck
git add services/ai
git commit -m "fix: route mobile AI through local proxy"
```

Expected: all AI tests pass, TypeScript exits 0, and no production file under
`services/` imports `openai` or `@anthropic-ai/sdk`.

### Task 4: Regression Guard and Documentation

**Files:**

- Create: `scripts/ai-security-boundary.test.mjs`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `docs/AI_SETUP.md`
- Modify: `docs/AI_FLOW.md`
- Modify: `docs/BUBBLE_TYPES.md`
- Modify: `package.json`

**Interfaces:**

- Produces: a static regression test included in `npm run test:ai-proxy`.
- Produces: a copy-pasteable two-terminal Simulator setup.

- [ ] **Step 1: Write the failing security-boundary test**

Create `scripts/ai-security-boundary.test.mjs`. Recursively collect production
`.ts` and `.tsx` files under `services`, `hooks`, `screens`, `components`,
`stores`, `utils`, `contexts`, `constants`, `config`, and `types`, plus
`App.tsx` and `index.ts`; exclude every `__tests__` directory.

Assert each file omits these exact forbidden strings, building the strings from
fragments so the test file does not flag itself:

```js
const forbidden = [
  ['EXPO', 'PUBLIC', 'ANTHROPIC', 'API', 'KEY'].join('_'),
  ['EXPO', 'PUBLIC', 'OPENAI', 'API', 'KEY'].join('_'),
  "from '@anthropic-ai/sdk'",
  "from 'openai'",
];
```

Also assert `services/ai/manager.ts` contains
`from './providers/proxy'` and that the deleted direct provider paths do not
exist.

Extend the scripts so CI includes the static boundary test:

```bash
npm pkg set scripts.test:ai-proxy="node --test server/ai-proxy/config.test.mjs server/ai-proxy/providers.test.mjs server/ai-proxy/handler.test.mjs scripts/ai-security-boundary.test.mjs"
npm pkg set scripts.test:ci="npm run test:ai-proxy && jest --ci --coverage --maxWorkers=2"
```

- [ ] **Step 2: Demonstrate that the guard catches the original exposure**

Temporarily restore one forbidden public key spelling in a production fixture
or add it to `services/ai/constants.ts`, run:

```bash
node --test scripts/ai-security-boundary.test.mjs
```

Expected: FAIL naming the exact file and forbidden token. Remove the temporary
line and rerun; expected PASS. Do not commit the temporary line.

- [ ] **Step 3: Rewrite the AI setup guide around two local processes**

Replace `docs/AI_SETUP.md` with sections that state:

1. copy `.env.example` to `.env`;
2. set `AI_PROVIDER` and only its matching private key;
3. keep `EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787`;
4. run `npm run ai-proxy` in terminal one;
5. run `npm run ios` in terminal two;
6. check `curl http://127.0.0.1:8787/health` when troubleshooting; and
7. use a separately authenticated HTTPS deployment for physical devices rather
   than changing the loopback bind in this prototype.

Include an explicit warning that Expo public variables are bundled and must
never hold provider credentials.

- [ ] **Step 4: Align architecture and contributor documentation**

Update:

- `README.md` Getting Started and Development commands to include
  `npm run ai-proxy` and describe `.env` as local proxy configuration;
- `CLAUDE.md` AI Integration to say the mobile service calls a loopback proxy
  and provider SDKs execute under `server/ai-proxy/`;
- `docs/AI_FLOW.md` diagram, service table, configuration, provider selection,
  error flow, and parser ownership so the proxy returns raw text and the app
  parses/falls back; and
- `docs/BUBBLE_TYPES.md` provider test commands so changing `AI_PROVIDER` means
  restarting `npm run ai-proxy`, not injecting provider selection into Expo.

Run this documentation search and resolve every active-code/setup match outside
the historical design and plan documents:

```bash
rg -n "EXPO_PUBLIC_(ANTHROPIC|OPENAI)_API_KEY|EXPO_PUBLIC_AI_PROVIDER|providers/(anthropic|openai)" \
  --glob '!docs/superpowers/**'
```

Expected: no output.

- [ ] **Step 5: Format, lint, test, and commit the boundary**

Run:

```bash
npx prettier --write scripts/ai-security-boundary.test.mjs README.md CLAUDE.md docs/AI_SETUP.md docs/AI_FLOW.md docs/BUBBLE_TYPES.md package.json
npm run test:ai-proxy
npm run markdownlint
npm run format:check
git add scripts/ai-security-boundary.test.mjs README.md CLAUDE.md docs/AI_SETUP.md docs/AI_FLOW.md docs/BUBBLE_TYPES.md package.json
git commit -m "docs: explain secure local AI setup"
```

Expected: the security test and documentation checks pass with no direct mobile
credential instructions remaining.

### Task 5: Full Verification and Live Simulator Smoke Test

**Files:**

- Modify only files required by a verified failure in this task.

**Interfaces:**

- Verifies the complete issue #29 acceptance criteria.

- [ ] **Step 1: Install from the lockfile and run all automated checks**

Run from a clean dependency state:

```bash
npm ci
npm run test:automation-policy
npm run lint:claude
npm run format:check
npm run lint
npx tsc --noEmit --skipLibCheck
npm run markdownlint
npm run knip
npm run test:ci
npx expo install --check
```

Expected: every command exits 0; Jest and Node tests report 0 failures.

- [ ] **Step 2: Verify generated native configuration and the iOS bundle**

Run:

```bash
npx expo prebuild --platform ios --no-install --clean
npx expo export --platform ios
rg -n "ANTHROPIC_API_KEY|OPENAI_API_KEY|sk-ant-|from '@anthropic-ai/sdk'|from 'openai'" dist
```

Expected: prebuild/export exit 0 and the final search returns no matches. The
generated `ios/` and `dist/` directories remain ignored and outside the commit.

- [ ] **Step 3: Verify the loopback service without spending API credits**

Start:

```bash
AI_PROVIDER=anthropic ANTHROPIC_API_KEY=smoke-test npm run ai-proxy
```

Then run:

```bash
curl --fail --silent http://127.0.0.1:8787/health
curl --silent --output /tmp/ai-proxy-response.json --write-out '%{http_code}' \
  -H 'Content-Type: application/json' \
  -d '{"systemPrompt":"system","messages":[{"role":"user","content":"hello"}]}' \
  http://127.0.0.1:8787/v1/generate
```

Expected: health returns the ready JSON and the placeholder-key generation
request returns `502` with the sanitized body
`{"error":"AI provider request failed"}`. Stop the service.

- [ ] **Step 4: Run one optional real-key Simulator check when a key is already
      available**

Without printing `.env`, start `npm run ai-proxy` and `npm run ios`, send one
chat message, and confirm a live text response. If no real key is configured,
record this manual check as unavailable; automated fake-client coverage and the
sanitized HTTP smoke test remain required and sufficient for the pull request.

- [ ] **Step 5: Review scope and create the implementation commit if needed**

Run:

```bash
git status --short
git diff --check
git log --oneline --decorate origin/main..HEAD
```

Expected: only issue #29 design, proxy, mobile AI, tests, configuration, and
documentation files differ. Commit any verification-driven correction with a
conventional commit message after rerunning its failing command and the full
relevant suite.

- [ ] **Step 6: Publish and resolve the issue**

Push `fix/issue-29-local-ai-proxy`, open a draft pull request referencing
`Closes #29`, wait for all GitHub checks, address any verified CI failure, mark
the pull request ready, and merge only when every required check is green.
After merge, confirm issue #29 is closed and add a concise resolution comment
explaining that provider keys now remain in the loopback Node process while the
Simulator receives only a non-secret proxy URL.
