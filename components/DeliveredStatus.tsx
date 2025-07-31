import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Layout } from '../constants/theme';

interface DeliveredStatusProps {
  visible: boolean;
}

const DeliveredStatus: React.FC<DeliveredStatusProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Delivered</Text>
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

export default DeliveredStatus;
