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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import MessageBubble from '../components/MessageBubble';
import InputBar from '../components/InputBar';
import NavigationBar from '../components/NavigationBar';
import TimestampHeader from '../components/TimestampHeader';
import TypingIndicator from '../components/TypingIndicator';
import { allConversations } from '../data/messages';
import { Colors, Typography, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import aiService from '../services/ai';

// Define Message interface first
interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  showDelivered?: boolean;
  animationValue?: Animated.Value;
  deliveredOpacity?: Animated.Value;
  deliveredScale?: Animated.Value;
}

// Global type declarations
interface GlobalState {
  resetAllChats?: boolean;
  pendingChatUpdate?: { id: string; [key: string]: unknown };
  forceInboxRefresh?: boolean;
  chatMessages?: { [chatId: string]: Message[] };
}

declare let global: GlobalState;

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
  const { contactName, chatId, contactAvatar, isGroup, groupAvatars } =
    route.params;
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [aiEnabled] = useState(true);
  const [inputBarHeight, setInputBarHeight] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const typingIndicatorOpacity = useRef(new Animated.Value(0)).current;
  // Initialize global chatMessages if it doesn't exist
  if (!global.chatMessages) {
    global.chatMessages = {};
  }

  // Load messages from global store or find matching conversation by contact name
  const [messages, setMessages] = useState<Message[]>(() => {
    if (global.chatMessages?.[chatId]) {
      return global.chatMessages[chatId];
    }

    // Find conversation by contact name or chatId
    const conversation = allConversations.find(
      conv =>
        conv.name === contactName || conv.id.toString() === chatId.toString()
    );
    return conversation ? conversation.messages : [];
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const chatSlideDown = useRef(new Animated.Value(0)).current;
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

  // Scroll to bottom when InputBar height changes
  useEffect(() => {
    if (inputBarHeight > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [inputBarHeight]);

  // Calculate appropriate padding for ScrollView based on InputBar and keyboard state
  const calculateScrollViewPadding = () => {
    const DEFAULT_PADDING = 48;
    const MIN_PADDING = 10;

    if (inputBarHeight === 0) return DEFAULT_PADDING;

    // Adjust padding based on keyboard visibility
    const adjustment = keyboardVisible ? 2 : -32;
    return Math.max(MIN_PADDING, inputBarHeight + adjustment);
  };

  // Scroll to bottom when ScrollView is fully laid out
  const handleScrollViewLayout = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  // Also handle content size changes to maintain scroll position
  const handleContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  // Store the latest message to update inbox on blur
  const lastSentMessageRef = useRef<{
    text: string;
    timestamp: string;
    isUserMessage: boolean;
  } | null>(null);

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
          lastMessage: lastSentMessageRef.current.isUserMessage
            ? `You: ${lastSentMessageRef.current.text}`
            : lastSentMessageRef.current.text,
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
    // Prevent multiple simultaneous sends
    if (isSending) return;

    console.log('handleSendMessage called with:', text, 'chatId:', chatId);
    setIsSending(true);

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
      deliveredOpacity: new Animated.Value(0),
      deliveredScale: new Animated.Value(0.7),
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
    lastSentMessageRef.current = {
      text,
      timestamp: currentTime,
      isUserMessage: true,
    };
    console.log('Stored in ref:', lastSentMessageRef.current);

    // Show "Delivered" after 2s delay with fade-in animation
    deliveredTimeoutRef.current = setTimeout(() => {
      // First, fade out any existing delivered messages and remove their showDelivered flag
      const hasExistingDelivered = messages.some(msg => msg.showDelivered);

      if (hasExistingDelivered) {
        // Create animation values for the new message
        const newDeliveredOpacity = new Animated.Value(0);
        const newDeliveredScale = new Animated.Value(0.7);

        // Find the old delivered message to fade it out
        const oldDeliveredMessage = messages.find(
          msg => msg.showDelivered && msg.id !== newMessage.id
        );

        // Start crossfade: fade out old and immediately swap in layout
        if (oldDeliveredMessage?.deliveredOpacity) {
          // Fade out old delivered message
          Animated.timing(oldDeliveredMessage.deliveredOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }

        // Immediately swap in layout: remove old, add new (no double space)
        setMessages(prev =>
          prev.map(msg => {
            if (msg.showDelivered && msg.id !== newMessage.id) {
              // Remove old message from layout immediately
              return { ...msg, showDelivered: false };
            } else if (msg.id === newMessage.id) {
              // Add new message with fresh animation values
              return {
                ...msg,
                showDelivered: true,
                deliveredOpacity: newDeliveredOpacity,
                deliveredScale: newDeliveredScale,
              };
            }
            return msg;
          })
        );

        // Animate the new message's individual delivered values
        Animated.parallel([
          Animated.timing(newDeliveredOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(newDeliveredScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Generate AI response after Delivered animation completes
          if (aiEnabled && aiService && aiService.isConfigured()) {
            generateAIResponse(text);
          }
          // Allow new sends after delivered animation completes
          setIsSending(false);
        });
      } else {
        // No existing delivered message, show new one directly
        // Create animation values for the new message
        const newDeliveredOpacity = new Animated.Value(0);
        const newDeliveredScale = new Animated.Value(0.7);

        setMessages(prev =>
          prev.map(msg =>
            msg.id === newMessage.id
              ? {
                  ...msg,
                  showDelivered: true,
                  deliveredOpacity: newDeliveredOpacity,
                  deliveredScale: newDeliveredScale,
                }
              : msg
          )
        );

        // Animate the new delivered message
        Animated.parallel([
          Animated.timing(newDeliveredOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(newDeliveredScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Generate AI response after Delivered animation completes
          if (aiEnabled && aiService && aiService.isConfigured()) {
            generateAIResponse(text);
          }
          // Allow new sends after delivered animation completes
          setIsSending(false);
        });
      }
    }, 2000);
  };

  const generateAIResponse = async (userMessage: string) => {
    if (!aiService) return;

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.isSender ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      // Add the new user message
      conversationHistory.push({
        role: 'user' as const,
        content: userMessage,
      });

      // Start API request immediately (but don't await yet)
      const responsePromise = aiService.generateResponse(
        conversationHistory,
        contactName
      );

      // Wait 1.5 seconds before showing typing indicator
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show typing indicator with fade in
      setShowTypingIndicator(true);
      Animated.timing(typingIndicatorOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Wait for response to complete
      const response = await responsePromise;

      // Keep typing indicator visible for at least 2 more seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create AI message without animation
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: response,
        isSender: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      // Animate typing indicator fade out and entire chat slide down simultaneously
      Animated.parallel([
        Animated.timing(typingIndicatorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(chatSlideDown, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait for pause while chat stays slid down, then add AI message and slide back up
        setTimeout(() => {
          // Remove typing indicator and add the message simultaneously to prevent layout jump
          setShowTypingIndicator(false);
          setMessages(prev => [...prev, aiMessage]);

          // Wait for message to render, then slide chat back up and scroll
          setTimeout(() => {
            // Animate chat sliding back up to normal position
            Animated.timing(chatSlideDown, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              // After slide-up completes, scroll to show the new message
              scrollViewRef.current?.scrollToEnd({ animated: true });
            });
          }, 50);
        }, 1000);
      });

      // Update lastSentMessageRef to show AI's response in inbox
      lastSentMessageRef.current = {
        text: response,
        timestamp: new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        isUserMessage: false,
      };
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      typingIndicatorOpacity.setValue(0);
      setShowTypingIndicator(false);
    }
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
          <Animated.ScrollView
            ref={scrollViewRef}
            style={[
              styles.messagesContainer,
              {
                transform: [
                  {
                    translateY: chatSlideDown.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 30], // Slide down just enough to hide typing indicator space
                    }),
                  },
                ],
              },
            ]}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: calculateScrollViewPadding() },
            ]}
            showsVerticalScrollIndicator={false}
            onLayout={handleScrollViewLayout}
            onContentSizeChange={handleContentSizeChange}
            keyboardShouldPersistTaps='handled'
            onScrollBeginDrag={Keyboard.dismiss}
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
                      opacity: message.animationValue || 1,
                      transform:
                        message.animationValue && message.isSender
                          ? [
                              {
                                translateY: message.animationValue.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [20, 0], // Only sender messages slide up
                                }),
                              },
                            ]
                          : [],
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
                          {
                            opacity:
                              message.deliveredOpacity || deliveredOpacity,
                          },
                        ]}
                      >
                        <Animated.Text
                          style={[
                            styles.deliveredText,
                            {
                              transform: [
                                {
                                  scaleX:
                                    message.deliveredScale || deliveredScale,
                                },
                              ],
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

            {showTypingIndicator && (
              <>
                {messages.length > 0 &&
                  messages[messages.length - 1].isSender && (
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
                      messages.length > 0 &&
                      !messages[messages.length - 1].isSender
                    }
                  />
                </Animated.View>
              </>
            )}
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Animated.View
        style={[styles.inputBarContainer, { bottom: keyboardHeight }]}
      >
        <InputBar
          onSendMessage={handleSendMessage}
          keyboardVisible={keyboardVisible}
          onHeightChange={setInputBarHeight}
          disabled={isSending}
        />
      </Animated.View>

      <View style={styles.navigationBarContainer}>
        <NavigationBar
          contactName={contactName}
          contactAvatar={contactAvatar ? parseInt(contactAvatar) : undefined}
          isGroup={isGroup}
          groupAvatars={groupAvatars}
          onBackPress={() => {
            Keyboard.dismiss();
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
    paddingBottom: 48,
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
