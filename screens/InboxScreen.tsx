import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';

declare const global: {
  resetAllChats?: boolean;
  pendingChatUpdate?: { id: string; [key: string]: unknown };
  forceInboxRefresh?: boolean;
  chatMessages?: { [chatId: string]: unknown[] };
};
declare const setInterval: (callback: () => void, delay: number) => number;
declare const clearInterval: (id: number) => void;
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Colors, Spacing } from '../constants/theme';
import ChatListItem from '../components/ChatListItem';
import { ChatItem, mockChats } from '../data/inbox';

type InboxScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Inbox'
>;

interface InboxScreenProps {
  navigation: InboxScreenNavigationProp;
}

const InboxScreen: React.FC<InboxScreenProps> = ({ navigation }) => {
  const [chats, setChats] = useState<ChatItem[]>(mockChats);

  const flatListRef = useRef<FlatList>(null);

  // Function to check and apply updates
  const checkForUpdates = React.useCallback(() => {
    // Check for reset all chats flag
    if (global.resetAllChats) {
      console.log('Resetting all chats to original state');
      setChats([...mockChats]); // Reset to original mockChats with original unread states
      global.resetAllChats = false;
      // Also clear all stored chat messages
      if (global.chatMessages) {
        global.chatMessages = {};
      }
      return;
    }

    // Check for pending chat updates from global state
    const pendingUpdate = global.pendingChatUpdate;
    if (pendingUpdate) {
      console.log('Applying update to chat:', pendingUpdate.id);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === pendingUpdate.id ? { ...chat, ...pendingUpdate } : chat
        )
      );
      // Clear the global state to prevent repeated updates
      global.pendingChatUpdate = undefined;
    }

    // Check for force refresh flag
    if (global.forceInboxRefresh) {
      global.forceInboxRefresh = false;
      // Just force a re-render by updating state
      setChats(prevChats => [...prevChats]);
    }
  }, []);

  // Poll for updates every 500ms, but only when screen is focused
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () =>
      setIsFocused(true)
    );
    const unsubscribeBlur = navigation.addListener('blur', () =>
      setIsFocused(false)
    );

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(checkForUpdates, 500);
    return () => clearInterval(interval);
  }, [checkForUpdates, isFocused]);

  // Handle when returning from chat screen - now just triggers the check
  useFocusEffect(
    React.useCallback(() => {
      checkForUpdates();
    }, [checkForUpdates])
  );
  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <ChatListItem
      item={item}
      onPress={() => {
        navigation.navigate('Chat', {
          contactName: item.name,
          contactAvatar: item.avatar?.toString(),
          chatId: item.id,
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
