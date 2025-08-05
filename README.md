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

- **React Native** with Expo SDK ~53.0.20
- **TypeScript** with strict mode for type safety
- **React Navigation** for native navigation patterns
- **Animated API** for smooth animations and transitions
- **Modern ESLint** with flat configuration
- **Modular Architecture** with reusable components
- **Theme System** with centralized colors, typography, and spacing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Expo CLI
- iOS Simulator or physical iOS device

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

# Start the development server
npm start

# Run on iOS
npm run ios
```

### Development Commands

```bash
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
npm run build:ios   # Production iOS build
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
```

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
└── assets/             # Images and static resources
```

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
