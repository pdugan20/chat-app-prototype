import { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated } from 'react-native';
import { animateKeyboard } from '../utils/messageAnimations';

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
        animateKeyboard(keyboardHeight, event.endCoordinates.height).start();
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      _event => {
        setKeyboardVisible(false);
        animateKeyboard(keyboardHeight, 0).start();
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [keyboardHeight]);

  return { keyboardHeight, keyboardVisible };
};
