# chat-app-prototype

[![CI](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/pdugan20/chat-app-prototype)](LICENSE)

An unofficial iMessage prototype for iOS, built with React Native and Expo.
Includes an inbox and chat threads with reactions, timestamp grouping, group
chats, and typing indicators. Optional Claude or OpenAI replies can include
Apple Music recommendations. Storybook stories cover individual UI components.

## Getting Started

Requires Node.js 22, npm 11, and a Mac with Xcode and an iOS Simulator installed.

```bash
git clone https://github.com/pdugan20/chat-app-prototype.git
cd chat-app-prototype
npm install
npm run setup-hooks
npm run ios
```

The app opens to the Messages inbox with sample conversations. Chat uses mock
replies when the AI proxy is not configured, so API keys are optional.

For live replies, copy `.env.example` to `.env` and follow the
[AI setup guide](docs/AI_SETUP.md). Run `npm run ai-proxy` in a separate terminal
alongside the app. The proxy runs on the Simulator's host Mac and keeps provider
credentials outside the mobile bundle. For music recommendations, see
[Apple Music setup](docs/APPLE_MUSIC_SETUP.md).

## Development

```bash
npm start              # Expo dev server
npm run ios            # Build and run on iOS
npm run ai-proxy       # Loopback AI proxy for Simulator
npm run lint           # ESLint
npm run format:check   # Prettier check
npm test               # Jest tests
npm run test:ci        # AI proxy tests and Jest with coverage
npm run sb:ios         # Start Expo with Storybook enabled on iOS
```

## Project Structure

```text
screens/          Chat and inbox screens
components/
  avatars/        Profile photo components
  bubbles/        Message bubble components
  chat/           Chat UI (input bar, typing indicator)
  inbox/          Inbox UI (chat items, search)
  navigation/     Navigation bar components
  previews/       Message preview components
hooks/            Custom React hooks
contexts/         Shared chat update context
services/         AI and external service integrations
server/ai-proxy/  Loopback-only AI proxy and provider SDKs
stores/           Zustand application and chat state
constants/        Theme (colors, typography, spacing)
types/            TypeScript type definitions
data/             Sample conversations and messages
utils/            Message grouping, music lookup, and playback helpers
.rnstorybook/     Component stories and fixtures
```

## Documentation

- [AI Setup](docs/AI_SETUP.md) - Configure Claude or OpenAI responses
- [Apple Music Setup](docs/APPLE_MUSIC_SETUP.md) - Music integration
- [AI Flow](docs/AI_FLOW.md) - AI response decision logic
- [CI/CD Setup](docs/CI_CD_SETUP.md) - Pipeline configuration

## Related

- [figma-chat-builder](https://github.com/pdugan20/figma-chat-builder) - Figma plugin for generating iMessage prototypes
- [imessage-swift-prototype](https://github.com/pdugan20/imessage-swift-prototype) - SwiftUI iMessage prototype
