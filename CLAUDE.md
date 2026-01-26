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

### Testing

```bash
npm test              # Run test suite
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ci       # Run tests in CI mode
```

### Git Hooks

```bash
npm run setup-hooks  # Setup pre-commit and pre-push hooks
```

Pre-commit runs: Prettier, ESLint, TypeScript, Expo checks, Gitleaks (if installed)
Pre-push runs: Full test suite

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

- Uses Expo SDK ~54.0.16 with React Native 0.81.4
- TypeScript strict mode enabled
- iOS-only platform target with new architecture enabled
- SafeAreaView used for proper iPhone notch/home indicator handling
- StyleSheet-based styling with iOS design system colors (#0078ff blue, #e9e9eb gray)
- Jest + React Native Testing Library for testing
- Comprehensive CI/CD pipeline with GitHub Actions
- Automated semantic versioning and releases

### AI Integration

- Supports both Anthropic Claude and OpenAI GPT models
- Service layer pattern with provider abstraction in `services/ai/`
- Environment-based configuration using react-native-dotenv
- Typing indicator shown during AI response generation
- Contextual responses based on last 10 messages
- Fallback to preset responses if API unavailable
- Music detection and Apple Music integration for music-related queries
- See `docs/AI_FLOW.md` for detailed AI response flow and decision logic

## Testing

### Test Framework

- **Jest** with `jest-expo` preset for React Native compatibility
- **React Native Testing Library** for component testing
- Test files located in `__tests__` directories alongside components
- Coverage tracking with Codecov integration

### Testing Patterns

- Component tests focus on behavior, not implementation details
- Mock external dependencies (expo-blur, expo-symbols, AI services)
- Use `fireEvent` for simulating user interactions
- Test both happy paths and edge cases
- Include tests for accessibility and error states

### Running Tests

Tests run automatically in:

- **Pre-push hook**: Full test suite must pass before pushing
- **CI/CD pipeline**: Tests run on every push and PR
- **Local development**: Use watch mode for TDD workflow

## CI/CD Pipeline

### Overview

Comprehensive GitHub Actions pipeline with 5 main jobs:

1. **Security Scanning** - Gitleaks + dependency review
2. **Code Quality** - ESLint, Prettier, TypeScript checks
3. **Unit Tests** - Jest suite + coverage reporting
4. **Build Validation** - Expo checks, iOS prebuild, bundle analysis
5. **Automated Releases** - Semantic versioning + CHANGELOG generation

### Branch Protection

Main branch requires:

- All CI checks passing
- No merge conflicts
- Up-to-date with base branch

### Semantic Versioning

- Uses conventional commits (feat:, fix:, chore:, etc.)
- Automatic version bumping on merge to main
- Auto-generated CHANGELOG.md
- GitHub releases with release notes

See `CI_CD_SETUP.md` for detailed pipeline documentation.
