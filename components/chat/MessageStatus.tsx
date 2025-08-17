import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Layout } from '../../constants/theme';

export type MessageStatusType = 'delivered' | 'read';

interface MessageStatusProps {
  status?: MessageStatusType;
  visible: boolean;
}

const MessageStatus: React.FC<MessageStatusProps> = ({
  status = 'delivered',
  visible,
}) => {
  if (!visible) return null;

  const getStatusText = () => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      default:
        return 'Delivered';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    marginLeft: Layout.messageMarginSide,
    marginRight: 0,
    marginTop: Spacing.deliveredMarginTop,
  },
  text: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.delivered,
    fontWeight: Typography.medium,
    paddingRight: 4,
  },
});

export default MessageStatus;
