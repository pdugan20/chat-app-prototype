import React from 'react';
import { TouchableOpacity, Text, View, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SymbolView } from 'expo-symbols';
import { RootStackParamList } from './types/navigation';
import InboxScreen from './components/InboxScreen';
import ChatScreen from './components/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const handleEllipsisPress = () => {
    Alert.alert(
      'Reset prototype?',
      'This will reset all conversations to their original state and clear any new messages.',
      [
        {
          text: 'Reset chats',
          style: 'destructive',
          onPress: () => {
            // Clear the global pending update and reset chats
            (global as any).pendingChatUpdate = null;
            (global as any).resetAllChats = true;
            console.log('Reset all chats triggered');
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
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 26,
                    marginTop: -2,
                  }}
                >
                  <Text style={{ color: '#0078ff', fontSize: 17 }}>Edit</Text>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    alignItems: 'center',
                    height: 26,
                    marginTop: -4,
                  }}
                >
                  <TouchableOpacity
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                    onPress={handleEllipsisPress}
                  >
                    <SymbolView
                      name='ellipsis.circle'
                      size={24}
                      type='monochrome'
                      tintColor='#0078ff'
                      weight='regular'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -2,
                    }}
                  >
                    <SymbolView
                      name='square.and.pencil'
                      size={24}
                      type='monochrome'
                      tintColor='#0078ff'
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
                elevation: 1000,
                zIndex: 1000,
              },
              headerLeft: () => (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 26,
                    marginTop: -2,
                    opacity: 0,
                  }}
                >
                  <Text style={{ color: '#0078ff', fontSize: 17 }}>Edit</Text>
                </TouchableOpacity>
              ),
              headerRight: () => (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 16,
                    alignItems: 'center',
                    height: 26,
                    marginTop: -4,
                    opacity: 0,
                  }}
                >
                  <TouchableOpacity
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                  >
                    <SymbolView
                      name='ellipsis.circle'
                      size={24}
                      type='monochrome'
                      tintColor='#0078ff'
                      weight='regular'
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -2,
                    }}
                  >
                    <SymbolView
                      name='square.and.pencil'
                      size={24}
                      type='monochrome'
                      tintColor='#0078ff'
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
    </>
  );
}
