import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Message } from '../types/message';
import { createMessage, createAppleMusicMessage } from '../utils/messageUtils';
import {
  createMessageAnimationValues,
  animateMessageSlideUp,
  animateDeliveredFadeIn,
  animateDeliveredFadeOut,
  ANIMATION_DELAYS,
} from '../utils/messageAnimations';

interface GlobalState {
  chatMessages?: { [chatId: string]: Message[] };
}

declare let global: GlobalState;

export const useMessages = (chatId: string, initialMessages: Message[]) => {
  // Initialize global chatMessages if it doesn't exist
  if (!global.chatMessages) {
    global.chatMessages = {};
  }

  const [messages, setMessages] = useState<Message[]>(() => {
    return global.chatMessages?.[chatId] || initialMessages;
  });

  const deliveredTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Save messages to global store whenever they change
  useEffect(() => {
    if (global.chatMessages) {
      global.chatMessages[chatId] = messages;
    }
  }, [messages, chatId]);

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (deliveredTimeoutRef.current) {
        clearTimeout(deliveredTimeoutRef.current);
      }
    };
  }, []);

  const addMessage = (text: string, isSender: boolean = true) => {
    const animationValues = createMessageAnimationValues();
    const newMessage: Message = {
      ...createMessage(text, isSender),
      ...animationValues,
    };

    setMessages(prev => [...prev, newMessage]);

    // Animate message slide up for sender messages
    if (isSender && animationValues.animationValue) {
      animateMessageSlideUp(animationValues.animationValue).start();
    }

    return newMessage;
  };

  const addAppleMusicMessage = (
    songData: {
      songId: string;
      songTitle: string;
      artistName: string;
      albumArtUrl: string;
      duration?: number;
    },
    isSender: boolean = true
  ) => {
    const animationValues = createMessageAnimationValues();
    const newMessage: Message = {
      ...createAppleMusicMessage(songData, isSender),
      ...animationValues,
    };

    setMessages(prev => [...prev, newMessage]);

    // Animate message slide up for sender messages
    if (isSender && animationValues.animationValue) {
      animateMessageSlideUp(animationValues.animationValue).start();
    }

    return newMessage;
  };

  const showDeliveredIndicator = (
    messageId: string,
    onComplete?: () => void
  ) => {
    deliveredTimeoutRef.current = setTimeout(() => {
      const hasExistingDelivered = messages.some(msg => msg.showDelivered);

      if (hasExistingDelivered) {
        // Handle crossfade between old and new delivered indicators
        const newDeliveredOpacity = new Animated.Value(0);
        const newDeliveredScale = new Animated.Value(0.7);

        // Find old delivered message and store its animation reference
        const oldDeliveredMessage = messages.find(
          msg => msg.showDelivered && msg.id !== messageId
        );
        const oldDeliveredOpacity = oldDeliveredMessage?.deliveredOpacity;
        const oldDeliveredScale = oldDeliveredMessage?.deliveredScale;
        const oldMessageId = oldDeliveredMessage?.id;
        

        // First, add the new delivered indicator
        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === messageId) {
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

        // Start both animations at the exact same time
        setTimeout(() => {
          // Start old delivered fade-out
          if (oldDeliveredOpacity && oldDeliveredScale) {
            animateDeliveredFadeOut(oldDeliveredOpacity, oldDeliveredScale).start();
          }

          // Start new delivered fade-in simultaneously  
          animateDeliveredFadeIn(newDeliveredOpacity, newDeliveredScale).start(() => {
            onComplete?.();
          });

          // Remove old delivered from DOM at exactly 150ms (halfway through animations)
          setTimeout(() => {
            if (oldMessageId) {
              setMessages(prev =>
                prev.map(msg => {
                  if (msg.id === oldMessageId && msg.showDelivered) {
                    return { ...msg, showDelivered: false };
                  }
                  return msg;
                })
              );
            }
          }, 150); // Remove halfway through the 300ms animations
        }, 200);
      } else {
        // No existing delivered message, use same animation approach
        const newDeliveredOpacity = new Animated.Value(0);
        const newDeliveredScale = new Animated.Value(0.7);

        // Add the new delivered indicator
        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === messageId) {
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

        // Animate in the new delivered indicator
        setTimeout(() => {
          animateDeliveredFadeIn(newDeliveredOpacity, newDeliveredScale).start(
            () => onComplete?.()
          );
        }, 200);
      }
    }, ANIMATION_DELAYS.DELIVERED_SHOW);
  };

  return {
    messages,
    setMessages,
    addMessage,
    addAppleMusicMessage,
    showDeliveredIndicator,
  };
};
