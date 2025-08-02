# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a comprehensive iMessage prototype built with React Native and Expo, featuring both inbox list view and individual chat functionality. The app replicates the authentic iOS Messages experience with pixel-perfect design, smooth animations, and proper state management. Built with TypeScript throughout and follows modern React Native best practices.

## Development Commands

### Starting Development

```bash
npm install          # Install dependencies
npm start           # Start Expo development server
npm run ios         # Run on iOS simulator
```

### Code Quality

```bash
npm run lint        # Run ESLint with modern flat config
npm run lint:fix    # Auto-fix ESLint issues
npm run format      # Format code with Prettier
npm run format:check # Check code formatting
```

### Building

```bash
npm run build:ios   # Production iOS build
```

## Architecture

### Component Structure

- `App.tsx` - Root component that renders ChatScreen with StatusBar
- `components/ChatScreen.tsx` - Main chat interface with message state management
- `components/MessageBubble.tsx` - Individual message bubbles with reactions
- `components/InputBar.tsx` - Message input with send functionality
- `components/NavigationBar.tsx` - Top navigation with contact info
- `components/StatusBar.tsx` - Custom iOS-style status bar
- `components/HomeIndicator.tsx` - iPhone home indicator

### Key Features

- Message state managed in ChatScreen component with Message interface
- Auto-scrolling to new messages with useEffect and ScrollView ref
- Keyboard avoidance using KeyboardAvoidingView
- Message reactions (heart, thumbsUp, haha, doubleExclamation)
- Timestamp grouping logic (shows timestamps 15+ minutes apart)
- iOS-specific styling matching native iMessage design

### Message Data Structure

```typescript
interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
}
```

### Development Notes

- Uses Expo SDK ~53.0.20 with React Native 0.79.5
- TypeScript strict mode enabled
- iOS-only platform target with new architecture enabled
- SafeAreaView used for proper iPhone notch/home indicator handling
- StyleSheet-based styling with iOS design system colors (#0078ff blue, #e9e9eb gray)
