import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Animated,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import InputBar from '../components/InputBar';
import NavigationBar from '../components/NavigationBar';
import MessageList from '../components/MessageList';
import TypingSection from '../components/TypingSection';
import { allConversations } from '../data/messages';
import { Colors, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { Message } from '../types/message';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMessages } from '../hooks/useMessages';
import { useAIResponse } from '../hooks/useAIResponse';
import { getChatSlideTransform } from '../utils/messageAnimations';

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

  // Hooks
  const { keyboardVisible, keyboardHeight } = useKeyboard();

  // Find initial messages
  const initialMessages = (() => {
    const conversation = allConversations.find(
      conv =>
        conv.name === contactName || conv.id.toString() === chatId.toString()
    );
    return conversation ? conversation.messages : [];
  })();

  const { messages, setMessages, addMessage, showDeliveredIndicator } =
    useMessages(chatId, initialMessages);

  // State
  const [aiEnabled] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const scrollViewRef = useRef<FlatList>(null);
  const deliveredOpacity = useRef(new Animated.Value(0)).current;
  const deliveredScale = useRef(new Animated.Value(0.7)).current;
  const lastSentMessageRef = useRef<{
    text: string;
    timestamp: string;
    isUserMessage: boolean;
  } | null>(null);

  // AI Response handling
  const {
    showTypingIndicator,
    typingIndicatorOpacity,
    chatSlideDown,
    generateAIResponse,
  } = useAIResponse({
    messages,
    contactName,
    aiEnabled,
    onAddMessage: message => {
      setMessages(prev => [...prev, message]);
    },
    onUpdateLastSentMessage: (text, timestamp, isUserMessage) => {
      lastSentMessageRef.current = { text, timestamp, isUserMessage };
    },
    scrollToEnd: () => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToOffset({
          offset: 999999,
          animated: true,
        });
      }
    },
  });

  // Set delivered indicator on last sender message when chat loads
  const hasSetInitialDelivered = useRef(false);
  useEffect(() => {
    if (hasSetInitialDelivered.current) return;

    // Find the last sender message
    const lastSenderMessageIndex = messages
      .map((msg, index) => ({ msg, index }))
      .reverse()
      .find(({ msg }) => msg.isSender)?.index;

    if (lastSenderMessageIndex !== undefined) {
      // Create individual animation values for initial delivered indicator
      const initialDeliveredOpacity = new Animated.Value(1);
      const initialDeliveredScale = new Animated.Value(1);

      setMessages(prev =>
        prev.map((msg, index) => {
          if (index === lastSenderMessageIndex) {
            return {
              ...msg,
              showDelivered: true,
              deliveredOpacity: initialDeliveredOpacity,
              deliveredScale: initialDeliveredScale,
            };
          } else if (msg.showDelivered) {
            // Remove delivered from other messages
            return {
              ...msg,
              showDelivered: false,
            };
          }
          return msg;
        })
      );

      // Set initial values for immediate visibility (no animation needed for existing delivered)
      initialDeliveredOpacity.setValue(1);
      initialDeliveredScale.setValue(1);
      hasSetInitialDelivered.current = true;
    }
  }, [deliveredOpacity, deliveredScale, messages, setMessages]); // Only run once on mount

  // Auto-scroll for new messages with smooth animation
  const previousLength = useRef(messages.length);
  useEffect(() => {
    if (messages.length > previousLength.current) {
      // Only scroll if messages increased (new message added)
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToOffset({
            offset: 999999,
            animated: true,
          });
        }
      }, 100);
    }
    previousLength.current = messages.length;
  }, [messages.length]);

  // Auto-scroll when typing indicator appears
  useEffect(() => {
    if (showTypingIndicator) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToOffset({
            offset: 999999,
            animated: true,
          });
        }
      }, 100);
    }
  }, [showTypingIndicator]);

  // Scroll to bottom when keyboard appears
  useEffect(() => {
    if (keyboardVisible) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToOffset({
            offset: 999999,
            animated: false, // Use false for immediate scroll
          });
        }
      }, 50); // Reduced delay to sync better with keyboard
    }
  }, [keyboardVisible]);

  // Navigation handling
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (lastSentMessageRef.current) {
        global.pendingChatUpdate = {
          id: chatId,
          lastMessage: lastSentMessageRef.current.isUserMessage
            ? `You: ${lastSentMessageRef.current.text}`
            : lastSentMessageRef.current.text,
          timestamp: lastSentMessageRef.current.timestamp,
          unread: false,
        };
        lastSentMessageRef.current = null;
      }
    });

    return unsubscribe;
  }, [navigation, chatId]);

  // Handlers
  const handleScrollViewLayout = () => {
    // Force scroll to absolute bottom with large offset
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToOffset({
          offset: 999999,
          animated: false,
        });
      }
    }, 100);
  };

  const handleContentSizeChange = () => {
    // Don't auto-scroll on content size change to avoid conflicts
  };

  const handleSendMessage = (text: string) => {
    if (isSending) return;

    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });

    // Add message with animations
    const newMessage = addMessage(text, true);

    // Store for inbox update
    lastSentMessageRef.current = {
      text,
      timestamp: currentTime,
      isUserMessage: true,
    };

    // Show delivered indicator
    showDeliveredIndicator(newMessage.id, () => {
      if (aiEnabled) {
        generateAIResponse(text);
      }
      setIsSending(false);
    });
  };

  return (
    <View style={styles.fullContainer}>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.messagesContainer,
            {
              transform: getChatSlideTransform(chatSlideDown),
            },
          ]}
        >
          <MessageList
            messages={messages}
            deliveredOpacity={deliveredOpacity}
            deliveredScale={deliveredScale}
            scrollViewRef={scrollViewRef}
            style={styles.messagesList}
            contentContainerStyle={[
              styles.messagesContent,
              keyboardVisible && styles.messagesContentKeyboardVisible,
            ]}
            onLayout={handleScrollViewLayout}
            onContentSizeChange={handleContentSizeChange}
            ListFooterComponent={
              <TypingSection
                showTypingIndicator={showTypingIndicator}
                typingIndicatorOpacity={typingIndicatorOpacity}
                messages={messages}
              />
            }
          />
        </Animated.View>
      </SafeAreaView>

      <Animated.View
        style={[styles.inputBarContainer, { bottom: keyboardHeight }]}
      >
        <InputBar
          onSendMessage={handleSendMessage}
          keyboardVisible={keyboardVisible}
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
  fullContainer: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
  },
  inputBarContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  messagesContainer: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 48, // Account for input bar height
    paddingLeft: Spacing.containerPadding,
    paddingRight: Spacing.inputPadding,
    paddingTop: 40,
  },
  messagesContentKeyboardVisible: {
    paddingBottom: 55, // Extra space for delivered indicator when keyboard is visible
  },
  messagesList: {
    backgroundColor: Colors.screenBackground,
    flex: 1,
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
