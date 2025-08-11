import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Colors, Typography, Spacing, Layout } from '../constants/theme';
import AppleMusicBubble from './bubbles/AppleMusicBubble';

interface InputBarProps {
  onSendMessage: (message: string, appleMusicUrl?: string) => void;
  keyboardVisible?: boolean;
  onHeightChange?: (height: number) => void;
  disabled?: boolean;
}

interface AppleMusicAttachment {
  url: string;
  songId: string;
}

const InputBar: React.FC<InputBarProps> = ({
  onSendMessage,
  keyboardVisible = false,
  onHeightChange,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [appleMusicAttachment, setAppleMusicAttachment] =
    useState<AppleMusicAttachment | null>(null);

  // Detect Apple Music URLs in the message
  useEffect(() => {
    const appleMusicRegex =
      /https:\/\/music\.apple\.com\/[^\s]+\/(\d+)(\?i=(\d+))?/;
    const match = message.match(appleMusicRegex);

    if (match && !appleMusicAttachment) {
      const albumId = match[1];
      const trackId = match[3] || match[1];

      // Remove the URL from the message
      const cleanedMessage = message.replace(match[0], '').trim();
      setMessage(cleanedMessage);

      // Add as attachment
      setAppleMusicAttachment({
        url: match[0],
        songId: trackId,
      });
    }
  }, [message, appleMusicAttachment]);

  const handleSend = () => {
    if ((message.trim() || appleMusicAttachment) && !disabled) {
      onSendMessage(message.trim(), appleMusicAttachment?.url);
      setMessage('');
      setAppleMusicAttachment(null);
    }
  };

  const removeAppleMusicAttachment = () => {
    setAppleMusicAttachment(null);
  };

  return (
    <BlurView
      intensity={25}
      style={[
        styles.container,
        keyboardVisible && styles.containerKeyboardVisible,
      ]}
      onLayout={event => {
        const { height } = event.nativeEvent.layout;
        onHeightChange?.(height);
      }}
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

        <View
          style={[
            styles.textInputContainer,
            appleMusicAttachment && styles.textInputContainerWithAttachment,
          ]}
        >
          {appleMusicAttachment && (
            <View style={styles.attachmentInInput}>
              <View style={styles.attachmentBubbleWrapper}>
                <AppleMusicBubble
                  songId={appleMusicAttachment.songId}
                  isSender={false}
                  isLastInGroup={false}
                  useDynamicColors={true}
                  maxWidth='85%'
                  playDisabled={true}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={removeAppleMusicAttachment}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View style={styles.removeButtonBackground}>
                    <SymbolView
                      name='xmark'
                      size={10}
                      type='hierarchical'
                      tintColor={Colors.white}
                      weight='bold'
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <TextInput
            style={[
              styles.textInput,
              appleMusicAttachment && styles.textInputWithAttachment,
            ]}
            placeholder={appleMusicAttachment ? '' : 'iMessage'}
            placeholderTextColor={Colors.placeholder}
            value={message}
            onChangeText={setMessage}
            multiline={true}
            maxLength={1000}
            returnKeyType='default'
            blurOnSubmit={false}
          />
          {!message.trim() && !appleMusicAttachment ? (
            <View style={styles.micIconContainer}>
              <SymbolView
                name='mic.fill'
                size={16}
                type='hierarchical'
                tintColor={Colors.micIcon}
                weight='regular'
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
              onPress={handleSend}
              activeOpacity={disabled ? 1 : 0.7}
              disabled={disabled}
            >
              <SymbolView
                name='arrow.up'
                size={16}
                type='hierarchical'
                tintColor={Colors.white}
                weight='bold'
              />
            </TouchableOpacity>
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
  attachmentBubbleWrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  attachmentInInput: {
    paddingBottom: 12,
    paddingTop: 4,
    alignItems: 'flex-start',
  },
  container: {
    backgroundColor: Colors.blurBackground,
    paddingBottom: Layout.inputPaddingBottom,
    paddingLeft: Spacing.inputPadding,
    paddingRight: Spacing.containerPadding,
    paddingTop: 6,
  },
  containerKeyboardVisible: {
    paddingBottom: Layout.inputPaddingBottomKeyboard + 2,
  },
  inputContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  micIconContainer: {
    alignItems: 'center',
    bottom: 10,
    height: Spacing.micIconContainerSize,
    justifyContent: 'center',
    marginTop: -Spacing.micIconContainerSize / 2,
    position: 'absolute',
    right: Spacing.micIconContainerRight,
    width: Spacing.micIconContainerSize,
  },
  removeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10,
  },
  removeButtonBackground: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderColor: Colors.white,
    borderRadius: 9,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: Colors.systemBlue,
    borderRadius: 13,
    bottom: 6,
    height: 26,
    justifyContent: 'center',
    marginTop: -13,
    position: 'absolute',
    right: 6,
    width: 26,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  textInput: {
    color: Colors.black,
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.input,
    letterSpacing: -0.68,
    lineHeight: Typography.inputLineHeight,
    minHeight: 20,
    paddingBottom: 0,
    paddingRight: 40,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  textInputContainer: {
    backgroundColor: Colors.inputBackground,
    borderColor: Colors.inputBorder,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'column',
    minHeight: Spacing.inputHeight,
    paddingHorizontal: Spacing.inputPadding,
    paddingVertical: Spacing.inputPaddingVertical,
    position: 'relative',
  },
  textInputContainerWithAttachment: {
    minHeight: 100,
    paddingTop: 6,
    paddingBottom: 4,
  },
  textInputWithAttachment: {
    paddingTop: 0,
    paddingBottom: 12,
    minHeight: 20,
  },
});

export default InputBar;
