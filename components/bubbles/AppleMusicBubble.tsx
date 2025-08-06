import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SymbolView } from 'expo-symbols';
import MessageTail from '../MessageTail';
import { Colors, Typography, Spacing, Layout } from '../../constants/theme';

interface AppleMusicBubbleProps {
  songId: string;
  songTitle: string;
  artistName: string;
  albumArtUrl: string;
  duration?: number; // in seconds
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  isLastInGroup?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AppleMusicBubble: React.FC<AppleMusicBubbleProps> = ({
  songId: _songId,
  songTitle,
  artistName,
  albumArtUrl,
  duration = 180, // default 3 minutes
  isSender,
  hasReaction = false,
  reactionType = 'heart',
  isLastInGroup = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: true,
      });
      animationRef.current.start(({ finished }) => {
        if (finished) {
          setIsPlaying(false);
          progress.setValue(0);
        }
      });
    } else {
      animationRef.current?.stop();
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [isPlaying, duration, progress]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
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
          <Image source={{ uri: albumArtUrl }} style={styles.albumArt} />

          <View style={styles.songInfo}>
            <Text
              style={[
                styles.songTitle,
                isSender ? styles.senderText : styles.recipientText,
              ]}
              numberOfLines={1}
            >
              {songTitle}
            </Text>
            <Text
              style={[
                styles.artistName,
                isSender ? styles.senderText : styles.recipientText,
              ]}
              numberOfLines={1}
            >
              {artistName}
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
            activeOpacity={0.7}
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
                name={isPlaying ? 'pause.fill' : 'play.fill'}
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
