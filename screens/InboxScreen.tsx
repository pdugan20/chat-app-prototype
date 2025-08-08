import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

declare const global: {
  resetAllChats?: boolean;
  pendingChatUpdate?: { id: string; [key: string]: unknown };
  forceInboxRefresh?: boolean;
  chatMessages?: { [chatId: string]: unknown[] };
};
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Colors, Spacing } from '../constants/theme';
import aiService from '../services/ai';
import ChatListItem from '../components/ChatListItem';
import { ChatItem, mockChats } from '../data/inbox';
import { useChatUpdates } from '../contexts/ChatUpdateContext';
import { resetEmitter } from '../utils/resetEmitter';

type InboxScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Inbox'
>;

interface InboxScreenProps {
  navigation: InboxScreenNavigationProp;
}

const InboxScreen: React.FC<InboxScreenProps> = ({ navigation }) => {
  const [chats, setChats] = useState<ChatItem[]>(mockChats);
  const { chatUpdates, resetAllUpdates } = useChatUpdates();
  const isResetting = useRef(false);
  const [forceOriginalData, setForceOriginalData] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  // Listen for reset events from the header button
  useEffect(() => {
    const handleReset = () => {
      isResetting.current = true;

      // Force original data mode
      setForceOriginalData(true);

      // Force complete reset with fresh mock data
      const freshMockChats = JSON.parse(JSON.stringify(mockChats));
      setChats(freshMockChats);

      // Force complete re-render with new key
      setResetKey(prev => prev + 1);

      global.resetAllChats = false;
      if (global.chatMessages) {
        global.chatMessages = {};
      }
      aiService.resetMentionedSongs();

      // Reset all context updates completely
      resetAllUpdates();

      // Keep resetting flags true for longer to prevent any context interference
      setTimeout(() => {
        isResetting.current = false;
        setForceOriginalData(false);
      }, 2000);
    };

    const subscription = resetEmitter.addListener(handleReset);

    return () => subscription.remove();
  }, [resetAllUpdates, forceOriginalData]);

  // Immediately apply context updates whenever chatUpdates changes
  useEffect(() => {
    if (isResetting.current || forceOriginalData) return; // Skip updates during reset or when forcing original data

    if (Object.keys(chatUpdates).length > 0) {
      setChats(prevChats => {
        let hasChanges = false;
        const updatedChats = prevChats.map(chat => {
          const contextUpdate = chatUpdates[chat.id];
          if (
            contextUpdate &&
            (chat.lastMessage !== contextUpdate.lastMessage ||
              chat.timestamp !== contextUpdate.timestamp)
          ) {
            hasChanges = true;
            return {
              ...chat,
              lastMessage: contextUpdate.lastMessage,
              timestamp: contextUpdate.timestamp,
              unread: contextUpdate.unread,
            };
          }
          return chat;
        });
        return hasChanges ? updatedChats : prevChats;
      });
    }
  }, [chatUpdates, forceOriginalData]);

  // Legacy update function - now only used for global state cleanup if needed
  const handleGlobalStateCleanup = React.useCallback(() => {
    // Check for pending chat updates from global state (fallback)
    const pendingUpdate = global.pendingChatUpdate;
    if (pendingUpdate) {
      console.log('Applying fallback update to chat:', pendingUpdate.id);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === pendingUpdate.id ? { ...chat, ...pendingUpdate } : chat
        )
      );
      global.pendingChatUpdate = undefined;
    }

    // Check for force refresh flag
    if (global.forceInboxRefresh) {
      global.forceInboxRefresh = false;
      setChats(prevChats => [...prevChats]);
    }
  }, []);

  // Remove unused focus tracking that was causing re-renders

  // Disabled polling since we now use context for immediate updates
  // useEffect(() => {
  //   if (!isFocused) return;
  //   const interval = setInterval(checkForUpdates, 500);
  //   return () => clearInterval(interval);
  // }, [checkForUpdates, isFocused]);

  // Handle cleanup when returning from chat screen
  useFocusEffect(
    React.useCallback(() => {
      // One-time cleanup of any pending global state
      handleGlobalStateCleanup();
    }, [handleGlobalStateCleanup])
  );
  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <ChatListItem
      item={item}
      onPress={() => {
        navigation.navigate('Chat', {
          contactName: item.name,
          contactAvatar: item.avatar?.toString(),
          chatId: item.id,
          isGroup: item.isGroup,
          groupAvatars: item.groupAvatars,
        });

        // Delay marking as read until after transition completes
        setTimeout(() => {
          setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === item.id ? { ...chat, unread: false } : chat
            )
          );
        }, 350); // Match the navigation animation duration
      }}
    />
  );

  return (
    <FlatList
      key={resetKey} // Force complete re-render on reset
      ref={flatListRef}
      data={chats}
      renderItem={renderChatItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      style={styles.listStyle}
      contentInsetAdjustmentBehavior='automatic'
      automaticallyAdjustContentInsets={true}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: Colors.chatItemBackground,
  },
  listStyle: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  separator: {
    backgroundColor: Colors.dividerGray,
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.separatorMarginLeft,
  },
});

export default InboxScreen;
