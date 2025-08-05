import { Animated } from 'react-native';

export interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  showDelivered?: boolean;
  animationValue?: Animated.Value;
  deliveredOpacity?: Animated.Value;
  deliveredScale?: Animated.Value;
}

export type ReactionType = 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';

export interface MessageBubbleProps {
  text: string;
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: ReactionType;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
}

export interface NavigationBarProps {
  contactName: string;
  onBackPress?: () => void;
  onContactPress?: () => void;
}

export interface InputBarProps {
  onSendMessage: (message: string) => void;
  keyboardVisible?: boolean;
}
