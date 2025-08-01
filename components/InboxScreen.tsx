import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type InboxScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Inbox'
>;

interface InboxScreenProps {
  navigation: InboxScreenNavigationProp;
}

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  avatar?: any;
  isGroup?: boolean;
  groupAvatars?: any[];
}

const mockChats: ChatItem[] = [
  {
    id: '1',
    name: 'Ruth Acosta',
    lastMessage:
      "Just wanted to catch up and chat, it's been a while since we talked.",
    timestamp: '2:45 PM',
    unread: true,
    avatar: require('../assets/profile-photos/Ruth.png'),
  },
  {
    id: '2',
    name: 'Loraine & Gus',
    lastMessage:
      "Hey! Just checking if we're still good for coffee tomorrow at 2? That new place on Main St...",
    timestamp: '1:18 PM',
    unread: false,
    isGroup: true,
    groupAvatars: [
      require('../assets/profile-photos/Loraine.png'),
      require('../assets/profile-photo.png'),
    ],
  },
  {
    id: '3',
    name: 'Will Fleming',
    lastMessage: 'Guess what movie I just saw with Ryan last night',
    timestamp: '12:55 PM',
    unread: false,
    avatar: require('../assets/profile-photos/Will.png'),
  },
  {
    id: '4',
    name: 'Gus Kelly',
    lastMessage: 'You: Dude you are a real piece of work, haha',
    timestamp: '11:42 AM',
    unread: false,
    avatar: require('../assets/profile-photos/Gus.png'),
  },
  {
    id: '5',
    name: 'Rachelle & Will',
    lastMessage:
      "Just wanted to catch up and chat, it's been a while since we talked.",
    timestamp: '10:27 AM',
    unread: false,
    isGroup: true,
    groupAvatars: [
      require('../assets/profile-photos/Rachelle.png'),
      require('../assets/profile-photos/Will.png'),
    ],
  },
  {
    id: '6',
    name: 'Tina Hayes',
    lastMessage:
      "This is Tina from Dr. Miller's office confirming your dental appointment for Thursday at 9:1...",
    timestamp: '9:15 AM',
    unread: false,
    avatar: require('../assets/profile-photos/Tina.png'),
  },
  {
    id: '7',
    name: 'Arlie Conway',
    lastMessage: 'Can you even believe he said that?',
    timestamp: 'Yesterday',
    unread: false,
    avatar: require('../assets/profile-photos/Arlie.png'),
  },
  {
    id: '8',
    name: 'Amelia Boyer',
    lastMessage: 'Down to grab dinner next week? How does Wed or Thur sound?',
    timestamp: 'Yesterday',
    unread: false,
    avatar: require('../assets/profile-photos/Amelia.png'),
  },
  {
    id: '9',
    name: 'Loraine Turner',
    lastMessage: 'You: You are never gonna believe what I just saw outside',
    timestamp: 'Sunday',
    unread: false,
    avatar: require('../assets/profile-photos/Loraine.png'),
  },
  {
    id: '10',
    name: 'Hollis Lawson',
    lastMessage: 'Hey did I leave my phone in your car?',
    timestamp: 'Saturday',
    unread: false,
    avatar: require('../assets/profile-photos/Hollis.png'),
  },
  {
    id: '11',
    name: 'August James',
    lastMessage:
      "My last Flight Flight was delayed a bit but I'm finally here. Will grab my luggage and see y...",
    timestamp: 'Friday',
    unread: false,
    avatar: require('../assets/profile-photos/August.png'),
  },
  {
    id: '12',
    name: 'Rachelle Bowers',
    lastMessage: 'Dude you are never gonna guess who just texted me...',
    timestamp: 'Thursday',
    unread: true,
    avatar: require('../assets/profile-photos/Rachelle.png'),
  },
];

