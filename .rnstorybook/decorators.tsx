import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { StoryContext } from '@storybook/react';
import { Colors } from '../constants/theme';

const Stack = createNativeStackNavigator();

// Shared decorator styles
const decoratorStyles = StyleSheet.create({
  darkBackground: {
    backgroundColor: Colors.black,
  },
  flexStartContainer: {
    alignItems: 'flex-start',
    flex: 1,
    padding: 20,
  },
  lightBackground: {
    backgroundColor: Colors.white,
  },
  messageContainer: {
    alignSelf: 'center',
  },
  screenContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

// Centered decorator with theme support
export const CenteredDecorator = (
  Story: React.ComponentType,
  context: StoryContext
) => {
  const isDarkMode = context.args.darkMode || context.globals.theme === 'dark';

  // Remove darkMode from args before passing to component to avoid TypeScript error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { darkMode, ...storyArgs } = context.args;
  const StoryWithArgs = () => <Story {...storyArgs} />;

  // Extract component and story names
  const componentName = context.title.split('/').pop() || 'Component';
  const storyName = context.name;

  // Create a screen component that renders the story
  const StoryScreen = () => (
    <View
      style={[
        decoratorStyles.screenContainer,
        isDarkMode
          ? decoratorStyles.darkBackground
          : decoratorStyles.lightBackground,
      ]}
    >
      <View style={decoratorStyles.messageContainer}>
        <StoryWithArgs />
      </View>
    </View>
  );

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerTitle: `${componentName} | ${storyName}`,
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen name='Story' component={StoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Simple flex-start decorator for buttons and other controls
export const FlexStartDecorator = (
  Story: React.ComponentType,
  context: StoryContext
) => {
  const isDarkMode = context.globals.theme === 'dark';

  return (
    <View
      style={[
        decoratorStyles.flexStartContainer,
        isDarkMode
          ? decoratorStyles.darkBackground
          : decoratorStyles.lightBackground,
      ]}
    >
      <Story />
    </View>
  );
};
