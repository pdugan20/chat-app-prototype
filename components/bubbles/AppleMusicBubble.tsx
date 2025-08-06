import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  isSender,
  hasReaction = false,
  reactionType = 'heart',
  isLastInGroup = false,
  colors: propColors,
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

  // Combine colors from props or songData for future use
  const artworkColors = propColors || songData?.colors;

  // Log colors for debugging (you can remove this later)
  if (artworkColors && Object.keys(artworkColors).length > 0) {
    console.log('🎨 Apple Music artwork colors:', artworkColors);
  }

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
                size={12}
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
          />
        </View>
      </View>

      {hasReaction && (
        <Reaction reactionType={reactionType} isSender={isSender} />
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
