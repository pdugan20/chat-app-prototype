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
  chatMessages?: { [chatId: string]: Message[] };
};
declare const clearTimeout: (id: any) => void;
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import NavigationBar from '../components/NavigationBar';
import TimestampHeader from '../components/TimestampHeader';
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
  animationValue?: Animated.Value;
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
  // Initialize global chatMessages if it doesn't exist
  if (!global.chatMessages) {
    global.chatMessages = {};
  }

  // Load messages from global store or use initial messages
  const [messages, setMessages] = useState<Message[]>(() => {
    return global.chatMessages?.[chatId] || initialMessages;
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const deliveredOpacity = useRef(new Animated.Value(0)).current;
  const deliveredScale = useRef(new Animated.Value(0.7)).current;
  const deliveredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Save messages to global store whenever they change
  useEffect(() => {
    if (global.chatMessages) {
      global.chatMessages[chatId] = messages;
    }
  }, [messages, chatId]);

  // Set delivered opacity to 1 for messages that already have showDelivered (only on mount)
  useEffect(() => {
    const hasDeliveredMessages = messages.some(msg => msg.showDelivered);
    if (hasDeliveredMessages) {
      deliveredOpacity.setValue(1);
      deliveredScale.setValue(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (deliveredTimeoutRef.current) {
        clearTimeout(deliveredTimeoutRef.current);
      }
    };
  }, []);

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
        Animated.spring(keyboardHeight, {
          toValue: event.endCoordinates.height,
          useNativeDriver: false,
          velocity: 8,
          tension: 100,
          friction: 25,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      _event => {
        setKeyboardVisible(false);
        Animated.spring(keyboardHeight, {
          toValue: 0,
          useNativeDriver: false,
          velocity: 8,
          tension: 100,
          friction: 25,
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

    const animationValue = new Animated.Value(0);
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isSender: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      showDelivered: false,
      animationValue,
    };
    setMessages(prev => [...prev, newMessage]);

    // Animate the message sliding up from behind the input with scale
    Animated.spring(animationValue, {
      toValue: 1,
      useNativeDriver: true,
      velocity: 3,
      tension: 100,
      friction: 10,
    }).start();

    // Store the message to update inbox later
    lastSentMessageRef.current = { text, timestamp: currentTime };
    console.log('Stored in ref:', lastSentMessageRef.current);

    // Show "Delivered" after 2s delay with fade-in animation
    deliveredTimeoutRef.current = setTimeout(() => {
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
    }, 2000);
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
            {messages.map((message, index) => {
              const messageAlignSelf = message.isSender
                ? 'flex-end'
                : 'flex-start';
              return (
                <React.Fragment key={message.id}>
                  {shouldShowTimestamp(index) && (
                    <TimestampHeader timestamp={message.timestamp} />
                  )}
                  {shouldAddGroupSpacing(index) && (
                    <View style={styles.groupSpacing} />
                  )}
                  <Animated.View
                    style={{
                      transform: [
                        {
                          translateY: message.animationValue
                            ? message.animationValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50, 0],
                              })
                            : 0,
                        },
                        {
                          scale: message.animationValue
                            ? message.animationValue.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.8, 1],
                              })
                            : 1,
                        },
                      ],
                      opacity: message.animationValue || 1,
                      alignSelf: messageAlignSelf,
                    }}
                  >
                    <MessageBubble
                      text={message.text}
                      isSender={message.isSender}
                      hasReaction={message.hasReaction && isFirstInGroup(index)}
                      reactionType={message.reactionType}
                      isLastInGroup={isLastInGroup(index)}
                      _isFirstInGroup={isFirstInGroup(index)}
                    />
                  </Animated.View>
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
              );
            })}
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
    paddingTop: 40,
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
