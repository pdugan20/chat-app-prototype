# AI Integration Setup

The app can generate contextual replies with Anthropic Claude or OpenAI while
running in the iOS Simulator. A loopback-only Node proxy keeps provider
credentials out of the Expo bundle.

> Never place an Anthropic or OpenAI key in an `EXPO_PUBLIC_` variable. Expo
> embeds public variables in the client application, where they are not secret.

## Requirements

- Node.js 22 and npm 11
- The iOS Simulator on the same Mac as the development server
- An Anthropic or OpenAI API key

## Configure the Environment

Copy the example file:

```bash
cp .env.example .env
```

For Anthropic, set:

```dotenv
EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENAI_API_KEY=
AI_PROXY_PORT=8787
```

For OpenAI, set:

```dotenv
EXPO_PUBLIC_AI_PROXY_URL=http://127.0.0.1:8787
AI_PROVIDER=openai
ANTHROPIC_API_KEY=
OPENAI_API_KEY=sk-your-key-here
AI_PROXY_PORT=8787
```

Only `EXPO_PUBLIC_AI_PROXY_URL` is read by the mobile app. Provider selection
and credentials are read by the local Node process.

## Run the Prototype

Start the proxy in the first terminal:

```bash
npm run ai-proxy
```

The ready message should name the provider and
`http://127.0.0.1:8787`. Keep this process running.

Start the iOS app in a second terminal:

```bash
npm run ios
```

Send a message in any chat. The app sends the last ten messages and its
structured response prompt to the local proxy. The proxy returns generated
text, which the app parses into a normal text or Apple Music response.

## Troubleshooting

Check that the proxy is reachable:

```bash
curl http://127.0.0.1:8787/health
```

A configured Anthropic proxy returns:

```json
{ "status": "ok", "provider": "anthropic" }
```

If startup reports a missing key, set the credential matching `AI_PROVIDER`.
If the port is already in use, set `AI_PROXY_PORT` and update
`EXPO_PUBLIC_AI_PROXY_URL` to the same port, then restart both processes.

When the proxy is missing or unavailable, the existing mock/fallback behavior
keeps chat usable.

## Simulator-Only Boundary

The proxy always binds to `127.0.0.1`, which the iOS Simulator can reach on the
host Mac. It is not a production server and cannot be opened to the LAN through
configuration.

A physical device or distributed tester requires a separately deployed HTTPS
service with authentication, rate limiting, and abuse protection. Do not change
this prototype's bind address to expose an unauthenticated AI relay.

For the response pipeline, see [AI Flow](./AI_FLOW.md).
