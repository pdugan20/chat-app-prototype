import React, { useState, useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useTheme } from '@storybook/react-native-theming';

interface PositionControlWrapperProps {
  children: React.ReactNode;
}

const ANIMATION_DURATION = 250;
const { height: screenHeight } = Dimensions.get('window');
// Calculate offset to move component near top of screen (accounting for headers)
const TOP_OFFSET = screenHeight * 0.38;

// Icon for push to top (arrow up)
const ArrowUpIcon = ({ color = '#73828C' }) => (
  <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
    <Path
      d='M7 2.5l-4 4a.5.5 0 00.708.707L6.5 4.414V11.5a.5.5 0 001 0V4.414l2.793 2.793a.5.5 0 10.707-.707l-4-4z'
      fill={color}
    />
  </Svg>
);

// Icon for recenter (arrow down)
const ArrowDownIcon = ({ color = '#73828C' }) => (
  <Svg width={14} height={14} viewBox='0 0 14 14' fill='none'>
    <Path
      d='M7 11.5l4-4a.5.5 0 00-.708-.707L7.5 9.586V2.5a.5.5 0 00-1 0v7.086L3.707 6.793a.5.5 0 10-.707.707l4 4z'
      fill={color}
    />
  </Svg>
);

// Store position state globally to persist across re-renders
let globalIsAtTop = false;

export const PositionControlWrapper: React.FC<PositionControlWrapperProps> = ({
  children,
}) => {
  const [isAtTop, setIsAtTop] = useState(globalIsAtTop);
  const translateY = useRef(
    new Animated.Value(globalIsAtTop ? -TOP_OFFSET : 0)
  ).current;
  const innerTranslateY = useRef(
    new Animated.Value(globalIsAtTop ? 60 : 0)
  ).current;
  const theme = useTheme();

  const handlePositionToggle = () => {
    const newIsAtTop = !isAtTop;
    const toValue = newIsAtTop ? -TOP_OFFSET : 0;
    const innerToValue = newIsAtTop ? 60 : 0;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      Animated.timing(innerTranslateY, {
        toValue: innerToValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    ]).start();

    setIsAtTop(newIsAtTop);
    globalIsAtTop = newIsAtTop; // Update global state
  };

  // Dynamic button style matching Storybook's fullscreen button
  // Fullscreen button is 28px wide (14px icon + 8px padding), positioned at right: 16px
  // So we position at right: 49px (16 + 28 + 5 spacing)
  const buttonStyle = {
    position: 'absolute' as const,
    bottom: 16,
    right: 49, // 16 (fullscreen right) + 28 (fullscreen width) + 5 (spacing)
    backgroundColor: theme.background.content,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.appBorderColor,
  };

  return (
    <>
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ translateY: innerTranslateY }],
          }}
        >
          {children}
        </Animated.View>
      </Animated.View>

      <TouchableOpacity
        style={buttonStyle}
        onPress={handlePositionToggle}
        activeOpacity={0.8}
      >
        {isAtTop ? (
          <ArrowDownIcon color={theme.color.mediumdark} />
        ) : (
          <ArrowUpIcon color={theme.color.mediumdark} />
        )}
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
});

export default PositionControlWrapper;