const InboxScreen: React.FC<InboxScreenProps> = ({ navigation }) => {
  const [chats, setChats] = useState<ChatItem[]>(mockChats);

  const flatListRef = useRef<FlatList>(null);

  // Header will load expanded naturally at the top

  // Handle when returning from chat screen
  useFocusEffect(
    React.useCallback(() => {
      // Check for reset all chats flag
      if ((global as any).resetAllChats) {
        console.log('Resetting all chats to original state');
        setChats(
          mockChats.map(chat => ({
            ...chat,
            unread: false,
            lastMessage: chat.lastMessage,
            timestamp: chat.timestamp,
          }))
        );
        (global as any).resetAllChats = false;
        return;
      }

      // Check for pending chat updates from global state
      const pendingUpdate = (global as any).pendingChatUpdate;
      console.log('Inbox focused, checking for updates:', pendingUpdate);

      if (pendingUpdate) {
        console.log('Applying update to chat:', pendingUpdate.id);
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === pendingUpdate.id ? { ...chat, ...pendingUpdate } : chat
          )
        );
        // Clear the global state to prevent repeated updates
        (global as any).pendingChatUpdate = null;
      }

      // Also check navigation params as fallback
      const route = navigation.getState().routes.find(r => r.name === 'Inbox');
      const params = route?.params as any;

      if (params?.updatedChat) {
        console.log('Found params update:', params.updatedChat);
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === params.updatedChat.id
              ? { ...chat, ...params.updatedChat }
              : chat
          )
        );
        // Clear the params to prevent repeated updates
        navigation.setParams({ updatedChat: undefined });
      }
    }, [navigation])
  );
  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <View style={styles.inboxRow}>
      <View style={styles.divider} />
      {item.unread && <View style={styles.unreadIndicator} />}
      <TouchableOpacity
        style={styles.messageContainer}
        onPress={() => {
          // Mark as read when navigating to chat
          setChats(prevChats =>
            prevChats.map(chat =>
              chat.id === item.id ? { ...chat, unread: false } : chat
            )
          );

          navigation.navigate('Chat', {
            contactName: item.name,
            contactAvatar: item.avatar,
            chatId: item.id,
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.inboxRowPhoto}>
          {item.isGroup ? (
            <View style={styles.groupAvatarContainer}>
              <View style={styles.groupBackground} />
              <View style={styles.groupAvatar1}>
                <Image
                  source={
                    item.groupAvatars?.[0] ||
                    require('../assets/profile-photo.png')
                  }
                  style={styles.groupAvatarImage1}
                  resizeMode='cover'
                />
              </View>
              <View style={styles.groupAvatar2}>
                <Image
                  source={
                    item.groupAvatars?.[1] ||
                    require('../assets/profile-photo.png')
                  }
                  style={styles.groupAvatarImage2}
                  resizeMode='cover'
                />
              </View>
            </View>
          ) : (
            <View style={styles.persona}>
              <View style={styles.avatar}>
                <Image
                  source={item.avatar || require('../assets/profile-photo.png')}
                  style={styles.avatarImage}
                  resizeMode='cover'
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.timeContainer}>
              <Text style={styles.time}>{item.timestamp}</Text>
              <SymbolView
                name='chevron.right'
                size={13}
                type='hierarchical'
                tintColor='#c9c9cb'
                weight='semibold'
                style={styles.chevron}
              />
            </View>
          </View>
          <Text style={styles.preview} numberOfLines={2}>
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
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
  listStyle: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  listContainer: {
    backgroundColor: '#fff',
  },
  inboxRow: {
    flexDirection: 'column',
    gap: 6,
    paddingBottom: 6,
    paddingLeft: 26,
    paddingRight: 0,
    paddingTop: 0,
    backgroundColor: '#fff',
    position: 'relative',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    backgroundColor: '#e9e9eb',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 8,
    top: 32.5,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#0078ff',
  },
  messageContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingLeft: 0,
    paddingRight: 17,
    paddingVertical: 0,
  },
  inboxRowPhoto: {
    borderRadius: 22.5,
    overflow: 'hidden',
    width: 45,
    height: 45,
  },
  persona: {
    width: 45,
    height: 45,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    minHeight: 1,
    minWidth: 1,
  },
  avatarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  groupAvatarContainer: {
    width: 45,
    height: 45,
    position: 'relative',
  },
  groupBackground: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f2f2f2',
  },
  groupAvatar1: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  groupAvatar2: {
    position: 'absolute',
    right: 7,
    bottom: 7,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  groupAvatarImage: {
    borderRadius: 12,
  },
  groupAvatarImage1: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  groupAvatarImage2: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  textContainer: {
    flex: 1,
    minHeight: 62,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 0,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: 0,
    minWidth: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 0,
  },
  name: {
    fontFamily: 'SF Pro',
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 22,
    letterSpacing: -0.6,
    maxWidth: 200,
    overflow: 'hidden',
    flexShrink: 0,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 110,
    paddingTop: 2,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    flexShrink: 0,
  },
  time: {
    fontFamily: 'SF Pro',
    fontSize: 15,
    fontWeight: '400',
    color: '#909093',
    lineHeight: 20,
    letterSpacing: -0.7,
    width: 90,
    textAlign: 'right',
    flexShrink: 0,
  },
  chevron: {
    width: 10,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  preview: {
    fontFamily: 'SF Pro',
    fontSize: 15,
    fontWeight: '400',
    color: '#909093',
    lineHeight: 20,
    letterSpacing: -0.4,
    width: '100%',
    overflow: 'hidden',
    flexShrink: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c8c7cc',
    marginLeft: 78,
  },
});

export default InboxScreen;
