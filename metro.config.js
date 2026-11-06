const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/withStorybook');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = withStorybook(defaultConfig, {
  enabled: process.env.STORYBOOK_ENABLED === 'true',
  configPath: path.resolve(__dirname, '.rnstorybook'),
});
