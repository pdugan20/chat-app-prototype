import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { SymbolView } from 'expo-symbols';
import BubbleTail from './shared/BubbleTail';
import VinylPlayPauseButton from './shared/VinylPlayPauseButton';
import { Colors, Typography, Layout } from '../../constants/theme';
import { VinylRecordMessage } from '../../types/message';
import { useSongData } from '../../hooks/useSongData';
import { getDynamicStyles } from '../../utils/colorHelpers';

const { width: screenWidth } = Dimensions.get('window');
const VINYL_SIZE = 120;
const CENTER_HOLE_SIZE = 50;

interface VinylRecordBubbleProps {
  message: VinylRecordMessage;
}

const VinylRecordBubble: React.FC<VinylRecordBubbleProps> = ({ message }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const progressAnimatedValue = useRef(new Animated.Value(0)).current; // For PlayPauseButton
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const currentRotation = useRef(0);
  const scrubStartRotation = useRef(0);
  const scrubStartPosition = useRef(0);

  // Use the useSongData hook to fetch song data
  const { songData, isLoading } = useSongData({
    songId: message.songId,
    propSongTitle: message.songTitle,
    propArtistName: message.artistName,
    propAlbumArtUrl: message.albumArtUrl,
    propPreviewUrl: message.previewUrl,
    propDuration: message.duration,
  });

  // Determine which colors to use (from message props or fetched data)
  const artworkColors = message.colors || songData?.colors;
  // Enable dynamic colors by default (unless explicitly set to false)
  const shouldUseApiColors = !!(message.useDynamicColors !== false && artworkColors);

  // Get dynamic styles based on colors
  const dynamicStyles = getDynamicStyles(
    artworkColors,
    message.isSender,
    shouldUseApiColors
  );

  // Setup audio
  useEffect(() => {
    const setupAudio = async () => {
      if (!songData?.previewUrl) return;
      
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: songData.previewUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };

    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [songData]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      
      // Only update position and playing state if not scrubbing
      if (!isScrubbing) {
        setPosition(status.positionMillis || 0);
        
        // Update progress values
        if (status.durationMillis > 0) {
          const currentProgress = status.positionMillis / status.durationMillis;
          
          // When paused or just starting, set the progress to current position
          if (!status.isPlaying || status.positionMillis === 0) {
            progressValue.setValue(currentProgress);
            progressAnimatedValue.setValue(currentProgress);
          }
          // While playing, the animation in the useEffect will handle smooth updates
        }
        
        // Update playing state based on actual audio status
        if (status.isPlaying !== isPlaying) {
          setIsPlaying(status.isPlaying);
        }
        
        // Check if playback finished
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          progressValue.setValue(0); // Reset progress bar
          progressAnimatedValue.setValue(0); // Reset PlayPauseButton progress
        }
      }
    }
  };

  // Spinning and progress animations
  useEffect(() => {
    if (isPlaying && !isScrubbing) {
      // Create continuous rotation without resetting
      const startValue = currentRotation.current;
      
      // Vinyl records typically spin at 33 1/3 RPM
      // That's 33.33 rotations per minute = 0.555 rotations per second
      // So one rotation takes about 1.8 seconds
      const rotationDuration = 1800; // milliseconds per rotation
      const totalRotations = 100; // Enough for any song
      
      spinAnimation.current = Animated.timing(spinValue, {
        toValue: startValue + 360 * totalRotations,
        duration: rotationDuration * totalRotations,
        useNativeDriver: true,
        easing: (t) => t, // Linear easing for constant speed
      });
      
      spinAnimation.current.start();
      
      // Animate both progress bars smoothly
      if (duration > 0) {
        const remainingTime = duration - position;
        const currentProgress = position / duration;
        
        // For the disabled progress bar UI
        progressAnimation.current = Animated.timing(progressValue, {
          toValue: 1,
          duration: remainingTime,
          useNativeDriver: false,
          easing: (t) => t,
        });
        progressAnimation.current.start();
        
        // For the PlayPauseButton progress ring
        Animated.timing(progressAnimatedValue, {
          toValue: 1,
          duration: remainingTime,
          useNativeDriver: false,
          easing: (t) => t,
        }).start();
      }
    } else {
      // Stop animations if not playing OR if scrubbing
      if (spinAnimation.current) {
        spinAnimation.current.stop();
        // Store current rotation value when stopping
        spinValue.stopAnimation((value) => {
          currentRotation.current = value % 360; // Keep value within 0-360 range
        });
      }
      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }
      // Also stop the play button progress animation
      progressAnimatedValue.stopAnimation();
    }
  }, [isPlaying, isScrubbing, duration, position]);

  const handlePlayPause = async () => {
    console.log('🎵 Play/Pause button pressed');
    console.log('🎵 Sound exists:', !!sound);
    console.log('🎵 Currently playing:', isPlaying);
    
    if (!sound) {
      console.log('🎵 No sound object for play/pause');
      return;
    }
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        console.log('🎵 Paused via button');
        setIsPlaying(false);
        // Store the current progress value
        progressValue.stopAnimation();
        progressAnimatedValue.stopAnimation();
      } else {
        // If starting from beginning, reset progress
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          const currentProgress = status.positionMillis / (status.durationMillis || 1);
          progressValue.setValue(currentProgress);
          progressAnimatedValue.setValue(currentProgress);
        }
        await sound.playAsync();
        console.log('🎵 Started playing via button');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('🎵 Error in play/pause:', error);
    }
  };

  // Pan responder for scrubbing - responds to touches on the vinyl record
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        console.log('🎵 VINYL PRESSED IN!');
        console.log('🎵 Sound object exists:', !!sound);
        console.log('🎵 Was playing before:', isPlaying);
        
        setIsScrubbing(true);
        setWasPlayingBeforeScrub(isPlaying);
        scrubStartRotation.current = currentRotation.current;
        scrubStartPosition.current = position;
        
        if (sound && isPlaying) {
          console.log('🎵 Pausing audio now...');
          sound.pauseAsync().then(() => {
            console.log('🎵 Audio paused successfully!');
          });
          // Keep isPlaying true so the button still shows pause icon
        } else {
          console.log('🎵 Not pausing - sound:', !!sound, 'isPlaying:', isPlaying);
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Calculate rotation based on gesture
        const centerX = VINYL_SIZE / 2;
        const centerY = VINYL_SIZE / 2;
        
        const startAngle = Math.atan2(
          gestureState.y0 - centerY,
          gestureState.x0 - centerX
        );
        
        const currentAngle = Math.atan2(
          gestureState.y0 + gestureState.dy - centerY,
          gestureState.x0 + gestureState.dx - centerX
        );
        
        const rotation = (currentAngle - startAngle) * (180 / Math.PI);
        const newRotation = scrubStartRotation.current + rotation;
        
        spinValue.setValue(newRotation);
        currentRotation.current = newRotation;
        
        // Calculate new position based on rotation
        const totalRotations = newRotation / 360;
        const progress = (totalRotations / 10) % 1; // 10 rotations = full song
        const newPosition = Math.max(0, Math.min(duration, progress * duration));
        
        // Update position state for progress bar
        setPosition(newPosition);
        
        // Update progress value during scrubbing
        if (duration > 0) {
          progressValue.setValue(newPosition / duration);
          progressAnimatedValue.setValue(newPosition / duration);
        }
        
        if (sound) {
          sound.setPositionAsync(newPosition);
        }
      },
      
      onPanResponderRelease: () => {
        console.log('🎵 VINYL RELEASED!');
        setIsScrubbing(false);
        
        if (sound && wasPlayingBeforeScrub) {
          console.log('🎵 Resuming audio...');
          sound.playAsync();
          // Keep isPlaying true since we're resuming
        }
      },
      
      onPanResponderTerminate: () => {
        console.log('🎵 VINYL RELEASED (terminated)!');
        setIsScrubbing(false);
        
        if (sound && wasPlayingBeforeScrub) {
          console.log('🎵 Resuming audio...');
          sound.playAsync();
          // Keep isPlaying true since we're resuming
        }
      },
    })
  ).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend', // Allow values beyond the input range
  });

  if (isLoading || !songData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[
      styles.container, 
      message.isSender ? styles.containerSender : styles.containerRecipient
    ]}>
      <View style={styles.bubbleContainer}>
        <View
          style={[
            styles.backgroundGradient,
            { backgroundColor: dynamicStyles.bubbleBackground }
          ]}
        >
          {/* Vinyl Record */}
          <TouchableWithoutFeedback
            onPressIn={() => {
              console.log('🎵 VINYL PRESSED IN!');
              console.log('🎵 Sound object exists:', !!sound);
              console.log('🎵 Was playing before:', isPlaying);
              
              setIsScrubbing(true);
              setWasPlayingBeforeScrub(isPlaying);
              
              if (sound && isPlaying) {
                console.log('🎵 Pausing audio now...');
                sound.pauseAsync().then(() => {
                  console.log('🎵 Audio paused successfully!');
                });
                setIsPlaying(false);
              } else {
                console.log('🎵 Not pausing - sound:', !!sound, 'isPlaying:', isPlaying);
              }
            }}
            onPressOut={() => {
              console.log('🎵 VINYL RELEASED!');
              setIsScrubbing(false);
              
              if (sound && wasPlayingBeforeScrub) {
                console.log('🎵 Resuming audio...');
                sound.playAsync();
                setIsPlaying(true);
              }
            }}
          >
            <View style={styles.vinylContainer}>
              <Animated.View
                style={[
                  styles.vinyl,
                  { transform: [{ rotate: spin }] }
                ]}
              >
              {/* Record grooves */}
              <View style={styles.vinylGrooves}>
                {[...Array(6)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.groove,
                      {
                        width: VINYL_SIZE - (i * 15),
                        height: VINYL_SIZE - (i * 15),
                        borderRadius: (VINYL_SIZE - (i * 15)) / 2,
                      }
                    ]}
                  />
                ))}
              </View>
              
              {/* Album art center */}
              <View style={styles.albumArtContainer}>
                <Image
                  source={{ uri: songData.albumArt || '' }}
                  style={styles.albumArt}
                  contentFit="cover"
                />
              </View>
              
              {/* Center hole */}
              <View style={styles.centerHole} />
              
              {/* Highlight effect */}
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'transparent']}
                style={styles.vinylHighlight}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
            </View>
          </TouchableWithoutFeedback>
          
          {/* Bottom section with song info and controls */}
          <View style={styles.bottomSection}>
            {/* Left side: Song info */}
            <View style={styles.songInfo}>
              <Text style={[
                styles.songTitle,
                { color: dynamicStyles.titleColor }
              ]} numberOfLines={1}>
                {songData.title}
              </Text>
              <Text style={[
                styles.artistName,
                { color: dynamicStyles.artistColor }
              ]} numberOfLines={1}>
                {songData.artist}
              </Text>
              {/* Apple Music row */}
              <View style={styles.appleMusicRow}>
                <SymbolView
                  name='applelogo'
                  size={12}
                  type='hierarchical'
                  tintColor={dynamicStyles.iconColor}
                  style={styles.appleLogo}
                />
                <Text style={[
                  styles.musicText,
                  { color: dynamicStyles.labelColor }
                ]}>
                  Music
                </Text>
              </View>
            </View>
            
            {/* Right side: Play/Pause button */}
            <View onStartShouldSetResponder={() => true}>
              <VinylPlayPauseButton
                isPlaying={isPlaying}
                isScrubbing={isScrubbing}
                progress={progressAnimatedValue}
                onPress={handlePlayPause}
                isSender={message.isSender}
                size={30}
                hasEverBeenPlayed={position > 0 || isPlaying || wasPlayingBeforeScrub}
                backgroundStrokeColor={shouldUseApiColors ? dynamicStyles.backgroundStrokeColor : undefined}
              />
            </View>
          </View>
        </View>
        
        {/* Tail positioned absolutely */}
        <View style={message.isSender ? styles.senderTail : styles.recipientTail}>
          <BubbleTail
            color={dynamicStyles.bubbleBackground}
            size={16}
            flipped={!message.isSender}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 0.5,
    maxWidth: screenWidth * 0.75,
  },
  containerRecipient: {
    alignSelf: 'flex-start',
    marginRight: Layout.messageMarginSide,
  },
  containerSender: {
    alignSelf: 'flex-end',
    marginLeft: Layout.messageMarginSide,
  },
  bubbleContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  recipientTail: {
    bottom: 0.5,
    left: -5.5,
    position: 'absolute',
    zIndex: 10,
  },
  senderTail: {
    bottom: 0.5,
    position: 'absolute',
    right: -5.5,
    zIndex: 10,
  },
  backgroundGradient: {
    borderRadius: 20,
    padding: 12,
    minWidth: 200,
  },
  loadingContainer: {
    padding: 20,
    backgroundColor: Colors.bubbleGray,
    borderRadius: 20,
  },
  loadingText: {
    color: Colors.secondaryText,
    fontSize: Typography.messageSize,
  },
  vinylTouchArea: {
    width: VINYL_SIZE + 40,
    height: VINYL_SIZE + 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  vinylContainer: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    alignSelf: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  vinyl: {
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    borderRadius: VINYL_SIZE / 2,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  vinylGrooves: {
    position: 'absolute',
    width: VINYL_SIZE,
    height: VINYL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groove: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  albumArtContainer: {
    width: CENTER_HOLE_SIZE,
    height: CENTER_HOLE_SIZE,
    borderRadius: CENTER_HOLE_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  centerHole: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a0a0a',
  },
  vinylHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: VINYL_SIZE / 2,
  },
  appleMusicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleLogo: {
    marginRight: 2,
  },
  musicText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    fontSize: Typography.messageSize,
    fontWeight: '600',
    marginBottom: 2,
  },
  artistName: {
    fontSize: Typography.timestampSize,
    marginBottom: 4,
  },
});

export default VinylRecordBubble;