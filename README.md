# iMessage Prototype

[![CI](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml/badge.svg)](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/pdugan20/chat-app-prototype/branch/main/graph/badge.svg)](https://codecov.io/gh/pdugan20/chat-app-prototype)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=white)](https://reactnative.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?logo=opensourceinitiative&logoColor=white)](LICENSE)

A React Native recreation of Apple's iMessage app, featuring a complete mock inbox, chat threads, AI-powered responses, and Apple Music integration.

## Features

- Pixel-perfect iMessage inbox and chat interfaces
- Message reactions (heart, thumbs up, haha, double exclamation)
- Smart timestamp grouping and delivered status animations
- AI-powered contextual responses (Anthropic Claude or OpenAI)
- Typing indicator matching native iMessage style
- Group chat support with unread indicators
- Apple Music integration for music recommendations
- Storybook for component development and testing

## Getting Started

```bash
git clone https://github.com/pdugan20/chat-app-prototype
cd chat-app-prototype
npm install
npm run setup-hooks    # Git hooks for code quality
cp .env.example .env   # Configure API keys (optional)
npm run ios            # Build and run on iOS simulator
```

Requires Node.js v22, Xcode, and an iOS Simulator. Uses Expo Development Build (not Expo Go).

## Development

```bash
npm start              # Expo dev server
npm run ios            # Build and run on iOS
npm run lint           # ESLint
npm run format:check   # Prettier check
npm test               # Jest tests
npm run test:ci        # Tests with coverage
npm run sb:ios         # Storybook on iOS
```

## Architecture

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
services/         AI and external service integrations
stores/           State management
constants/        Theme (colors, typography, spacing)
types/            TypeScript type definitions
data/             Mock data for development
```

## CI Pipeline

5 jobs run on every push and PR: security scanning (Gitleaks), code quality (ESLint, Prettier, TypeScript, markdownlint, Knip), unit tests with coverage, build validation (Expo prebuild, bundle analysis), and automated releases (semantic versioning).

## Documentation

- [AI Setup](docs/AI_SETUP.md) - Configure Claude or OpenAI responses
- [Apple Music Setup](docs/APPLE_MUSIC_SETUP.md) - Music integration
- [AI Flow](docs/AI_FLOW.md) - AI response decision logic
- [CI/CD Setup](docs/CI_CD_SETUP.md) - Pipeline configuration

## Related

- [chat-builder-plugin](https://github.com/pdugan20/chat-builder-plugin) - Figma plugin for generating iMessage prototypes
