import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';

declare const global: {
  resetAllChats?: boolean;
  pendingChatUpdate?: { id: string; [key: string]: unknown };
  forceInboxRefresh?: boolean;
};
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import MessageBubble from './MessageBubble';
import InputBar from './InputBar';
import NavigationBar from './NavigationBar';
import TimestampHeader from './TimestampHeader';
import { initialMessages } from '../data/messages';
import { Colors, Typography, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  showDelivered?: boolean;
}

type ChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Chat'
>;

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { contactName, chatId } = route.params;
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const scrollViewRef = useRef<ScrollView>(null);
  const deliveredOpacity = useRef(new Animated.Value(0)).current;
  const deliveredScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Scroll to bottom when ScrollView is fully laid out
  const handleScrollViewLayout = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  // Also handle content size changes to maintain scroll position
  const handleContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  // Store the latest user message to update inbox on blur
  const lastSentMessageRef = useRef<{ text: string; timestamp: string } | null>(
    null
  );

  // Update inbox when navigating back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log(
        'beforeRemove fired, lastSentMessage:',
        lastSentMessageRef.current
      );
      // Update inbox if there was a new message sent
      if (lastSentMessageRef.current) {
        // Store the update in global navigation state
        console.log('Setting update for chatId:', chatId);
        global.pendingChatUpdate = {
          id: chatId,
          lastMessage: `You: ${lastSentMessageRef.current.text}`,
          timestamp: lastSentMessageRef.current.timestamp,
          unread: false,
        };
        lastSentMessageRef.current = null; // Clear after updating
      }
    });

    return unsubscribe;
  }, [navigation, chatId]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      event => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      event => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  const handleSendMessage = (text: string) => {
    console.log('handleSendMessage called with:', text, 'chatId:', chatId);
    const currentTime = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isSender: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      showDelivered: false,
    };
    setMessages(prev => [...prev, newMessage]);

    // Store the message to update inbox later
    lastSentMessageRef.current = { text, timestamp: currentTime };
    console.log('Stored in ref:', lastSentMessageRef.current);

    // Show "Delivered" after 1.5s delay with fade-in animation
    setTimeout(() => {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, showDelivered: true } : msg
        )
      );

      // Animate the delivered text fade-in and scale-up
      deliveredOpacity.setValue(0);
      deliveredScale.setValue(0.7);

      Animated.parallel([
        Animated.timing(deliveredOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deliveredScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);
  };

  // Function to check if we should show timestamp between messages
  const shouldShowTimestamp = (currentIndex: number) => {
    if (currentIndex === 0) return true; // Always show for first message

    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    // Parse timestamps to check if they're more than 15 minutes apart
    const currentTime = new Date(`2024-01-01 ${currentMessage.timestamp}`);
    const previousTime = new Date(`2024-01-01 ${previousMessage.timestamp}`);

    const timeDiff = currentTime.getTime() - previousTime.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    return minutesDiff >= 15;
  };

  // Function to check if message is the last in its group
  const isLastInGroup = (currentIndex: number) => {
    const currentMessage = messages[currentIndex];
    const nextMessage = messages[currentIndex + 1];

    // If it's the last message overall, it's last in group
    if (!nextMessage) return true;

    // If next message is from different sender, current is last in group
    if (currentMessage.isSender !== nextMessage.isSender) return true;

    // If there's a timestamp between current and next, current is last in group
    return shouldShowTimestamp(currentIndex + 1);
  };

  // Function to check if we should add spacing before a message (start of new group)
  const shouldAddGroupSpacing = (currentIndex: number) => {
    if (currentIndex === 0) return false; // No spacing before first message

    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    // Add spacing if sender changes (new conversation group)
    if (currentMessage.isSender !== previousMessage.isSender) return true;

    // Add spacing if there's a timestamp between messages
    return shouldShowTimestamp(currentIndex);
  };

  // Function to check if message is the first in its group
  const isFirstInGroup = (currentIndex: number) => {
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];

    // If it's the first message overall, it's first in group
    if (!previousMessage) return true;

    // If previous message is from different sender, current is first in group
    if (currentMessage.isSender !== previousMessage.isSender) return true;

    // If there's a timestamp between previous and current, current is first in group
    return shouldShowTimestamp(currentIndex);
  };

  return (
    <View style={styles.fullContainer}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onLayout={handleScrollViewLayout}
            onContentSizeChange={handleContentSizeChange}
          >
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {shouldShowTimestamp(index) && (
                  <TimestampHeader timestamp={message.timestamp} />
                )}
                {shouldAddGroupSpacing(index) && (
                  <View style={styles.groupSpacing} />
                )}
                <MessageBubble
                  text={message.text}
                  isSender={message.isSender}
                  hasReaction={message.hasReaction && isFirstInGroup(index)}
                  reactionType={message.reactionType}
                  isLastInGroup={isLastInGroup(index)}
                  _isFirstInGroup={isFirstInGroup(index)}
                />
                {message.isSender &&
                  message.showDelivered &&
                  isLastInGroup(index) && (
                    <Animated.View
                      style={[
                        styles.deliveredContainer,
                        { opacity: deliveredOpacity },
                      ]}
                    >
                      <Animated.Text
                        style={[
                          styles.deliveredText,
                          { transform: [{ scaleX: deliveredScale }] },
                        ]}
                      >
                        Delivered
                      </Animated.Text>
                    </Animated.View>
                  )}
              </React.Fragment>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Animated.View
        style={[styles.inputBarContainer, { bottom: keyboardHeight }]}
      >
        <InputBar
          onSendMessage={handleSendMessage}
          keyboardVisible={keyboardVisible}
        />
      </Animated.View>

      <View style={styles.navigationBarContainer}>
        <NavigationBar
          contactName={contactName}
          onBackPress={() => {
            navigation.goBack();
          }}
          onContactPress={() => console.log('Contact pressed')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
  },
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
  fullContainer: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
  },
  groupSpacing: {
    height: Spacing.groupSpacing,
  },
  inputBarContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 55,
    paddingLeft: Spacing.containerPadding,
    paddingRight: Spacing.inputPadding,
    paddingTop: 80,
  },
  navigationBarContainer: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
});

export default ChatScreen;
