import { useState, useRef } from 'react';
import { Animated, Image } from 'react-native';
import { Message, AppleMusicMessage } from '../types/message';

import aiService from '../services/ai';
import { appleMusicApi } from '../services/appleMusicApi';
import { createMessage } from '../utils/messageUtils';
import { musicPreloader } from '../utils/musicPreloader';
import {
  animateTypingIndicatorIn,
  createCrossfadeAnimation,
  animateChatSlideUp,
  createMessageAnimationValues,
  animateAIMessageSlideUp,
  animateMusicBubbleSlideUp,
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
      if (
        structuredResponse.type === 'music' &&
        structuredResponse.musicQuery
      ) {
        // For music responses, pre-fetch music data then send messages
        const textAnimationValues = createMessageAnimationValues();
        const textMessage: Message = {
          ...createMessage(structuredResponse.content, false),
          ...textAnimationValues,
        };

        // Start crossfade animation for first message (text)
        createCrossfadeAnimation(typingIndicatorOpacity, chatSlideDown).start(
          () => {
            // Wait for pause while chat stays slid down, then add text message
            setTimeout(() => {
              // Remove typing indicator and add text message
              setShowTypingIndicator(false);
              onAddMessage(textMessage);

              // Start text message animation with smooth timing
              if (textAnimationValues.animationValue) {
                animateAIMessageSlideUp(
                  textAnimationValues.animationValue
                ).start();
              }

              // Slide chat back up immediately after text message appears
              setTimeout(() => {
                animateChatSlideUp(chatSlideDown).start();
              }, ANIMATION_DELAYS.MESSAGE_RENDER);

              // Pre-fetch Apple Music data for the music bubble
              const fetchMusicData = async () => {
                try {
                  console.log(
                    '🎵 Pre-fetching Apple Music data for:',
                    structuredResponse.musicQuery
                  );

                  let songData = null;
                  if (
                    appleMusicApi.isConfigured() &&
                    structuredResponse.musicQuery
                  ) {
                    if (structuredResponse.musicQuery.startsWith('search:')) {
                      const searchQuery = structuredResponse.musicQuery.replace(
                        'search:',
                        ''
                      );
                      const searchResults = await appleMusicApi.searchSongs(
                        searchQuery,
                        1
                      );
                      songData = searchResults[0] || null;
                    } else {
                      songData = await appleMusicApi.getSong(
                        structuredResponse.musicQuery
                      );
                    }
                  }

                  // Create music message with direct Apple Music artwork URL (same as Storybook)
                  let artworkUrl = null;
                  if (songData && songData.attributes.artwork?.url) {
                    artworkUrl = songData.attributes.artwork.url
                      .replace('{w}', '100')
                      .replace('{h}', '100')
                      .replace('{f}', 'bb.jpg');
                    console.log('🖼️ Using artwork URL:', artworkUrl);

                    // Preload the image to prevent layout jump
                    try {
                      console.log('🖼️ Preloading album art...');
                      await Image.prefetch(artworkUrl);
                      console.log('🖼️ Album art preloaded successfully');
                    } catch (error) {
                      console.log('🖼️ Failed to preload album art:', error);
                      // Continue anyway
                    }
                  }

                  // Extract dynamic colors if available
                  let colors;
                  if (songData?.attributes.artwork?.bgColor) {
                    colors = {
                      bgColor: songData.attributes.artwork.bgColor,
                      textColor1: songData.attributes.artwork.textColor1,
                      textColor2: songData.attributes.artwork.textColor2,
                      textColor3: songData.attributes.artwork.textColor3,
                      textColor4: songData.attributes.artwork.textColor4,
                    };
                    console.log(
                      `🎨 Including dynamic colors in AI music message for ${songData.attributes.name}`
                    );
                  }

                  const musicAnimationValues = createMessageAnimationValues();

                  const musicMessage: AppleMusicMessage = {
                    ...createMessage('', false), // Empty text for music bubble
                    type: 'appleMusic',
                    songId: structuredResponse.musicQuery || '',
                    ...musicAnimationValues,
                    // Add pre-fetched data if available
                    ...(songData
                      ? {
                          songTitle: songData.attributes.name,
                          artistName: songData.attributes.artistName,
                          albumArtUrl: artworkUrl || undefined,
                          previewUrl:
                            songData.attributes.previews[0]?.url || undefined,
                          duration: Math.floor(
                            songData.attributes.durationInMillis / 1000
                          ),
                          appleMusicId: songData.id, // Add Apple Music song ID for deep linking
                          playParams: songData.attributes.playParams, // Add play parameters
                          colors, // Include dynamic colors
                        }
                      : {}),
                  };

                  // Add music bubble to chat flow
                  onAddMessage(musicMessage);

                  // Start music bubble animation with smooth timing
                  if (musicAnimationValues.animationValue) {
                    animateMusicBubbleSlideUp(
                      musicAnimationValues.animationValue
                    ).start();
                  }

                  // Scroll to end immediately
                  scrollToEnd();

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
                } catch (error) {
                  console.error('Failed to pre-fetch music data:', error);

                  // Fallback: check if we have preloaded data from app startup
                  const preloadedData = musicPreloader.getPreloadedData(
                    structuredResponse.musicQuery || ''
                  );

                  const fallbackMusicAnimationValues =
                    createMessageAnimationValues();

                  const musicMessage: AppleMusicMessage = {
                    ...createMessage('', false),
                    type: 'appleMusic',
                    songId: structuredResponse.musicQuery || '',
                    ...fallbackMusicAnimationValues,
                    ...(preloadedData
                      ? {
                          songTitle: preloadedData.songTitle,
                          artistName: preloadedData.artistName,
                          albumArtUrl: preloadedData.albumArtUrl,
                          previewUrl: preloadedData.previewUrl || undefined,
                          duration: preloadedData.duration,
                          colors: preloadedData.colors,
                        }
                      : {}),
                  };

                  // Add fallback music bubble to chat flow
                  onAddMessage(musicMessage);

                  // Start fallback music bubble animation with smooth timing
                  setTimeout(() => {
                    if (fallbackMusicAnimationValues.animationValue) {
                      animateMusicBubbleSlideUp(
                        fallbackMusicAnimationValues.animationValue
                      ).start();
                    }
                    scrollToEnd();
                  }, 100);

                  // Update inbox preview for fallback case (no song data)
                  onUpdateLastSentMessage(
                    structuredResponse.content,
                    new Date().toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    }),
                    false
                  );

                  // Reset chat slide position
                  animateChatSlideUp(chatSlideDown).start();
                }
              };

              // Wait for text message to render, then fetch music data
              setTimeout(() => {
                fetchMusicData();
              }, 1000); // 1.5s pause between text and music bubble
            }, ANIMATION_DELAYS.CHAT_SLIDE_PAUSE);
          }
        );
      } else {
        // Create regular text message with animation values
        const aiAnimationValues = createMessageAnimationValues();
        const aiMessage: Message = {
          ...createMessage(structuredResponse.content, false),
          ...aiAnimationValues,
        };

        // Start crossfade animation
        createCrossfadeAnimation(typingIndicatorOpacity, chatSlideDown).start(
          () => {
            // Wait for pause while chat stays slid down, then add AI message
            setTimeout(() => {
              // Remove typing indicator and add message simultaneously
              setShowTypingIndicator(false);
              onAddMessage(aiMessage);

              // Start AI message animation first, then slide chat up after it completes
              if (aiAnimationValues.animationValue) {
                animateAIMessageSlideUp(aiAnimationValues.animationValue).start(() => {
                  // Only slide chat up after AI message animation completes
                  animateChatSlideUp(chatSlideDown).start(() => {
                    scrollToEnd();
                  });
                });
              } else {
                // Fallback if no animation value
                animateChatSlideUp(chatSlideDown).start(() => {
                  scrollToEnd();
                });
              }

              // Update inbox preview for text messages
              onUpdateLastSentMessage(
                structuredResponse.content,
                new Date().toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                }),
                false
              );
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
