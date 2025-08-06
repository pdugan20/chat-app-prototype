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

        // Find and fade out old delivered message
        const oldDeliveredMessage = messages.find(
          msg => msg.showDelivered && msg.id !== messageId
        );

        if (oldDeliveredMessage?.deliveredOpacity) {
          animateDeliveredFadeOut(oldDeliveredMessage.deliveredOpacity).start();
        }

        // Immediately swap in layout: remove old, add new (no double space)
        setMessages(prev =>
          prev.map(msg => {
            if (msg.showDelivered && msg.id !== messageId) {
              // Remove old message from layout immediately
              return { ...msg, showDelivered: false };
            } else if (msg.id === messageId) {
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

        // Animate the new delivered indicator in
        animateDeliveredFadeIn(newDeliveredOpacity, newDeliveredScale).start(
          () => onComplete?.()
        );
      } else {
        // No existing delivered message, show new one directly
        const newDeliveredOpacity = new Animated.Value(0);
        const newDeliveredScale = new Animated.Value(0.7);

        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  showDelivered: true,
                  deliveredOpacity: newDeliveredOpacity,
                  deliveredScale: newDeliveredScale,
                }
              : msg
          )
        );

        animateDeliveredFadeIn(newDeliveredOpacity, newDeliveredScale).start(
          () => onComplete?.()
        );
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
