import { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated, Platform } from 'react-native';

interface UseKeyboardReturn {
  keyboardHeight: Animated.Value;
  keyboardVisible: boolean;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    const keyboardShowListener = Keyboard.addListener(
      showEvent,
      event => {
        setKeyboardVisible(true);
        Animated.spring(keyboardHeight, {
          toValue: event.endCoordinates.height,
          useNativeDriver: false,
          velocity: 12,
          tension: 150,
          friction: 20,
        }).start();
      }
    );

    const keyboardHideListener = Keyboard.addListener(
      hideEvent,
      event => {
        setKeyboardVisible(false);
        Animated.spring(keyboardHeight, {
          toValue: 0,
          useNativeDriver: false,
          velocity: 12,
          tension: 150,
          friction: 20,
        }).start();
      }
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [keyboardHeight]);

  return { keyboardHeight, keyboardVisible };
};
