# Local AI Proxy Design

## Purpose

Resolve GitHub issue #29 without removing live AI from the prototype. Provider
credentials must remain outside the Expo bundle while the iOS Simulator can
still generate Claude or OpenAI responses during local development.

This design is intentionally local-development-only. It does not create a
public API, user authentication system, or production deployment path.

## Current Problem

The mobile app currently reads `EXPO_PUBLIC_ANTHROPIC_API_KEY` and
`EXPO_PUBLIC_OPENAI_API_KEY` and imports both provider SDKs through
`services/ai/manager.ts`. Expo replaces `EXPO_PUBLIC_` variables in the client
bundle, so those values are not secrets. Importing the provider implementations
also puts provider-specific request code in the mobile dependency graph.

## Chosen Approach

Run a small Node.js HTTP service on the developer's Mac and bind it only to
`127.0.0.1`. The iOS Simulator calls that loopback service. The Node process
loads one non-public provider key from `.env`, calls the selected provider, and
returns only generated text.

The Expo app receives one public, non-secret setting:
`EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787`. Provider selection and
provider credentials are server-side settings named `AI_PROVIDER`,
`ANTHROPIC_API_KEY`, and `OPENAI_API_KEY`.

### Alternatives Considered

1. Expo Router API routes provide a secure server boundary, but this app does
   not use Expo Router. Adopting its routing and server-output architecture is
   unnecessary for a Simulator-only prototype.
2. A hosted proxy would support physical devices and distributed testers, but
   it would require authentication, rate limiting, abuse prevention, and
   deployment operations. An unauthenticated hosted endpoint would be an open
   AI relay.
3. Asking users to enter their own key in the app still places the credential
   in a client runtime and conflicts with provider guidance. It does not resolve
   the exposure class reported in issue #29.

## Components

### Mobile proxy provider

Create `services/ai/providers/proxy.ts` as the only live provider imported by
`services/ai/manager.ts`. It implements the existing `AIService` interface and
extends the current base provider so response parsing, music-query tracking,
and fallback-compatible behavior remain in one place.

The provider:

- reads only `EXPO_PUBLIC_AI_PROXY_URL`;
- builds the existing structured system prompt with the contact name and
  previously mentioned songs;
- sends the system prompt and recent conversation messages to the proxy;
- aborts requests that exceed 30 seconds;
- validates the proxy response shape;
- passes returned text through the existing structured-response parser; and
- throws descriptive transport or protocol errors for the manager to convert
  to its existing fallback response.

The manager selects the proxy when its URL is configured and otherwise retains
the always-available mock service. It no longer reads a provider name or imports
Anthropic/OpenAI modules in the mobile dependency graph.

### Local HTTP service

Create focused ECMAScript modules under `server/ai-proxy/`:

- `config.mjs` loads and validates `AI_PROVIDER`, the corresponding API key,
  and port;
- `providers.mjs` translates a provider-neutral generation request into either
  an Anthropic Messages API call or an OpenAI Chat Completions call;
- `handler.mjs` implements HTTP routing, JSON validation, response formatting,
  body-size enforcement, and sanitized errors; and
- `index.mjs` loads `.env`, creates the server, and listens on loopback.

The implementation reuses the provider SDKs already installed in the project.
They remain package dependencies because the Node service needs them, but no
mobile-imported module references them.

Add `npm run ai-proxy` to start the service. The service defaults to
`127.0.0.1:8787`; a host override is deliberately not supported so a typo or
configuration change cannot expose the unauthenticated service to the LAN.

## Data Flow

1. `useAIResponse` supplies the last ten conversation messages and contact name
   to the existing AI manager.
2. The proxy provider builds the same structured prompt used today.
3. The app sends `POST /v1/generate` with this JSON body:

   ```json
   {
     "systemPrompt": "You are Ruth, having a casual text conversation...",
     "messages": [
       {
         "role": "user",
         "content": "Recommend a song"
       }
     ]
   }
   ```

4. The local service calls the configured provider with the existing model,
   token, temperature, and OpenAI penalty settings.
5. The service returns `200` with `{ "content": "..." }`.
6. The app parses that text into the existing text or music response shape.

The contract deliberately returns raw generated text instead of mobile bubble
objects. This keeps UI response semantics and song-tracking state in the app
and keeps the credential boundary independent of presentation logic.

## HTTP Contract and Validation

The service supports:

