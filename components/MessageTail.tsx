import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface MessageTailProps {
  color?: string;
  size?: number;
  flipped?: boolean;
}

const MessageTail: React.FC<MessageTailProps> = ({
  color = Colors.systemBlue,
  size = 17,
  flipped = false,
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        transform: flipped ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Svg width={size} height={size} viewBox='0 0 17 17' fill='none'>
        <Path
          d='M11.5 10.5C12.0014 13.5086 14.8333 16.3333 16.5 17C10.1 17 6 14.8333 5 13.5L0 15L0.5 0H11V2V4V4.5C11 5.5 11 7.5 11.5 10.5Z'
          fill={color}
        />
      </Svg>
    </View>
  );
};

export default MessageTail;
