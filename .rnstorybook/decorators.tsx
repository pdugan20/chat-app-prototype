import React from 'react';
import { SafeAreaView, Text, View, StyleSheet } from 'react-native';
import type { StoryContext } from '@storybook/react';
import { Colors, Typography } from '../constants/theme';
import { PositionControlWrapper } from './components/PositionControlWrapper';

const decoratorStyles = StyleSheet.create({
  darkBackground: {
    backgroundColor: Colors.black,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: Colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  headerDark: {
    borderBottomColor: Colors.dividerGray,
  },
  headerTitle: {
    color: Colors.black,
    fontFamily: Typography.fontFamily,
    fontSize: 15,
    fontWeight: Typography.medium,
  },
  headerTitleDark: {
    color: Colors.white,
  },
  lightBackground: {
    backgroundColor: Colors.white,
  },
  screenContainer: {
    flex: 1,
  },
});

export const CenteredDecorator = (
  Story: React.ComponentType<Record<string, unknown>>,
  context: StoryContext
) => {
  const isDarkMode = context.args.darkMode || context.globals.theme === 'dark';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { darkMode, ...storyArgs } = context.args;

  const componentName = context.title.split('/').pop() || 'Component';
  const storyName = context.name;
  const title = `${componentName} | ${storyName}`;

  return (
    <SafeAreaView
      style={[
        decoratorStyles.screenContainer,
        isDarkMode
          ? decoratorStyles.darkBackground
          : decoratorStyles.lightBackground,
      ]}
    >
      <View
        style={[
          decoratorStyles.header,
          isDarkMode && decoratorStyles.headerDark,
        ]}
      >
        <Text
          style={[
            decoratorStyles.headerTitle,
            isDarkMode && decoratorStyles.headerTitleDark,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <PositionControlWrapper>
        <Story {...storyArgs} />
      </PositionControlWrapper>
    </SafeAreaView>
  );
};
