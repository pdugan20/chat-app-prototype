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
  const [inputBarHeight, setInputBarHeight] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
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
      scrollViewRef.current?.scrollToEnd({ animated: true });
    },
  });

  // Set delivered opacity for existing messages on mount
  useEffect(() => {
    const hasDeliveredMessages = messages.some(msg => msg.showDelivered);
    if (hasDeliveredMessages) {
      deliveredOpacity.setValue(1);
      deliveredScale.setValue(1);
    }
  }, [messages, deliveredOpacity, deliveredScale]);

  // Auto-scroll effects
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  useEffect(() => {
    if (inputBarHeight > 0) {
      // Delay scroll to allow keyboard animation to settle
      const delay = keyboardVisible ? 0 : 200;
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, delay);
    }
  }, [inputBarHeight, keyboardVisible]);

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

  // Calculate ScrollView padding
  const calculateScrollViewPadding = () => {
    const DEFAULT_PADDING = 48;
    const MIN_PADDING = 10;

    if (inputBarHeight === 0) return DEFAULT_PADDING;

    const adjustment = keyboardVisible ? 2 : -32;
    return Math.max(MIN_PADDING, inputBarHeight + adjustment);
  };

  // Handlers
  const handleScrollViewLayout = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  };

  const handleContentSizeChange = () => {
    scrollViewRef.current?.scrollToEnd({ animated: false });
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
                transform: getChatSlideTransform(chatSlideDown),
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
          >
            <MessageList
              messages={messages}
              deliveredOpacity={deliveredOpacity}
              deliveredScale={deliveredScale}
            />

            <TypingSection
              showTypingIndicator={showTypingIndicator}
              typingIndicatorOpacity={typingIndicatorOpacity}
              messages={messages}
            />
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
