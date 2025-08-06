import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle } from 'react-native-svg';
import { SymbolView } from 'expo-symbols';
import { Audio } from 'expo-av';
import MessageTail from '../MessageTail';
import { Colors, Typography, Spacing, Layout } from '../../constants/theme';
import {
  appleMusicApi,
  mockAppleMusicData,
} from '../../services/appleMusicApi';

interface AppleMusicBubbleProps {
  songId: string;
  songTitle?: string;
  artistName?: string;
  albumArtUrl?: string;
  previewUrl?: string;
  duration?: number; // in seconds
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  isLastInGroup?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AppleMusicBubble: React.FC<AppleMusicBubbleProps> = ({
  songId,
  songTitle: propSongTitle,
  artistName: propArtistName,
  albumArtUrl: propAlbumArtUrl,
  previewUrl: propPreviewUrl,
  duration: propDuration,
  isSender,
  hasReaction = false,
  reactionType = 'heart',
  isLastInGroup = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [songData, setSongData] = useState<{
    title: string;
    artist: string;
    albumArt: string | number | null; // string for URI, number for local require(), null for placeholder
    previewUrl: string | null;
    duration: number;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageOpacity = useRef(new Animated.Value(0)).current;

  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Load song data on mount
  useEffect(() => {
    const loadSongData = async () => {
      // If we have all props, use them directly
      if (propSongTitle && propArtistName && propAlbumArtUrl) {
        console.log('🎵 AppleMusicBubble using pre-fetched props:');
        console.log('🎵 Title:', propSongTitle);
        console.log('🎵 Artist:', propArtistName);
        console.log('🖼️ Album Art URL from props:', propAlbumArtUrl);
        console.log('🎵 Preview URL from props:', propPreviewUrl);

        setSongData({
          title: propSongTitle,
          artist: propArtistName,
          albumArt: propAlbumArtUrl, // This should be the pre-processed weserv URL
          previewUrl: propPreviewUrl || null, // Use provided preview URL
          duration: propDuration || 30,
        });

        // If we have a pre-fetched artwork URL, assume it's already loaded and show immediately
        if (propAlbumArtUrl) {
          setImageLoaded(true);
          imageOpacity.setValue(1); // Start fully visible since it should be preloaded
        } else {
          setImageLoaded(false);
          imageOpacity.setValue(0);
        }
        return;
      } else {
        // Reset image state when loading new song from API
        setImageLoaded(false);
        imageOpacity.setValue(0);
      }

      // Otherwise, try to fetch from Apple Music API
      setIsLoading(true);
      try {
        if (appleMusicApi.isConfigured()) {
          let song;

          // Check if songId is a search query
          if (songId.startsWith('search:')) {
            const searchQuery = songId.replace('search:', '');
            const searchResults = await appleMusicApi.searchSongs(
              searchQuery,
              1
            );
            song = searchResults[0] || null;
          } else {
            // Direct song ID lookup
            song = await appleMusicApi.getSong(songId);
          }

          if (song) {
            let artworkUrl = null;
            if (song.attributes.artwork?.url) {
              artworkUrl = song.attributes.artwork.url
                .replace('{w}', '100')
                .replace('{h}', '100')
                .replace('{f}', 'bb.jpg');

              console.log('🖼️ Processed artwork URL:', artworkUrl);
            }

            setSongData({
              title: song.attributes.name,
              artist: song.attributes.artistName,
              albumArt: artworkUrl,
              previewUrl: song.attributes.previews[0]?.url || null,
              duration: song.attributes.durationInMillis / 1000,
            });
          }
        } else {
          // Use mock data for development (no local asset for testing)
          const mockSong = mockAppleMusicData;
          setSongData({
            title: mockSong.attributes.name,
            artist: mockSong.attributes.artistName,
            albumArt: null, // No local asset for testing
            previewUrl: mockSong.attributes.previews[0]?.url || null,
            duration: mockSong.attributes.durationInMillis / 1000,
          });
        }
      } catch (error) {
        console.error('Error loading song data:', error);
        // Fallback to props or default values
        setSongData({
          title: propSongTitle || 'Unknown Song',
          artist: propArtistName || 'Unknown Artist',
          albumArt: propAlbumArtUrl || '',
          previewUrl: null,
          duration: propDuration || 30,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSongData();
  }, [
    songId,
    propSongTitle,
    propArtistName,
    propAlbumArtUrl,
    propPreviewUrl,
    propDuration,
  ]);

  // Handle audio playback
  useEffect(() => {
    if (isPlaying && songData?.previewUrl) {
      const playAudio = async () => {
        try {
          // Set audio mode for playback
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });

          // Create and play sound
          const { sound } = await Audio.Sound.createAsync(
            { uri: songData.previewUrl },
            { shouldPlay: true, isLooping: false }
          );

          soundRef.current = sound;

          // Start progress animation (30 seconds for preview)
          const previewDuration = 30000; // 30 seconds
          animationRef.current = Animated.timing(progress, {
            toValue: 1,
            duration: previewDuration,
            useNativeDriver: true,
          });

          animationRef.current.start(({ finished }) => {
            if (finished) {
              setIsPlaying(false);
              progress.setValue(0);
            }
          });

          // Listen for playback status
          sound.setOnPlaybackStatusUpdate(status => {
            if ('didJustFinish' in status && status.didJustFinish) {
              setIsPlaying(false);
              progress.setValue(0);
            }
          });
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
          progress.setValue(0);
        }
      };

      playAudio();
    } else if (!isPlaying) {
      // Stop audio and animation
      soundRef.current?.stopAsync();
      soundRef.current?.unloadAsync();
      soundRef.current = null;
      animationRef.current?.stop();
    }

    return () => {
      soundRef.current?.stopAsync();
      soundRef.current?.unloadAsync();
      animationRef.current?.stop();
    };
  }, [isPlaying, songData?.previewUrl, progress]);

  const handlePlayPause = () => {
    if (isLoading) return;

    // Only allow play if we have a preview URL or if we're just showing the animation
    if (!isPlaying && songData?.previewUrl === null) {
      // No preview available, just show animation
      const animationDuration = 30000; // 30 seconds
      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      });

      animationRef.current.start(({ finished }) => {
        if (finished) {
          setIsPlaying(false);
          progress.setValue(0);
        }
      });
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const circumference = 2 * Math.PI * 13; // radius is 13 (30px diameter - 2px stroke)
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.recipientContainer,
        hasReaction && styles.containerWithReaction,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender ? styles.senderBubble : styles.recipientBubble,
        ]}
      >
        <View style={styles.content}>
          <View style={styles.albumArtContainer}>
            {songData?.albumArt ? (
              <>
                <Animated.View
                  style={[styles.albumArt, { opacity: imageOpacity }]}
                >
                  <Image
                    source={songData.albumArt} // Use the URL as-is since it might already be processed
                    style={styles.albumArtImage}
                    contentFit='cover'
                    onError={error => {
                      console.log(
                        '🖼️ Weserv proxied album art failed to load. Error:',
                        error
                      );
                      setImageLoaded(false);
                      imageOpacity.setValue(0);
                      setSongData(prev =>
                        prev ? { ...prev, albumArt: null } : null
                      );
                    }}
                    onLoad={() => {
                      console.log(
                        '🖼️ Weserv proxied album art loaded successfully!'
                      );
                      if (!imageLoaded) {
                        setImageLoaded(true);
                        Animated.timing(imageOpacity, {
                          toValue: 1,
                          duration: 300,
                          useNativeDriver: true,
                        }).start();
                      }
                    }}
                  />
                </Animated.View>
                {!imageLoaded && (
                  <View
                    style={[
                      styles.albumArt,
                      styles.albumArtPlaceholder,
                      styles.loadingPlaceholder,
                    ]}
                  >
                    <SymbolView
                      name='music.note'
                      size={24}
                      type='hierarchical'
                      tintColor={Colors.textSecondary}
                    />
                  </View>
                )}
              </>
            ) : (
              <View style={[styles.albumArt, styles.albumArtPlaceholder]}>
                <SymbolView
                  name='music.note'
                  size={24}
                  type='hierarchical'
                  tintColor={Colors.textSecondary}
                />
              </View>
            )}
          </View>

          <View style={styles.songInfo}>
            <Text
              style={[
                styles.songTitle,
                isSender ? styles.senderText : styles.recipientText,
              ]}
              numberOfLines={1}
            >
              {isLoading ? 'Loading...' : songData?.title || 'Unknown Song'}
            </Text>
            <Text
              style={[
                styles.artistName,
                isSender ? styles.senderText : styles.recipientText,
              ]}
              numberOfLines={1}
            >
              {isLoading ? 'Loading...' : songData?.artist || 'Unknown Artist'}
            </Text>
            <View style={styles.appleMusicRow}>
              <SymbolView
                name='applelogo'
                size={11}
                type='hierarchical'
                tintColor={isSender ? Colors.white : Colors.black}
                style={styles.appleIcon}
              />
              <Text
                style={[
                  styles.musicText,
                  isSender ? styles.senderText : styles.recipientText,
                ]}
              >
                Music
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlayPause}
            activeOpacity={isLoading ? 1 : 0.7}
            disabled={isLoading}
          >
            <View style={styles.playButtonInner}>
              <Svg width='30' height='30' viewBox='0 0 30 30'>
                <Circle
                  cx='15'
                  cy='15'
                  r='13'
                  stroke={
                    isSender ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)'
                  }
                  strokeWidth='2'
                  fill='none'
                />
                <AnimatedCircle
                  cx='15'
                  cy='15'
                  r='13'
                  stroke={Colors.systemRed}
                  strokeWidth='2'
                  fill='none'
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform='rotate(-90 15 15)'
                />
              </Svg>
              <SymbolView
                name={
                  isLoading
                    ? 'ellipsis'
                    : isPlaying
                      ? 'pause.fill'
                      : 'play.fill'
                }
                size={13}
                type='hierarchical'
                tintColor={Colors.systemRed}
                style={styles.playIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {hasReaction && (
        <View
          style={[
            styles.reactionContainer,
            isSender ? styles.senderReaction : styles.recipientReaction,
          ]}
        >
          <View
            style={[
              styles.reactionBubble,
              isSender
                ? styles.senderReactionBubble
                : styles.recipientReactionBubble,
            ]}
          >
            <Text style={styles.reactionText}>
              {reactionType === 'heart'
                ? '❤️'
                : reactionType === 'thumbsUp'
                  ? '👍'
                  : reactionType === 'haha'
                    ? '😂'
                    : '‼️'}
            </Text>
          </View>
        </View>
      )}

      {isLastInGroup && (
        <View style={isSender ? styles.senderTail : styles.recipientTail}>
          <MessageTail
            color={isSender ? Colors.systemBlue : Colors.messageBubbleGray}
            size={16}
            flipped={!isSender}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  albumArt: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    height: 50,
    width: 50,
    marginRight: 11,
  },
  albumArtContainer: {
    position: 'relative',
  },
  albumArtImage: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  loadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  albumArtPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleIcon: {
    marginRight: 2,
  },
  appleMusicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  artistName: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.15,
    lineHeight: 16,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: Spacing.messageBorderRadius,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  container: {
    marginVertical: 0.5,
    maxWidth: Layout.maxMessageWidth,
    position: 'relative',
  },
  containerWithReaction: {
    paddingTop: 20,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 50,
  },
  musicText: {
    fontFamily: Typography.fontFamily,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: -0.15,
    lineHeight: 16,
  },
  playButton: {
    height: 30,
    width: 30,
  },
  playButtonInner: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  playIcon: {
    fontSize: 13,
    position: 'absolute',
  },
  reactionBubble: {
    alignItems: 'center',
    borderColor: Colors.reactionBorder,
    borderRadius: Spacing.reactionBorderRadius,
    borderWidth: 1,
    height: Spacing.reactionSize,
    justifyContent: 'center',
    width: Spacing.reactionSize,
  },
  reactionContainer: {
    height: Spacing.reactionContainerHeight,
    position: 'absolute',
    top: -4,
    width: Spacing.reactionContainerWidth,
  },
  reactionText: {
    fontSize: Typography.reactionEmoji,
  },
  recipientBubble: {
    backgroundColor: Colors.messageBubbleGray,
  },
  recipientContainer: {
    alignSelf: 'flex-start',
    marginRight: Layout.messageMarginSide,
  },
  recipientReaction: {
    right: -16,
  },
  recipientReactionBubble: {
    backgroundColor: Colors.messageBubbleBlue,
  },
  recipientTail: {
    bottom: 0.5,
    left: -5.5,
    position: 'absolute',
    zIndex: 10,
  },
  recipientText: {
    color: Colors.black,
    opacity: 1,
  },
  senderBubble: {
    backgroundColor: Colors.messageBubbleBlue,
  },
  senderContainer: {
    alignSelf: 'flex-end',
    marginLeft: Layout.messageMarginSide,
  },
  senderReaction: {
    left: -16,
  },
  senderReactionBubble: {
    backgroundColor: Colors.messageBubbleGray,
  },
  senderTail: {
    bottom: 0.5,
    position: 'absolute',
    right: -5.5,
    zIndex: 10,
  },
  senderText: {
    color: Colors.white,
    opacity: 1,
  },
  songInfo: {
    paddingHorizontal: 4,
    justifyContent: 'space-between',
    minHeight: 44,
    maxWidth: 140,
    marginRight: 11,
  },
  songTitle: {
    fontFamily: Typography.fontFamily,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.15,
    lineHeight: 18,
    marginBottom: 2,
  },
});

export default AppleMusicBubble;
