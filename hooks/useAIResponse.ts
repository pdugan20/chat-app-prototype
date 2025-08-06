import { useState, useRef } from 'react';
import { Animated } from 'react-native';
import { Message, AppleMusicMessage } from '../types/message';
import aiService from '../services/ai';
import { appleMusicApi } from '../services/appleMusicApi';
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

      // Start structured API request immediately (but don't await yet)
      const responsePromise = aiService.generateStructuredResponse(
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

      // Wait for structured response to complete
      const structuredResponse = await responsePromise;

      // Keep typing indicator visible for minimum time
      await new Promise(resolve =>
        setTimeout(resolve, ANIMATION_DELAYS.AI_RESPONSE_MIN)
      );

      // Handle different response types
      if (structuredResponse.type === 'music' && structuredResponse.musicQuery) {
        // For music responses, pre-fetch music data then send messages
        const textMessage: Message = {
          ...createMessage(structuredResponse.content, false),
        };

        // Start crossfade animation for first message (text)
        createCrossfadeAnimation(typingIndicatorOpacity, chatSlideDown).start(
          () => {
            // Wait for pause while chat stays slid down, then add text message
            setTimeout(() => {
              // Remove typing indicator and add text message
              setShowTypingIndicator(false);
              onAddMessage(textMessage);

              // Pre-fetch Apple Music data for the music bubble
              const fetchMusicData = async () => {
                try {
                  console.log('🎵 Pre-fetching Apple Music data for:', structuredResponse.musicQuery);
                  
                  let songData = null;
                  if (appleMusicApi.isConfigured() && structuredResponse.musicQuery) {
                    if (structuredResponse.musicQuery.startsWith('search:')) {
                      const searchQuery = structuredResponse.musicQuery.replace('search:', '');
                      const searchResults = await appleMusicApi.searchSongs(searchQuery, 1);
                      songData = searchResults[0] || null;
                    } else {
                      songData = await appleMusicApi.getSong(structuredResponse.musicQuery);
                    }
                  }

                  // Create music message with pre-fetched data
                  let processedArtworkUrl = null;
                  if (songData && songData.attributes.artwork?.url) {
                    const originalUrl = songData.attributes.artwork.url
                      .replace('{w}', '100')
                      .replace('{h}', '100')
                      .replace('{f}', 'bb.jpg');
                    
                    processedArtworkUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=100&h=100&fit=cover&output=jpg`;
                    console.log('🖼️ Pre-loading artwork URL:', processedArtworkUrl);
                    
                    // Preload the image so it's cached when the bubble appears
                    try {
                      await fetch(processedArtworkUrl, { method: 'HEAD' });
                      console.log('🖼️ Image successfully preloaded');
                    } catch (error) {
                      console.log('🖼️ Image preload failed, but will still try to load normally:', error);
                    }
                  }

                  const musicMessage: AppleMusicMessage = {
                    ...createMessage('', false), // Empty text for music bubble
                    type: 'appleMusic',
                    songId: structuredResponse.musicQuery,
                    // Add pre-fetched data if available
                    ...(songData ? {
                      songTitle: songData.attributes.name,
                      artistName: songData.attributes.artistName,
                      albumArtUrl: processedArtworkUrl,
                      previewUrl: songData.attributes.previews[0]?.url || null,
                      duration: Math.floor(songData.attributes.durationInMillis / 1000),
                    } : {})
                  };

                  console.log('🎵 Music data fetched, showing bubble');
                  
                  // Add the music bubble with pre-fetched data
                  onAddMessage(musicMessage);

                  // Update inbox preview with song info
                  const inboxDisplayText = songData 
                    ? `Song: ${songData.attributes.name} - ${songData.attributes.artistName}`
                    : structuredResponse.content;
                  
                  onUpdateLastSentMessage(
                    inboxDisplayText,
                    new Date().toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    }),
                    false
                  );
                  
                  // Wait for music bubble to render, then slide chat back up
                  setTimeout(() => {
                    animateChatSlideUp(chatSlideDown).start(() => {
                      scrollToEnd();
                    });
                  }, ANIMATION_DELAYS.MESSAGE_RENDER);

                } catch (error) {
                  console.error('Failed to pre-fetch music data:', error);
                  
                  // Fallback: create music bubble without pre-fetched data
                  const musicMessage: AppleMusicMessage = {
                    ...createMessage('', false),
                    type: 'appleMusic',
                    songId: structuredResponse.musicQuery,
                  };
                  
                  onAddMessage(musicMessage);

                  // Update inbox preview for fallback case (no song data)
                  onUpdateLastSentMessage(
                    structuredResponse.content,
                    new Date().toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    }),
                    false
                  );
                  
                  setTimeout(() => {
                    animateChatSlideUp(chatSlideDown).start(() => {
                      scrollToEnd();
                    });
                  }, ANIMATION_DELAYS.MESSAGE_RENDER);
                }
              };

              // Wait for text message to render, then fetch music data
              setTimeout(() => {
                fetchMusicData();
              }, ANIMATION_DELAYS.MESSAGE_RENDER * 0.5);
            }, ANIMATION_DELAYS.CHAT_SLIDE_PAUSE);
          }
        );
      } else {
        // Create regular text message
        const aiMessage: Message = {
          ...createMessage(structuredResponse.content, false),
        };

        // Start crossfade animation
        createCrossfadeAnimation(typingIndicatorOpacity, chatSlideDown).start(
          () => {
            // Wait for pause while chat stays slid down, then add AI message
            setTimeout(() => {
              // Remove typing indicator and add message simultaneously
              setShowTypingIndicator(false);
              onAddMessage(aiMessage);

              // Update inbox preview for text messages
              onUpdateLastSentMessage(
                structuredResponse.content,
                new Date().toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                }),
                false
              );

              // Wait for message to render, then slide chat back up
              setTimeout(() => {
                animateChatSlideUp(chatSlideDown).start(() => {
                  scrollToEnd();
                });
              }, ANIMATION_DELAYS.MESSAGE_RENDER);
            }, ANIMATION_DELAYS.CHAT_SLIDE_PAUSE);
          }
        );
      }
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
