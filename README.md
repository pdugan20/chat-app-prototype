# iMessage Prototype

[![CI/CD Pipeline](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml/badge.svg)](https://github.com/pdugan20/chat-app-prototype/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/pdugan20/chat-app-prototype/branch/main/graph/badge.svg)](https://codecov.io/gh/pdugan20/chat-app-prototype)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-22.x-brightgreen.svg)](https://nodejs.org)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020.svg?logo=expo)](https://expo.dev)

A React Native recreation of Apple's iMessage app, featuring a complete mock inbox, chat threads, and the ability to send messages.

## About This Project

This iMessage prototype replicates the authentic iOS Messages app experience, including both the inbox list view and individual chat screens.

## Key Features

### Chat Interface

- **Message Reactions**: Support for heart, thumbs up, haha, and double exclamation reactions
- **Delivered Status**: Animated "Delivered" text with smooth fade-in and scale effects
- **Timestamp Logic**: Smart timestamp display (15+ minutes apart)
- **Keyboard Handling**: Proper keyboard avoidance with animated input bar
- **AI-Powered Responses**: Contextual responses using Anthropic's Claude API
- **Typing Indicator**: Animated three-dot indicator matching native iMessage style

### Inbox Interface

- **Contact List**: Scrollable list of conversations with profile photos and message previews
- **Group Chats**: Support for group chats
- **Unread Indicators**: Blue dots for unread messages
- **Live Updates**: Real-time inbox updates when sending messages
- **Search Integration**: Native iOS search bar

## Technology Stack

- **React Native** with Expo SDK 54 (Development Build)
- **TypeScript** with strict mode for type safety
- **React Navigation** for native navigation patterns
- **Animated API** for smooth animations and transitions
- **Modern ESLint** with flat configuration
- **Jest** with React Native Testing Library for comprehensive testing
- **Modular Architecture** with reusable components
- **Theme System** with centralized colors, typography, and spacing
- **Expo Development Build** for enhanced debugging and custom native code

## Getting Started

### Prerequisites

- Node.js v22 (recommended)
- Expo CLI
- Xcode (for iOS development)
- iOS Simulator or physical iOS device
- **Note**: This app uses Expo Development Build and requires building the native iOS app

### Installation

```bash
# Clone the repository
git clone https://github.com/pdugan20/chat-app-prototype
cd chat-app-prototype

# Install dependencies
npm install

# Setup git hooks (recommended)
npm run setup-hooks

# Configure integrations (optional)
cp .env.example .env
# See docs/AI_SETUP.md and docs/APPLE_MUSIC_SETUP.md for configuration

# Start development
npm run ios  # Build and run on iOS simulator
```

**Important**: This app uses Expo Development Build, which means it needs to be built as a native iOS app rather than running in Expo Go. The `npm run ios` command will handle building and installing the development build automatically.

### Development Commands

```bash
npm start             # Start Expo development server
npm run ios           # Build and run development build on iOS simulator
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run setup-hooks   # Setup git hooks for automated code quality

# Testing
npm test              # Run test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests in CI mode

# Component Configuration
npm run sb            # Start Storybook development server
npm run sb:ios        # Build and run Storybook on iOS
npm run sb:generate   # Regenerate Storybook stories

# Development Build Commands
npx expo run:ios      # Build and run development build
npx expo prebuild     # Regenerate native iOS project files
```

### Development Build Management

When working with the development build, you may need to rebuild the native project:

- **After changing app.json**: Run `npx expo prebuild --clean` to regenerate the native project
- **After adding native dependencies**: Run `npx expo prebuild` and then `npx expo run:ios`
- **For configuration changes**: Use `npx expo prebuild --clean` for a clean rebuild

**Important**: After modifying your project's configuration or native code, you will need to rebuild your project. Running `npx expo prebuild` again layers the changes on top of existing files and may produce different results after the build. Use `npx expo prebuild --clean` for a fresh start.

### Git Hooks Setup

This project includes automated code quality and security checks via git hooks. To enable them:

```bash
npm run setup-hooks  # Configure git hooks
```

This sets up automated hooks that run:

**Pre-commit Hook:**

- **Prettier** formatting check
- **ESLint** code quality check
- **TypeScript** type checking
- **Expo** dependency compatibility check
- **Gitleaks** secret scanning (if installed)

**Pre-push Hook:**

- **Jest** test suite execution

The hooks prevent commits/pushes if any checks fail. To bypass (not recommended): `git commit --no-verify` or `git push --no-verify`

**Note**: Install Gitleaks for secret scanning: `brew install gitleaks`

## Testing

This project uses Jest with React Native Testing Library for comprehensive component and integration testing.

### Test Structure

- **Unit Tests**: Component behavior and props testing
- **Integration Tests**: Component interaction testing
- **Coverage Tracking**: Automated coverage reporting via Codecov
- **Test Files**: Located in `__tests__` directories alongside components

### Coverage Thresholds

Coverage thresholds are currently disabled to allow gradual test addition. Once comprehensive coverage is achieved, thresholds will be enforced in CI/CD.

## CI/CD Pipeline

This project includes a comprehensive CI/CD pipeline that runs on every push and pull request.

### Pipeline Jobs

1. **Security Scanning**

   - Gitleaks secret detection
   - Dependency vulnerability review
   - Automated security alerts

2. **Code Quality Checks**

   - ESLint code linting
   - Prettier formatting validation
   - TypeScript type checking (standard + strict mode)

3. **Unit Tests**

   - Jest test suite execution
   - Coverage report generation
   - Codecov integration

4. **Build Validation**

   - Expo dependency compatibility check
   - iOS prebuild validation
   - Production export creation
   - Bundle size analysis

5. **Automated Releases**
   - Semantic versioning with conventional commits
   - Automated CHANGELOG generation
   - GitHub release creation

### Branch Protection

The main branch is protected with required status checks. All CI jobs must pass before merging.

**Documentation**: See [CI_CD_SETUP.md](./CI_CD_SETUP.md) for detailed pipeline configuration and troubleshooting.

## Project Structure

```text
chat-app/
├── components/         # Reusable UI components
├── screens/            # Main app screens (Inbox, Chat)
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and helpers
├── services/           # External service integrations
├── constants/          # Theme and design constants
├── data/               # Mock data for development
├── types/              # TypeScript type definitions
├── assets/             # Images and static resources
├── docs/               # Additional documentation
├── .github/            # GitHub Actions workflows and config
├── .githooks/          # Git hooks for code quality
├── .rnstorybook/       # Storybook configuration and stories
└── ios/                # Native iOS project files (development build)
```

## Storybook Integration

The app includes Storybook for component development and testing:

- **Component Isolation**: Test individual components in isolation
- **Interactive Controls**: Modify component props in real-time
- **Visual Testing**: See how components look across different states
- **Documentation**: Built-in component documentation and examples

### Using Storybook

1. **Start Storybook**: `npm run sb:ios`
2. **View Components**: Browse components in the left sidebar
3. **Modify Props**: Use the controls panel at the bottom to change component properties
4. **Test Interactions**: Test component interactions and animations

## Architecture Highlights

### Modular Component Design

- **Reusable Components**: Profile photos, chat items, and UI elements are fully modular
- **Custom Hooks**: Extracted business logic for messages, keyboard handling, and AI responses
- **Animation Utilities**: Centralized animation constants and helper functions
- **Theme System**: Centralized colors, typography, and spacing constants
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures

### State Management

- **Local State**: React hooks for component-specific state
- **Global Updates**: Cross-screen updates using navigation listeners and global flags
- **Real-time Sync**: Inbox updates when messages are sent in chat screens

## Key Implementation Details

### Inbox Management

- Polling-based updates with focus/blur optimization
- Proper unread state management with reset functionality
- Live preview text updates when sending messages

## Optional Integrations

This project supports optional integrations to enhance the chat experience:

### AI Chat Responses

Enable AI-powered contextual responses using Anthropic's Claude or OpenAI's GPT models. When configured, the AI automatically responds to messages with natural, conversational replies.

**Setup**: See [docs/AI_SETUP.md](./docs/AI_SETUP.md) for detailed configuration instructions.

### Apple Music Integration

Add Apple Music integration for AI-powered music recommendations. Music suggestions appear as interactive Apple Music bubbles with album art and playback controls.

**Setup**: See [docs/APPLE_MUSIC_SETUP.md](./docs/APPLE_MUSIC_SETUP.md) for detailed configuration instructions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [iMessage Chat Builder UI Kit](https://www.figma.com/community/file/1519446101653617639/imessage-chat-builder) for the design and component reference
- [Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server) for enabling rapid design-to-code workflow
- [Expo](https://expo.dev) for the React Native development platform
