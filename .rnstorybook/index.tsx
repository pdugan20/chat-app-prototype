import React from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';

// Pass a custom React element as `brand.image` — the default `brand.title`
// hardcodes width: 125 and truncates. `brand.image` accepts a ReactElement
// directly (see StorybookLogo.tsx), so we can render our own View/Text.
// The drawer container has paddingLeft: 16 (asymmetric); the negative
// marginLeft pulls our wrapper back to x=0 so alignItems: center measures
// against the true drawer width.
const BrandHeader = (
  <View
    style={{
      alignItems: 'center',
      marginLeft: -16,
      width: '100%',
    }}
  >
    <Text
      style={{
        color: '#000',
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.2,
      }}
    >
      Bubble UI Kit
    </Text>
  </View>
);

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  theme: {
    brand: {
      image: BrandHeader,
    },
  },
});

export default StorybookUIRoot;
