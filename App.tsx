import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SymbolView } from 'expo-symbols';
import { RootStackParamList } from './types/navigation';
import { Colors } from './constants/theme';
import InboxScreen from './screens/InboxScreen';
import ChatScreen from './screens/ChatScreen';
import { musicPreloader } from './utils/musicPreloader';
import { allConversations } from './data/messages';
import { ChatUpdateProvider } from './contexts/ChatUpdateContext';
import { resetEmitter } from './utils/resetEmitter';
import { useAppStore, useChatStore } from './stores';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { resetApp, setPendingChatUpdate } = useAppStore();
  const { clearAllChats } = useChatStore();

  // Preload music data for all conversations on app startup
  useEffect(() => {
    const preloadAllMusic = async () => {
      console.log('🎵 Starting app-wide music preloading...');

      try {
        const preloadPromises = allConversations.map(async conversation => {
          console.log(
            `🎵 Preloading music for conversation: ${conversation.name}`
          );
          const preloadedMessages =
            await musicPreloader.preloadConversationMusic(
              conversation.messages
            );

          // Update the conversation data in place if music was preloaded
          if (preloadedMessages !== conversation.messages) {
            conversation.messages = preloadedMessages;
            console.log(
              `🎵 Updated ${conversation.name} with preloaded music data`
            );
          }
        });

        await Promise.all(preloadPromises);

        const stats = musicPreloader.getCacheStats();
        console.log(
          `🎵 App-wide music preloading completed! Cached ${stats.size} songs:`,
          stats.songIds
        );
      } catch (error) {
        console.error('🎵 App-wide music preloading failed:', error);
      }
    };

    preloadAllMusic();
  }, []);

  const handleEllipsisPress = () => {
    Alert.alert(
      'Reset prototype?',
      'This will reset all conversations to their original state and clear any new messages.',
      [
        {
          text: 'Reset chats',
          style: 'destructive',
          onPress: () => {
            // Clear the pending update and reset chats
            setPendingChatUpdate(undefined);
            clearAllChats();
            resetApp();
            // Clear music preloader cache
            musicPreloader.clearCache();
            // Emit reset event
            resetEmitter.emit();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  return (
    <>
      <StatusBar style='dark' />
      <ChatUpdateProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName='Inbox'
            screenOptions={{
              presentation: 'card',
              animation: 'default',
              animationDuration: 350,
            }}
          >
            <Stack.Screen
              name='Inbox'
              component={InboxScreen}
              options={{
                headerLargeTitle: true,
                headerLargeTitleShadowVisible: false,
                headerBlurEffect: 'light',
                headerSearchBarOptions: {
                  placeholder: 'Search',
                  placement: 'stacked',
                  hideWhenScrolling: true,
                },
                headerLeft: () => (
                  <TouchableOpacity style={headerStyles.editButton}>
                    <Text style={headerStyles.editText}>Edit</Text>
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <View style={headerStyles.rightButtonContainer}>
                    <TouchableOpacity
                      style={headerStyles.iconButton}
                      onPress={handleEllipsisPress}
                      activeOpacity={0.6}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <SymbolView
                        name='ellipsis.circle'
                        size={24}
                        type='monochrome'
                        tintColor={Colors.systemBlue}
                        weight='regular'
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={headerStyles.composeButton}>
                      <SymbolView
                        name='square.and.pencil'
                        size={24}
                        type='monochrome'
                        tintColor={Colors.systemBlue}
                        weight='regular'
                      />
                    </TouchableOpacity>
                  </View>
                ),
                title: 'Messages',
              }}
            />
            <Stack.Screen
              name='Chat'
              component={ChatScreen}
              options={{
                headerShown: true,
                headerTransparent: true,
                headerTitle: '',
                headerBackTitle: '',
                headerStyle: {
                  backgroundColor: 'transparent',
                },
                headerLeft: () => (
                  <TouchableOpacity style={headerStyles.hiddenEditButton}>
                    <Text style={headerStyles.hiddenEditText}>Edit</Text>
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <View style={headerStyles.hiddenRightButtonContainer}>
                    <TouchableOpacity style={headerStyles.iconButton}>
                      <SymbolView
                        name='ellipsis.circle'
                        size={24}
                        type='monochrome'
                        tintColor={Colors.systemBlue}
                        weight='regular'
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={headerStyles.hiddenComposeButton}>
                      <SymbolView
                        name='square.and.pencil'
                        size={24}
                        type='monochrome'
                        tintColor={Colors.systemBlue}
                        weight='regular'
                      />
                    </TouchableOpacity>
                  </View>
                ),
                animationTypeForReplace: 'push',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ChatUpdateProvider>
    </>
  );
}

const headerStyles = StyleSheet.create({
  composeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  editButton: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    marginTop: -2,
  },
  editText: {
    color: Colors.systemBlue,
    fontSize: 17,
  },
  hiddenComposeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
  hiddenEditButton: {
    alignItems: 'center',
    height: 26,
    justifyContent: 'center',
    marginTop: -2,
    opacity: 0,
  },
  hiddenEditText: {
    color: Colors.systemBlue,
    fontSize: 17,
  },
  hiddenRightButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    height: 26,
    marginTop: -4,
    opacity: 0,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    height: 26,
    marginTop: -4,
  },
});
