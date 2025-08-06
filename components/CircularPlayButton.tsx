import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularPlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  progress: Animated.Value;
  onPress: () => void;
  isSender?: boolean;
  size?: number;
  disabled?: boolean;
  hasEverBeenPlayed?: boolean;
}

const CircularPlayButton: React.FC<CircularPlayButtonProps> = ({
  isPlaying,
  isLoading,
  progress,
  onPress,
  isSender = false,
  size = 30,
  disabled = false,
  hasEverBeenPlayed = false,
}) => {
  const radius = (size - 4) / 2; // Account for 2px stroke width
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const iconSize = Math.floor(size * 0.43); // Scale icon relative to button size

  // Determine visual state based on play status
  const isInitialState = !hasEverBeenPlayed;

  return (
    <TouchableOpacity
      style={[styles.playButton, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={[styles.playButtonInner, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle - filled red when never played */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={
              isInitialState
                ? Colors.systemRed
                : isSender
                  ? 'rgba(255, 255, 255, 0.5)'
                  : 'rgba(0, 0, 0, 0.2)'
            }
            strokeWidth='2'
            fill={isInitialState ? Colors.systemRed : 'none'}
          />
          {/* Progress circle - only show after first play */}
          {!isInitialState && (
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.systemRed}
              strokeWidth='2'
              fill='none'
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
        </Svg>
        <SymbolView
          name={isLoading ? 'ellipsis' : isPlaying ? 'pause.fill' : 'play.fill'}
          size={iconSize}
          type='hierarchical'
          tintColor={isInitialState ? Colors.white : Colors.systemRed}
          style={styles.playIcon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playButton: {
    // Size is set dynamically via props
  },
  playButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    // Size is set dynamically via props
  },
  playIcon: {
    position: 'absolute',
  },
});

export default CircularPlayButton;
