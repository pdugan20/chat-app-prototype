import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Colors, Typography, Spacing, Layout } from '../constants/theme';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  keyboardVisible?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  keyboardVisible = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <BlurView
      intensity={25}
      style={[
        styles.container,
        keyboardVisible && styles.containerKeyboardVisible,
      ]}
    >
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.addButton}>
          <SymbolView
            name='plus'
            size={16}
            type='hierarchical'
            tintColor={Colors.inputIcon}
            weight='regular'
          />
        </TouchableOpacity>

        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder='iMessage'
            placeholderTextColor={Colors.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline={false}
            maxLength={1000}
            returnKeyType='send'
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          {!message.trim() && (
            <View style={styles.micIconContainer}>
              <SymbolView
                name='mic.fill'
                size={16}
                type='hierarchical'
                tintColor={Colors.micIcon}
                weight='regular'
              />
            </View>
          )}
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.addButtonBackground,
    borderRadius: Spacing.addButtonBorderRadius,
    height: Spacing.addButtonSize,
    justifyContent: 'center',
    width: Spacing.addButtonSize,
  },
  container: {
    backgroundColor: Colors.blurBackground,
    paddingBottom: Layout.inputPaddingBottom,
    paddingLeft: Spacing.inputPadding,
    paddingRight: Spacing.containerPadding,
    paddingTop: 6,
  },
  containerKeyboardVisible: {
    paddingBottom: Layout.inputPaddingBottomKeyboard,
  },
  inputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  micIconContainer: {
    alignItems: 'center',
    height: Spacing.micIconContainerSize,
    justifyContent: 'center',
    position: 'absolute',
    right: Spacing.micIconContainerRight,
    width: Spacing.micIconContainerSize,
  },
  textInput: {
    color: Colors.black,
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.input,
    letterSpacing: -0.68,
    lineHeight: Typography.inputLineHeight,
    textAlignVertical: 'center',
  },
  textInputContainer: {
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorder,
    borderRadius: Spacing.inputBorderRadius,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.inputPadding,
    paddingVertical: Spacing.inputPaddingVertical,
    position: 'relative',
  },
});

export default InputBar;