- `GET /health`, returning `200` with
  `{ "status": "ok", "provider": "anthropic" }` or the equivalent OpenAI
  provider name, and never a credential; and
- `POST /v1/generate`, returning generated content.

All other routes return `404`. Unsupported methods on known routes return
`405`. Generate requests must use `application/json`, contain a non-empty
`systemPrompt`, and contain a non-empty array of messages whose roles are
`user` or `assistant` and whose content is non-empty text.

The request body limit is 64 KiB. Invalid JSON or invalid fields return `400`,
an oversized body returns `413`, and a provider failure returns `502`. Error
responses use `{ "error": "safe message" }`; provider response bodies, stack
traces, request headers, and keys are not returned to the client.

## Configuration

Add a committed `.env.example` containing placeholders and comments:

```dotenv
EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_PROXY_PORT=8787
```

`.env` remains ignored. The AI integration in the app may read only the public
proxy URL. The Node entrypoint loads `.env` with the existing `dotenv` package
and chooses exactly one provider. Startup fails with a clear message when the
provider is invalid or its matching credential is absent.

`AI_PROXY_PORT` may change the port for local conflicts. The host is always
`127.0.0.1`.

## Error and Fallback Behavior

If the URL is absent, the manager uses the current mock provider. If the proxy
is offline, times out, returns non-JSON, returns a non-2xx status, or returns an
invalid success body, the proxy provider throws. The manager logs the existing
high-level AI error and returns its current preset fallback response, so chat
interaction does not fail.

Client-facing errors include status and a safe reason but never echo provider
credentials. Server logs identify the request failure and provider without
logging request authorization data or `.env` values.

## Security Properties

- No `EXPO_PUBLIC_ANTHROPIC_API_KEY`, `EXPO_PUBLIC_OPENAI_API_KEY`, or direct
  provider selection remains in mobile code or setup documentation.
- The mobile dependency graph has no imports from either provider SDK.
- The service binds only to IPv4 loopback and has no hosted-production claim.
- Secrets remain in ignored `.env` data read by the Node process.
- Request size and shape are bounded before a provider call.
- Server errors are sanitized at the HTTP boundary.

The existing broad iOS App Transport Security allowance is outside this issue's
scope. It already permits the prototype's loopback HTTP request, so this change
does not broaden native networking permissions.

## Testing Strategy

Use test-driven development for each behavioral boundary:

1. Node's built-in test runner exercises configuration validation, request
   validation, route/method handling, size limits, successful generation, and
   sanitized provider failures with injected provider functions.
2. Jest exercises the mobile proxy provider with mocked `fetch`, including
   prompt forwarding, parsed text/music responses, invalid bodies, and HTTP
   failures.
3. Jest exercises manager selection so a configured URL chooses the proxy and
   a missing URL chooses the mock service.
4. Static checks verify mobile-imported source does not reference provider SDKs
   or secret environment-variable names.
5. Existing lint, formatting, TypeScript, Jest, Knip, Expo dependency, native
   prebuild, and iOS export checks remain green.
6. A local smoke test starts the proxy and verifies `/health`. When a developer
   key is available, a Simulator request verifies one live AI response without
   printing or inspecting the key.

## Documentation Changes

Update `docs/AI_SETUP.md`, `docs/AI_FLOW.md`, `docs/BUBBLE_TYPES.md`, `README.md`,
and `CLAUDE.md` wherever they describe direct mobile provider configuration.
The setup guide must present two terminals: one running `npm run ai-proxy` and
one running the Expo app. It must state that loopback supports the iOS Simulator
and that physical devices require a separately secured deployment, which this
prototype does not provide.

## Acceptance Criteria

- A repository search finds no client-facing provider-key variable names.
- The Expo bundle can be configured only with the non-secret proxy URL.
- With a valid server-side key, the iOS Simulator can receive a live text or
  music-formatted AI response through loopback.
- With no key or no running proxy, existing mock/fallback behavior keeps chat
  usable.
- The proxy cannot listen beyond `127.0.0.1` through configuration.
- Automated tests cover both provider adapters without making paid API calls.
- Setup and architecture documentation match the implemented boundary.

## Out of Scope

- Hosting the proxy for external users or physical devices
- Authentication, accounts, quotas, billing, or rate limiting
- Changing AI models or prompt behavior
- Refactoring Apple Music credentials or the existing ATS configuration
- Replacing the current chat UI, response parser, or animation flow
