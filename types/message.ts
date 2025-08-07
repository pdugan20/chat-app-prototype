import { Animated } from 'react-native';

export type MessageType =
  | 'text'
  | 'appleMusic'
  | 'image'
  | 'video'
  | 'location'
  | 'contact';

export interface BaseMessage {
  id: string;
  isSender: boolean;
  timestamp: string;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  showDelivered?: boolean;
  animationValue?: Animated.Value;
  deliveredOpacity?: Animated.Value;
  deliveredScale?: Animated.Value;
  type: MessageType;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  text: string;
}

export interface AppleMusicMessage extends BaseMessage {
  type: 'appleMusic';
  text: string; // fallback text
  songId: string;
  songTitle?: string;
  artistName?: string;
  albumArtUrl?: string;
  previewUrl?: string;
  duration?: number;
  appleMusicId?: string; // Apple Music song ID for deep linking
  playParams?: {
    id: string;
    kind: string;
  };
  colors?: {
    bgColor?: string;
    textColor1?: string;
    textColor2?: string;
    textColor3?: string;
    textColor4?: string;
  };
}

export interface ImageMessage extends BaseMessage {
  type: 'image';
  text: string; // fallback text
  imageUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface VideoMessage extends BaseMessage {
  type: 'video';
  text: string; // fallback text
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}

export interface LocationMessage extends BaseMessage {
  type: 'location';
  text: string; // fallback text
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface ContactMessage extends BaseMessage {
  type: 'contact';
  text: string; // fallback text
  contactName: string;
  phoneNumber?: string;
  email?: string;
  avatarUrl?: string;
}

export type Message =
  | TextMessage
  | AppleMusicMessage
  | ImageMessage
  | VideoMessage
  | LocationMessage
  | ContactMessage;

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
