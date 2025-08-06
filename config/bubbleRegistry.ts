import { ComponentType } from 'react';
import { MessageType } from '../types/message';
import MessageBubble from '../components/bubbles/MessageBubble';
import AppleMusicBubble from '../components/bubbles/AppleMusicBubble';

// Define the props that all bubble components should accept
export interface BaseBubbleProps {
  isSender: boolean;
  hasReaction?: boolean;
  reactionType?: 'heart' | 'thumbsUp' | 'haha' | 'doubleExclamation';
  isLastInGroup?: boolean;
}

// Registry type
type BubbleRegistry = {
  [K in MessageType]?: {
    component: ComponentType<any>;
    extractProps: (message: any) => any;
  };
};

// Bubble component registry
export const bubbleRegistry: BubbleRegistry = {
  text: {
    component: MessageBubble,
    extractProps: message => ({
      text: message.text,
      _isFirstInGroup: true, // This will be passed from BubbleRenderer
    }),
  },
  appleMusic: {
    component: AppleMusicBubble,
    extractProps: message => ({
      songId: message.songId,
      songTitle: message.songTitle,
      artistName: message.artistName,
      albumArtUrl: message.albumArtUrl,
      duration: message.duration,
    }),
  },
  // Future bubble types can be added here
  // image: {
  //   component: ImageBubble,
  //   extractProps: (message) => ({
  //     imageUrl: message.imageUrl,
  //     thumbnailUrl: message.thumbnailUrl,
  //     width: message.width,
  //     height: message.height,
  //   }),
  // },
};

// Function to register a new bubble type
export function registerBubbleType<T extends MessageType>(
  type: T,
  component: ComponentType<any>,
  extractProps: (message: any) => any
) {
  bubbleRegistry[type] = {
    component,
    extractProps,
  };
}

// Function to get bubble component and props
export function getBubbleComponent(type: MessageType) {
  return bubbleRegistry[type] || bubbleRegistry.text;
}
