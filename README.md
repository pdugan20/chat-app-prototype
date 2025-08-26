# iMessage Prototype

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

- **React Native** with Expo SDK 53.0.22 (Development Build)
- **TypeScript** with strict mode for type safety
- **React Navigation** for native navigation patterns
- **Animated API** for smooth animations and transitions
- **Modern ESLint** with flat configuration
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

# Configure AI (optional - see AI Setup section below)
cp .env.example .env
# Edit .env and add your API key

# Build and run the development build on iOS
npm run ios

# Or start the development server and use a pre-built dev client
npm start
```

**Important**: This app uses Expo Development Build, which means it needs to be built as a native iOS app rather than running in Expo Go. The `npm run ios` command will handle building and installing the development build automatically.

### Development Commands

```bash
npm start           # Start Expo development server
npm run ios         # Build and run development build on iOS simulator
npm run build:ios   # Production iOS build
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier

# Storybook (Component Development)
npm run sb          # Start Storybook in development build
npm run sb:ios      # Build and run Storybook on iOS
npm run sb:generate # Regenerate Storybook stories

# Development Build Commands
npx expo run:ios    # Build and run development build (alternative to npm run ios)
npx expo prebuild   # Regenerate native iOS project files
npx expo prebuild --clean  # Clean rebuild of native project (use when making config changes)
```

### Development Build Management

When working with the development build, you may need to rebuild the native project:

- **After changing app.json**: Run `npx expo prebuild --clean` to regenerate the native project
- **After adding native dependencies**: Run `npx expo prebuild` and then `npx expo run:ios`
- **For configuration changes**: Use `npx expo prebuild --clean` for a clean rebuild

**Important**: After modifying your project's configuration or native code, you will need to rebuild your project. Running `npx expo prebuild` again layers the changes on top of existing files and may produce different results after the build. Use `npx expo prebuild --clean` for a fresh start.

## Project Structure

```
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
├── .rnstorybook/       # Storybook configuration and stories
└── ios/                # Native iOS project files (development build)
```

## Development Build vs Expo Go

This app uses **Expo Development Build** instead of Expo Go because it includes:

- **@expo/ui** components that require native iOS compilation
- **Context menus** and other native iOS features
- **Enhanced debugging** capabilities
- **Better performance** for complex animations and interactions

### Why Development Build?

- **Custom Native Code**: Supports libraries that require native iOS compilation
- **iOS-Specific Features**: Full access to iOS APIs and UI components
- **Better Debugging**: More comprehensive error reporting and debugging tools
- **Production-Like Environment**: Closer to how the final app will behave

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

## AI Chat Integration (Optional)

The app supports AI-powered contextual responses using either Anthropic's Claude or OpenAI's GPT models. When enabled, the AI will automatically respond to your messages with natural, conversational replies.

### Setup Instructions

1. **Get an API Key**

   **For Anthropic (Claude):**
   - Sign up at https://console.anthropic.com/
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (starts with `sk-ant-`)

   **For OpenAI (GPT):**
   - Sign up at https://platform.openai.com/
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure Environment**

   ```bash
   # Edit the .env file

   # For Anthropic:
   EXPO_PUBLIC_AI_PROVIDER=anthropic
   EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your-key-here

   # For OpenAI:
   EXPO_PUBLIC_AI_PROVIDER=openai
   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-key-here
   ```

3. **Restart the App**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm start
   ```

### How It Works

- Send a message in any chat
- The typing indicator appears while the AI processes
- A contextual response is generated based on the conversation
- Falls back to preset responses if API is unavailable

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [iMessage Chat Builder UI Kit](https://www.figma.com/community/file/1519446101653617639/imessage-chat-builder) for the design and component reference
- [Figma MCP Server](https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server) for enabling rapid design-to-code workflow
- [Expo](https://expo.dev) for the React Native development platform
- React Native and Expo communities
