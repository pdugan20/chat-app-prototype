import React from 'react';
import { StatusBar } from 'expo-status-bar';
import ChatScreen from './components/ChatScreen';

export default function App() {
  return (
    <>
      <StatusBar style='dark' />
      <ChatScreen />
    </>
  );
}
