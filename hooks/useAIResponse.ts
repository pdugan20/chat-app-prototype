import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { Message } from '../types/message';
import aiService from '../services/ai';
import { createMessage } from '../utils/messageUtils';
import {
  animateTypingIndicatorIn,
  createCrossfadeAnimation,
  animateChatSlideUp,
  ANIMATION_DELAYS,
} from '../utils/messageAnimations';

interface UseAIResponseProps {
  messages: Message[];
  contactName: string;
  aiEnabled: boolean;
  onAddMessage: (message: Message) => void;
  onUpdateLastSentMessage: (
    text: string,
    timestamp: string,
    isUserMessage: boolean
  ) => void;
  scrollToEnd: () => void;
}

export const useAIResponse = ({
  messages,
  contactName,
  aiEnabled,
  onAddMessage,
  onUpdateLastSentMessage,
  scrollToEnd,
}: UseAIResponseProps) => {
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const typingIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const chatSlideDown = useRef(new Animated.Value(0)).current;

  const generateAIResponse = async (userMessage: string) => {
    if (!aiService || !aiEnabled || !aiService.isConfigured()) return;

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

      // Wait before showing typing indicator
      await new Promise(resolve =>
        setTimeout(resolve, ANIMATION_DELAYS.AI_RESPONSE_START)
      );

      // Show typing indicator with fade in
      setShowTypingIndicator(true);
      animateTypingIndicatorIn(typingIndicatorOpacity).start();

      // Wait for response to complete
      const response = await responsePromise;

      // Keep typing indicator visible for minimum time
      await new Promise(resolve =>
        setTimeout(resolve, ANIMATION_DELAYS.AI_RESPONSE_MIN)
      );

      // Create AI message
      const aiMessage: Message = {
        ...createMessage(response, false),
      };

      // Start crossfade animation
      createCrossfadeAnimation(typingIndicatorOpacity, chatSlideDown).start(
        () => {
          // Wait for pause while chat stays slid down, then add AI message
          setTimeout(() => {
            // Remove typing indicator and add message simultaneously
            setShowTypingIndicator(false);
            onAddMessage(aiMessage);

            // Wait for message to render, then slide chat back up
            setTimeout(() => {
              animateChatSlideUp(chatSlideDown).start(() => {
                scrollToEnd();
              });
            }, ANIMATION_DELAYS.MESSAGE_RENDER);
          }, ANIMATION_DELAYS.CHAT_SLIDE_PAUSE);
        }
      );

      // Update last sent message for inbox
      onUpdateLastSentMessage(
        response,
        new Date().toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        false
      );
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      typingIndicatorOpacity.setValue(0);
      setShowTypingIndicator(false);
    }
  };

  return {
    showTypingIndicator,
    typingIndicatorOpacity,
    chatSlideDown,
    generateAIResponse,
  };
};
