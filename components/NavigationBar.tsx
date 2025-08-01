import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Colors, Typography, Spacing, Layout } from '../constants/theme';

interface NavigationBarProps {
  contactName: string;
  onBackPress?: () => void;
  onContactPress?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  contactName,
  onBackPress,
  onContactPress,
}) => {
  return (
    <BlurView intensity={50} style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <SymbolView
            name='chevron.left'
            size={22}
            type='hierarchical'
            tintColor={Colors.systemBlue}
            weight='medium'
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.centerContent} onPress={onContactPress}>
          <View style={styles.profilePicture}>
            <Image
              source={require('../assets/profile-photos/Ruth.png')}
              style={styles.profileImage}
              resizeMode='cover'
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.contactName}>{contactName}</Text>
            <SymbolView
              name='chevron.down'
              size={7}
              type='hierarchical'
              tintColor={Colors.black}
              weight='regular'
              style={styles.chevronIcon}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.videoButton}>
          <SymbolView
            name='video'
            size={28}
            type='hierarchical'
            tintColor={Colors.systemBlue}
            weight='medium'
          />
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'flex-start',
    height: 44,
    justifyContent: 'center',
    paddingLeft: -8,
    width: 44,
  },
  centerContent: {
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
    gap: 4,
  },
  chevronIcon: {
    marginTop: 1,
  },
  contactName: {
    color: Colors.black,
    fontFamily: Typography.fontFamily,
    fontSize: Typography.contactName,
    fontWeight: Typography.regular,
    lineHeight: Typography.timestampLineHeight,
  },
  container: {
    backgroundColor: Colors.blurBackground,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    paddingBottom: Layout.navigationPaddingBottom,
    paddingLeft: Spacing.containerPadding,
    paddingRight: Spacing.containerPadding,
    paddingTop: Layout.navigationPaddingTop,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: Layout.navigationButtonSize,
    justifyContent: 'space-between',
  },
  nameContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  profileImage: {
    borderRadius: Spacing.profileBorderRadius,
    height: Spacing.profileImageSize,
    width: Spacing.profileImageSize,
  },
  profilePicture: {
    alignItems: 'center',
    backgroundColor: Colors.systemBlue,
    borderRadius: Spacing.profileBorderRadius,
    height: Spacing.profileImageSize,
    justifyContent: 'center',
    width: Spacing.profileImageSize,
  },
  videoButton: {
    alignItems: 'flex-end',
    height: Layout.navigationButtonSize,
    justifyContent: 'center',
    width: Layout.navigationButtonSize,
  },
});

export default NavigationBar;
