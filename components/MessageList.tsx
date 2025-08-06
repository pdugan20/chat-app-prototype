import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import BubbleRenderer from './bubbles/BubbleRenderer';
import TimestampHeader from './TimestampHeader';
import { Message } from '../types/message';
import {
  shouldShowTimestamp,
  shouldAddGroupSpacing,
  isLastInGroup,
  isFirstInGroup,
} from '../utils/messageUtils';
import {
  getMessageSlideTransform,
  getDeliveredScaleTransform,
} from '../utils/messageAnimations';
import { Colors, Typography, Spacing } from '../constants/theme';

interface MessageListProps {
  messages: Message[];
  deliveredOpacity: Animated.Value;
  deliveredScale: Animated.Value;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  deliveredOpacity,
  deliveredScale,
}) => {
  return (
    <>
      {messages.map((message, index) => {
        const messageAlignSelf = message.isSender ? 'flex-end' : 'flex-start';

        return (
          <React.Fragment key={message.id}>
            {shouldShowTimestamp(messages, index) && (
              <TimestampHeader timestamp={message.timestamp} />
            )}
            {shouldAddGroupSpacing(messages, index) && (
              <View style={styles.groupSpacing} />
            )}
            <Animated.View
              style={{
                opacity: message.animationValue || 1,
                transform: getMessageSlideTransform(
                  message.animationValue,
                  message.isSender
                ),
                alignSelf: messageAlignSelf,
              }}
            >
              <BubbleRenderer
                message={message}
                isLastInGroup={isLastInGroup(messages, index)}
                isFirstInGroup={isFirstInGroup(messages, index)}
                hasReaction={
                  message.hasReaction && isFirstInGroup(messages, index)
                }
              />
            </Animated.View>
            {message.isSender &&
              message.showDelivered &&
              isLastInGroup(messages, index) && (
                <Animated.View
                  style={[
                    styles.deliveredContainer,
                    {
                      opacity: message.deliveredOpacity || deliveredOpacity,
                    },
                  ]}
                >
                  <Animated.Text
                    style={[
                      styles.deliveredText,
                      {
                        transform: getDeliveredScaleTransform(
                          message.deliveredScale,
                          deliveredScale
                        ),
                      },
                    ]}
                  >
                    Delivered
                  </Animated.Text>
                </Animated.View>
              )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  deliveredContainer: {
    alignItems: 'flex-end',
    marginLeft: '25%',
    marginRight: 0,
    marginTop: 2,
  },
  deliveredText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.delivered,
    fontWeight: Typography.medium,
    paddingRight: 4,
  },
  groupSpacing: {
    height: Spacing.groupSpacing,
  },
});

export default MessageList;
