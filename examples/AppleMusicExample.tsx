import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMessages } from '../hooks/useMessages';
import { Colors } from '../constants/theme';

/**
 * Example of how to add Apple Music messages to a chat
 * This demonstrates the scalable bubble system in action
 */

interface AppleMusicExampleProps {
  chatId: string;
  initialMessages: any[];
}

const AppleMusicExample: React.FC<AppleMusicExampleProps> = ({
  chatId,
  initialMessages,
}) => {
  const { addAppleMusicMessage } = useMessages(chatId, initialMessages);

  const handleSendAppleMusicMessage = () => {
    // Example Apple Music data - in a real app, this would come from Apple Music API
    addAppleMusicMessage(
      {
        songId: 'apple-music-123456',
        songTitle: 'Intergalactic',
        artistName: 'Beastie Boys',
        albumArtUrl: 'https://example.com/album-art.jpg',
        duration: 210, // 3:30 in seconds
      },
      true
    ); // true = sender message
  };

  const handleReceiveAppleMusicMessage = () => {
    // Example of receiving an Apple Music message
    addAppleMusicMessage(
      {
        songId: 'apple-music-789012',
        songTitle: 'Sabotage',
        artistName: 'Beastie Boys',
        albumArtUrl: 'https://example.com/sabotage-album-art.jpg',
        duration: 178, // 2:58 in seconds
      },
      false
    ); // false = recipient message
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSendAppleMusicMessage}
      >
        <Text style={styles.buttonText}>Send Apple Music</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleReceiveAppleMusicMessage}
      >
        <Text style={styles.buttonText}>Receive Apple Music</Text>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.systemBlue,
    borderRadius: 8,
    margin: 5,
    padding: 10,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '600',
  },
});

export default AppleMusicExample;

/**
 * ADDING NEW BUBBLE TYPES:
 *
 * 1. Add the new message type to MessageType in types/message.ts
 * 2. Create the message interface extending BaseMessage
 * 3. Create the bubble component (e.g., ImageBubble.tsx)
 * 4. Register it in config/bubbleRegistry.ts:
 *
 * registerBubbleType('image', ImageBubble, (message) => ({
 *   imageUrl: message.imageUrl,
 *   thumbnailUrl: message.thumbnailUrl,
 * }));
 *
 * 5. Create a utility function in messageUtils.ts:
 *
 * export const createImageMessage = (imageData, isSender) => {...}
 *
 * 6. Add a hook method in useMessages.ts:
 *
 * const addImageMessage = (imageData, isSender) => {...}
 *
 * That's it! The BubbleRenderer will automatically handle the new type.
 */
