import React, { useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
} from 'react-native';
import BubbleRenderer from '../bubbles/BubbleRenderer';
import ChatBanner from './ChatBanner';
import { Message } from '../../types/message';
import {
  shouldShowTimestamp,
  shouldAddGroupSpacing,
  isLastInGroup,
  isFirstInGroup,
} from '../../utils/messageUtils';
import {
  getMessageSlideTransform,
  getDeliveredScaleTransform,
} from '../../utils/messageAnimations';
import { Colors, Typography, Spacing } from '../../constants/theme';

// Types for flattened data structure
type MessageItem = {
  type: 'message';
  message: Message;
  messageIndex: number;
};

type TimestampItem = {
  type: 'timestamp';
  timestamp: string;
  id: string;
};

type SpacingItem = {
  type: 'spacing';
  id: string;
};

type DeliveredItem = {
  type: 'delivered';
  message: Message;
  messageIndex: number;
  id: string;
};

type FlatListItem = MessageItem | TimestampItem | SpacingItem | DeliveredItem;

interface MessageListProps {
  messages: Message[];
  deliveredOpacity: Animated.Value;
  deliveredScale: Animated.Value;
  style?: any;
  contentContainerStyle?: any;
  onLayout?: () => void;
  onContentSizeChange?: () => void;
  scrollViewRef?: React.RefObject<FlatList | null>;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  disableKeyboardHandling?: boolean;
  isGroup?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  deliveredOpacity,
  deliveredScale,
  style,
  contentContainerStyle,
  onLayout,
  onContentSizeChange,
  scrollViewRef,
  ListFooterComponent,
  isGroup = false,
}) => {
  // Create flattened data structure for FlatList
  const flatListData = useMemo((): FlatListItem[] => {
    const items: FlatListItem[] = [];

    if (!messages || !Array.isArray(messages)) {
      return items;
    }

    messages.forEach((message, index) => {
      // Add timestamp header if needed
      if (shouldShowTimestamp(messages, index)) {
        items.push({
          type: 'timestamp',
          timestamp: message.timestamp,
          id: `timestamp-${message.id}`,
        });
      }

      // Add group spacing if needed
      if (shouldAddGroupSpacing(messages, index)) {
        items.push({
          type: 'spacing',
          id: `spacing-${message.id}`,
        });
      }

      // Add the message
      items.push({
        type: 'message',
        message,
        messageIndex: index,
      });

      // Add delivered indicator if needed
      // Allow delivered to show even if not last in group during transition
      if (message.isSender && message.showDelivered) {
        items.push({
          type: 'delivered',
          message,
          messageIndex: index,
          id: `delivered-${message.id}`,
        });
      }
    });

    return items;
  }, [messages]);

  const renderItem = ({ item }: { item: FlatListItem }) => {
    switch (item.type) {
      case 'timestamp':
        return <ChatBanner type='timestamp' content={item.timestamp} />;

      case 'spacing':
        return <View style={styles.groupSpacing} />;

      case 'message': {
        const { message, messageIndex } = item;
        const firstInGroup = isFirstInGroup(messages, messageIndex);
        const lastInGroup = isLastInGroup(messages, messageIndex);
        const isGroupRecipient = isGroup && !message.isSender;
        const hasReaction = !!message.hasReaction && firstInGroup;

        return (
          <Animated.View
            style={[
              styles.messageRow,
              {
                transform: getMessageSlideTransform(
                  message.animationValue,
                  message.isSender
                ),
              },
            ]}
          >
            <View style={isGroupRecipient && styles.groupRecipientRow}>
              {isGroupRecipient && firstInGroup && message.senderName ? (
                <Text
                  style={[
                    styles.groupSenderName,
                    hasReaction && styles.groupSenderNameWithReaction,
                  ]}
                >
                  {message.senderName}
                </Text>
              ) : null}
              <View style={isGroupRecipient && styles.groupBubbleContainer}>
                <BubbleRenderer
                  message={message}
                  isLastInGroup={lastInGroup}
                  isFirstInGroup={firstInGroup}
                  hasReaction={hasReaction}
                />
              </View>
              {isGroupRecipient && lastInGroup && message.senderAvatar ? (
                <Image
                  source={message.senderAvatar}
                  style={styles.groupSenderAvatar}
                  resizeMode='cover'
                />
              ) : null}
            </View>
          </Animated.View>
        );
      }

      case 'delivered': {
        const { message, messageIndex } = item;
        const isLastInGroupDelivered = isLastInGroup(messages, messageIndex);
        return (
          <Animated.View
            style={[
              styles.deliveredContainer,
              !isLastInGroupDelivered && styles.deliveredNotLastInGroup,
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
        );
      }

      default:
        return null;
    }
  };

  const keyExtractor = (item: FlatListItem) => {
    switch (item.type) {
      case 'message':
        return item.message.id;
      default:
        return item.id;
    }
  };

  return (
    <FlatList
      ref={scrollViewRef}
      data={flatListData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      onLayout={onLayout}
      onContentSizeChange={onContentSizeChange}
      removeClippedSubviews={false}
      maxToRenderPerBatch={50}
      windowSize={20}
      initialNumToRender={50}
      keyboardShouldPersistTaps='handled'
      keyboardDismissMode='interactive'
      automaticallyAdjustKeyboardInsets={true}
      automaticallyAdjustContentInsets={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

const styles = StyleSheet.create({
  deliveredContainer: {
    alignItems: 'flex-end',
    marginLeft: '25%',
    marginRight: 0,
    marginTop: 2,
  },
  deliveredNotLastInGroup: {
    marginBottom: 4,
  },
  deliveredText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.delivered,
    fontWeight: Typography.medium,
    paddingRight: 4,
  },
  groupBubbleContainer: {
    marginLeft: 36,
  },
  groupRecipientRow: {
    position: 'relative',
    width: '100%',
  },
  groupSenderAvatar: {
    borderRadius: 15,
    bottom: 0,
    height: 30,
    left: 0,
    position: 'absolute',
    width: 30,
  },
  groupSenderName: {
    color: Colors.textTertiary,
    fontFamily: Typography.fontFamily,
    fontSize: 11,
    fontWeight: Typography.medium,
    lineHeight: 14,
    marginBottom: 2,
    marginLeft: 48,
  },
  groupSenderNameWithReaction: {
    // The bubble reserves this band for its reaction. Let the sender label
    // share the empty left side so it stays anchored to the bubble text.
    transform: [{ translateY: 20 }],
  },
  groupSpacing: {
    height: Spacing.groupSpacing,
  },
  messageRow: {
    // A definite row width avoids a circular max-width measurement that clips
    // text instead of wrapping it on current React Native.
    alignSelf: 'stretch',
  },
});

export default MessageList;
