import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import TypingIndicator from './TypingIndicator';
import { Message } from '../types/message';
import { Spacing } from '../constants/theme';

interface TypingSectionProps {
  showTypingIndicator: boolean;
  typingIndicatorOpacity: Animated.Value;
  messages: Message[];
}

const TypingSection: React.FC<TypingSectionProps> = ({
  showTypingIndicator,
  typingIndicatorOpacity,
  messages,
}) => {
  if (!showTypingIndicator) return null;

  return (
    <>
      {messages.length > 0 && messages[messages.length - 1].isSender && (
        <View style={styles.groupSpacing} />
      )}
      <Animated.View
        style={{
          opacity: typingIndicatorOpacity,
        }}
      >
        <TypingIndicator
          isVisible={showTypingIndicator}
          hasSmallGap={
            messages.length > 0 && !messages[messages.length - 1].isSender
          }
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  groupSpacing: {
    height: Spacing.groupSpacing,
  },
});

export default TypingSection;
