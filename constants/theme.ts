// Theme constants for iMessage app
export const Colors = {
  // Primary Colors
  systemBlue: '#007AFF',

  // Text Colors
  white: '#ffffff',
  black: '#000000',
  textSecondary: '#8E8E93',
  placeholder: '#c9c9cb',
  inputIcon: '#909093',
  micIcon: '#a2a1a3',

  // Background Colors
  messageBubbleGray: '#e9e9eb',
  messageBubbleBlue: '#007AFF',
  inputBackground: 'rgba(255, 255, 255, 0.9)',
  blurBackground: 'rgba(255, 255, 255, 0.75)',
  addButtonBackground: '#E9E9EB',
  screenBackground: '#ffffff',

  // Border Colors
  border: '#e9e9eb',
  inputBorder: '#e9e9eb',
  reactionBorder: '#ffffff',
} as const;

export const Typography = {
  fontFamily: 'SF Pro',

  // Font Sizes
  message: 16,
  timestamp: 13,
  contactName: 11,
  input: 17,
  delivered: 12,
  reactionEmoji: 14,

  // Font Weights
  regular: '400' as const,
  medium: '500' as const,
  bold: 'bold' as const,

  // Line Heights
  messageLineHeight: 20,
  timestampLineHeight: 14,
  inputLineHeight: 20,
} as const;

export const Spacing = {
  // Padding
  messagePadding: 12,
  messagePaddingVertical: 7,
  containerPadding: 16,
  inputPadding: 12,
  inputPaddingVertical: 8,

  // Margins
  messageMargin: 1,
  groupSpacing: 8,
  timestampMargin: 16,
  deliveredMarginTop: 2,

  // Specific measurements
  inputHeight: 38,
  addButtonSize: 34,
  profileImageSize: 50,
  reactionSize: 34,
  iconSize: 22,
  smallIconSize: 16,
  micIconContainerSize: 16,
  micIconContainerRight: 12,
  reactionContainerHeight: 43,
  reactionContainerWidth: 35,
  reactionTailHeight: 30,
  reactionTailWidth: 30,
  tailDotLargeSize: 10,
  tailDotSmallSize: 5,

  // Border radius
  messageBorderRadius: 16,
  inputBorderRadius: 80,
  addButtonBorderRadius: 17,
  profileBorderRadius: 25,
  reactionBorderRadius: 17,
  tailDotBorderRadius: 100,
} as const;

export const Layout = {
  // Keyboard
  keyboardAnimationDuration: 250,
  deliveredDelay: 1500,

  // Message constraints
  maxMessageWidth: '75%',
  messageMarginSide: '0%',

  // Navigation
  navigationHeight: 44,
  navigationPaddingTop: 75,
  navigationPaddingBottom: 16,
  navigationButtonSize: 44,

  // Input
  inputPaddingBottom: 34, // Space for home indicator
  inputPaddingBottomKeyboard: 8, // When keyboard is visible
} as const;
