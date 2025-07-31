import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

interface TimestampHeaderProps {
  timestamp: string;
}

const TimestampHeader: React.FC<TimestampHeaderProps> = ({ timestamp }) => {
  // Split timestamp into day and time parts
  const parts = timestamp.split(' ');
  const dayPart = parts[0]; // "Monday"
  const timePart = parts.slice(1).join(' '); // "2:14 PM"

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        <Text style={styles.dayText}>{dayPart}</Text>
        {timePart && <Text style={styles.timeText}> at {timePart}</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.timestampMargin,
  },
  dayText: {
    fontFamily: 'System',
    fontWeight: Typography.medium,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: Typography.timestamp,
    lineHeight: Typography.timestampLineHeight,
  },
  timeText: {
    fontFamily: 'System',
    fontWeight: Typography.regular,
  },
});

export default TimestampHeader;
