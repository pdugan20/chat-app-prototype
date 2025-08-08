import { useEffect, useRef, useState } from 'react';
import { Keyboard, Animated, Platform } from 'react-native';
import { animateKeyboard } from '../utils/messageAnimations';

interface UseKeyboardReturn {
  keyboardHeight: Animated.Value;
  keyboardVisible: boolean;
}

export const useKeyboard = (): UseKeyboardReturn => {
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, event => {
      setKeyboardVisible(true);
      animateKeyboard(keyboardHeight, event.endCoordinates.height).start();
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      animateKeyboard(keyboardHeight, 0).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [keyboardHeight]);

  return { keyboardHeight, keyboardVisible };
};
