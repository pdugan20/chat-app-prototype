import { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated } from 'react-native';
import { Layout } from '../constants/theme';

interface UseKeyboardReturn {
  keyboardHeight: Animated.Value;
  keyboardVisible: boolean;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      event => {
        setKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: event.endCoordinates.height,
          duration: event.duration || Layout.keyboardAnimationDuration,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      event => {
        setKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: event.duration || Layout.keyboardAnimationDuration,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  return { keyboardHeight, keyboardVisible };
};
