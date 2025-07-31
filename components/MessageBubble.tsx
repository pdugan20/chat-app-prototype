import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MessageTail from './MessageTail';
import { Colors, Typography, Spacing, Layout } from '../constants/theme';

interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  isLastInGroup?: boolean;
  _isFirstInGroup?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  isSender,
  hasReaction = false,
  reactionType = 'heart',
  isLastInGroup = false,
  _isFirstInGroup = false,
}) => {
  return (
    <View
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.recipientContainer,
        hasReaction && styles.containerWithReaction,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender ? styles.senderBubble : styles.recipientBubble,
        ]}
      >
        <Text
          style={[
            styles.text,
            isSender ? styles.senderText : styles.recipientText,
          ]}
        >
          {text}
        </Text>
      </View>
      {hasReaction && (
        <View
          style={[
            styles.reactionContainer,
            isSender ? styles.senderReaction : styles.recipientReaction,
          ]}
        >
          <View
            style={[
              styles.reactionBubble,
              isSender
                ? styles.senderReactionBubble
                : styles.recipientReactionBubble,
            ]}
          >
            <Text style={styles.reactionText}>
              {reactionType === 'heart'
                ? '❤️'
                : reactionType === 'thumbsUp'
                  ? '👍'
                  : reactionType === 'haha'
                    ? '😂'
                    : '‼️'}
            </Text>
          </View>
          <View
            style={[
              styles.reactionTail,
              isSender
                ? styles.senderReactionTail
                : styles.recipientReactionTail,
            ]}
          >
            <View
              style={[
                styles.tailDot,
                styles.tailDotLarge,
                isSender
                  ? styles.senderTailDotLarge
                  : styles.recipientTailDotLarge,
                {
                  backgroundColor: isSender
                    ? Colors.messageBubbleGray
                    : Colors.messageBubbleBlue,
                },
              ]}
            />
            <View
              style={[
                styles.tailDot,
                styles.tailDotSmall,
                isSender
                  ? styles.senderTailDotSmall
                  : styles.recipientTailDotSmall,
                {
                  backgroundColor: isSender
                    ? Colors.messageBubbleGray
                    : Colors.messageBubbleBlue,
                },
              ]}
            />
          </View>
        </View>
      )}
      {isLastInGroup && (
        <View style={isSender ? styles.senderTail : styles.recipientTail}>
          <MessageTail
            color={isSender ? Colors.systemBlue : Colors.messageBubbleGray}
            size={16}
            flipped={!isSender}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    borderRadius: Spacing.messageBorderRadius,
    maxWidth: '100%',
    paddingHorizontal: Spacing.messagePadding,
    paddingVertical: Spacing.messagePaddingVertical,
  },
  container: {
    marginVertical: 0.5,
    maxWidth: Layout.maxMessageWidth,
    position: 'relative',
  },
  containerWithReaction: {
    paddingTop: 20,
  },
  reactionBubble: {
    alignItems: 'center',
    borderColor: Colors.reactionBorder,
    borderRadius: Spacing.reactionBorderRadius,
    borderWidth: 1,
    height: Spacing.reactionSize,
    justifyContent: 'center',
    width: Spacing.reactionSize,
  },
  reactionContainer: {
    height: Spacing.reactionContainerHeight,
    position: 'absolute',
    top: -4,
    width: Spacing.reactionContainerWidth,
  },
  reactionTail: {
    height: Spacing.reactionTailHeight,
    position: 'absolute',
    width: Spacing.reactionTailWidth,
  },
  reactionText: {
    fontSize: Typography.reactionEmoji,
  },
  recipientBubble: {
    backgroundColor: Colors.messageBubbleGray,
  },
  recipientContainer: {
    alignSelf: 'flex-start',
    marginRight: Layout.messageMarginSide,
  },
  recipientReaction: {
    right: -16,
  },
  recipientReactionBubble: {
    backgroundColor: Colors.messageBubbleBlue,
  },
  recipientReactionTail: {
    bottom: -15,
    right: -5,
  },
  recipientTail: {
    bottom: 0.5,
    left: -5.5,
    position: 'absolute',
    zIndex: 10,
  },
  recipientTailDotLarge: {
    left: 13,
    top: -1,
  },
  recipientTailDotSmall: {
    left: 23,
    top: 8,
  },
  recipientText: {
    color: Colors.black,
  },
  senderBubble: {
    backgroundColor: Colors.messageBubbleBlue,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    marginLeft: Layout.messageMarginSide,
  },
  senderReaction: {
    left: -16,
  },
  senderReactionBubble: {
    backgroundColor: Colors.messageBubbleGray,
  },
  senderReactionTail: {
    bottom: -15,
    left: -5,
  },
  senderTail: {
    bottom: 0.5,
    position: 'absolute',
    right: -5.5,
    zIndex: 10,
  },
  senderTailDotLarge: {
    right: 13,
    top: -1,
  },
  senderTailDotSmall: {
    right: 23,
    top: 8,
  },
  senderText: {
    color: Colors.white,
    opacity: 0.9,
  },
  tailDot: {
    borderRadius: Spacing.tailDotBorderRadius,
    position: 'absolute',
  },
  tailDotLarge: {
    height: Spacing.tailDotLargeSize,
    width: Spacing.tailDotLargeSize,
  },
  tailDotSmall: {
    height: Spacing.tailDotSmallSize,
    width: Spacing.tailDotSmallSize,
  },
  text: {
    fontFamily: Typography.fontFamily,
    fontSize: Typography.message,
    fontWeight: Typography.regular,
    letterSpacing: -0.15,
    lineHeight: Typography.messageLineHeight,
  },
});

export default MessageBubble;
