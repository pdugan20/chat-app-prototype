import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import MessageTail from '../MessageTail';
import AlbumArt from '../AlbumArt';
import CircularPlayButton from '../CircularPlayButton';
import Reaction from '../Reaction';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useSongData } from '../../hooks/useSongData';
import { Colors, Typography, Spacing, Layout } from '../../constants/theme';
import { ReactionType } from '../../utils/reactions';

interface AppleMusicBubbleProps {
  songId: string;
  songTitle?: string;
  artistName?: string;
  albumArtUrl?: string;
  previewUrl?: string;
  duration?: number; // in seconds
  appleMusicId?: string; // Apple Music song ID for deep linking
  playParams?: {
    id: string;
    kind: string;
  };
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: ReactionType;
  isLastInGroup?: boolean;
  colors?: {
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
  };
  useDynamicColors?: boolean; // Enable dynamic colors from Apple Music API
  onPlay?: () => void;
  onPause?: () => void;
}

const AppleMusicBubble: React.FC<AppleMusicBubbleProps> = ({
  songId,
  songTitle: propSongTitle,
  artistName: propArtistName,
  albumArtUrl: propAlbumArtUrl,
  previewUrl: propPreviewUrl,
  duration: propDuration,
  appleMusicId: propAppleMusicId,
  playParams: propPlayParams,
  isSender,
  hasReaction = false,
  reactionType = 'heart',
  isLastInGroup = false,
  colors: propColors,
  useDynamicColors = false,
  onPlay,
  onPause,
}) => {
  // Use custom hooks for data fetching and audio playback
  const { songData, isLoading } = useSongData({
    songId,
    propSongTitle,
    propArtistName,
    propAlbumArtUrl,
    propPreviewUrl,
    propDuration,
  });

  const { isPlaying, progress, handlePlayPause, hasEverBeenPlayed } =
    useAudioPlayer({
      previewUrl: songData?.previewUrl || null,
      duration: songData?.duration || 30,
    });

  // Determine which colors to use
  const artworkColors = propColors || songData?.colors;
  const shouldUseApiColors = useDynamicColors && artworkColors;

  // Format colors from API (add # prefix if needed)
  const formatColor = (color?: string) => {
    if (!color) return undefined;
    return color.startsWith('#') ? color : `#${color}`;
  };

  // Check if background color is white or very close to white
  const isWhiteBackground = (bgColor?: string) => {
    if (!bgColor) return false;

    const color = formatColor(bgColor);
    if (!color) return false;

    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Check if all RGB values are close to white (above 240)
    return r > 240 && g > 240 && b > 240;
  };

  // Add transparency to color for softer appearance
  const addTransparency = (color?: string, opacity: number = 0.6) => {
    if (!color) return undefined;

    const formattedColor = formatColor(color);
    if (!formattedColor) return undefined;

    // Convert hex to RGB and add alpha
    const hex = formattedColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Handle opening Apple Music
  const handleOpenAppleMusic = async () => {
    try {
      let appleMusicUrl = '';

      // First try to use the message-level Apple Music ID (from AI response)
      if (propAppleMusicId) {
        appleMusicUrl = `https://music.apple.com/song/${propAppleMusicId}`;
        console.log('🎵 Using message Apple Music ID:', propAppleMusicId);
      } else if (propPlayParams?.id) {
        // Alternative: use message-level playParams ID
        appleMusicUrl = `https://music.apple.com/song/${propPlayParams.id}`;
        console.log('🎵 Using message playParams ID:', propPlayParams.id);
      } else if (songData?.id) {
        // Use songData Apple Music ID (from useSongData hook)
        appleMusicUrl = `https://music.apple.com/song/${songData.id}`;
        console.log('🎵 Using songData Apple Music ID:', songData.id);
      } else if (songData?.playParams?.id) {
        // Alternative: use songData playParams ID
        appleMusicUrl = `https://music.apple.com/song/${songData.playParams.id}`;
        console.log('🎵 Using songData playParams ID:', songData.playParams.id);
      } else if (songData?.title && songData?.artist) {
        // Fallback to search if no direct ID is available
        const query = encodeURIComponent(
          `${songData.title} ${songData.artist}`
        );
        appleMusicUrl = `https://music.apple.com/search?term=${query}`;
        console.log('🎵 Falling back to search URL');
      } else {
        console.log('🎵 No song data available to open in Apple Music');
        return;
      }

      if (appleMusicUrl) {
        console.log('🎵 Opening Apple Music:', appleMusicUrl);
        
        // Try multiple URL schemes for better compatibility
        const urlSchemes = [
          appleMusicUrl, // HTTPS URL (works in browser/web view)
          appleMusicUrl.replace('https://', 'music://'), // Apple Music app deep link
          appleMusicUrl.replace('https://music.apple.com', 'itmss://music.apple.com'), // iTunes Store scheme
        ];

        let opened = false;
        for (const url of urlSchemes) {
          try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              await Linking.openURL(url);
              opened = true;
              console.log('🎵 Successfully opened with URL:', url);
              break;
            }
          } catch (err) {
            console.log('🎵 Failed to open URL:', url, err);
          }
        }

        if (!opened) {
          console.log('🎵 Could not open Apple Music. This is common in simulators.');
          console.log('🎵 Try testing on a real device or ensure Safari can open the URL.');
          // In simulator, just log the URL that would be opened
          console.log('🎵 Would open:', appleMusicUrl);
        }
      }
    } catch (error) {
      console.error('🎵 Failed to open Apple Music:', error);
    }
  };

  // Define dynamic styles based on Apple Music colors
  const dynamicStyles = shouldUseApiColors
    ? {
        bubbleBackground: isWhiteBackground(artworkColors.bgColor)
          ? Colors.messageBubbleGray
          : formatColor(artworkColors.bgColor),
        titleColor: formatColor(artworkColors.textColor1), // Primary text for title
        artistColor: formatColor(artworkColors.textColor2), // Secondary text for artist
        labelColor: formatColor(artworkColors.textColor3), // Tertiary for "Music" label and Apple logo
        iconColor: formatColor(artworkColors.textColor3), // Using textColor3 for consistency
        backgroundStrokeColor: addTransparency(artworkColors.textColor4, 0.4), // Soften textColor4 with transparency
      }
    : {
        bubbleBackground: isSender
          ? Colors.systemBlue
          : Colors.messageBubbleGray,
        titleColor: isSender ? Colors.white : Colors.black,
        artistColor: isSender ? Colors.white : Colors.black,
        labelColor: isSender ? Colors.white : Colors.black,
        iconColor: isSender ? Colors.white : Colors.black,
        backgroundStrokeColor: undefined, // Use default colors
      };

  return (
    <View
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.recipientContainer,
        hasReaction && styles.containerWithReaction,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.bubble,
          isSender ? styles.senderBubble : styles.recipientBubble,
          { backgroundColor: dynamicStyles.bubbleBackground },
        ]}
        onPress={handleOpenAppleMusic}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.albumArt}>
            <AlbumArt
              url={
                typeof songData?.albumArt === 'string'
                  ? songData.albumArt
                  : null
              }
              size={50}
              borderRadius={4}
              isSender={isSender}
              isPreloaded={!!propAlbumArtUrl} // Mark as preloaded if we passed in albumArtUrl directly
              placeholderBackgroundColor={
                shouldUseApiColors
                  ? addTransparency(artworkColors.textColor4, 0.4)
                  : undefined
              } // Use textColor4 with 40% opacity as placeholder background when dynamic colors enabled
              onError={() => {
                // Note: In a more complex setup, you might want to expose
                // an error handler from the useSongData hook
                console.log('🖼️ Album art failed to load');
              }}
            />
          </View>

          <View style={styles.songInfo}>
            <Text
              style={[
                styles.songTitle,
                isSender ? styles.senderText : styles.recipientText,
                { color: dynamicStyles.titleColor },
              ]}
              numberOfLines={2}
            >
              {isLoading ? 'Loading...' : songData?.title || 'Unknown Song'}
            </Text>
            <Text
              style={[
                styles.artistName,
                isSender ? styles.senderText : styles.recipientText,
                { color: dynamicStyles.artistColor },
              ]}
              numberOfLines={1}
            >
              {isLoading ? 'Loading...' : songData?.artist || 'Unknown Artist'}
            </Text>
            <View style={styles.appleMusicRow}>
              <SymbolView
                name='applelogo'
                size={12}
                type='hierarchical'
                tintColor={dynamicStyles.iconColor}
                style={styles.appleIcon}
              />
              <Text
                style={[
                  styles.musicText,
                  isSender ? styles.senderText : styles.recipientText,
                  { color: dynamicStyles.labelColor },
                ]}
              >
                Music
              </Text>
            </View>
          </View>

          <View onStartShouldSetResponder={() => true}>
            <CircularPlayButton
              isPlaying={isPlaying}
              isLoading={isLoading}
              progress={progress}
              onPress={() => {
                if (!isLoading) {
                  handlePlayPause();
                  // Call action callbacks for Storybook
                  if (isPlaying) {
                    onPause?.();
                  } else {
                    onPlay?.();
                  }
                }
              }}
              isSender={isSender}
              size={30}
              disabled={isLoading}
              hasEverBeenPlayed={hasEverBeenPlayed}
              backgroundStrokeColor={dynamicStyles.backgroundStrokeColor}
            />
          </View>
        </View>
      </TouchableOpacity>

      {hasReaction && (
        <Reaction reactionType={reactionType} isSender={isSender} />
      )}

      {isLastInGroup && (
        <View style={isSender ? styles.senderTail : styles.recipientTail}>
          <MessageTail
            color={dynamicStyles.bubbleBackground}
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
    marginRight: 8,
  },
  appleIcon: {
    marginRight: 1,
  },
  appleMusicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
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
    paddingHorizontal: 11,
    paddingVertical: 9,
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
  recipientBubble: {
    backgroundColor: Colors.messageBubbleGray,
  },
  recipientContainer: {
    alignSelf: 'flex-start',
    marginRight: Layout.messageMarginSide,
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
    justifyContent: 'space-between',
    marginRight: 9,
    maxWidth: 140,
    minHeight: 44,
    paddingHorizontal: 4,
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
