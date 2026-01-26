// Setup file for Jest tests
// Note: @testing-library/react-native v12.4+ has built-in matchers

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      anthropicApiKey: 'test-key',
      openaiApiKey: 'test-key',
      appleMusicDeveloperToken: 'test-token',
    },
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
