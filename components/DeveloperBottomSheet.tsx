import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

import { SymbolView } from 'expo-symbols';
import { Colors, Typography } from '../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

interface DeveloperBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onResetMessages: () => void;
  onSwitchConversation: () => void;
}

const DeveloperBottomSheet: React.FC<DeveloperBottomSheetProps> = ({
  visible,
  onClose,
  onResetMessages,
  onSwitchConversation,
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        duration: 400,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      slideAnim.setValue(screenHeight);
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      useNativeDriver: true,
      duration: 400,
      easing: Easing.in(Easing.cubic),
    }).start(() => {
      onClose();
    });
  };

  const handleResetMessages = () => {
    onResetMessages();
    handleClose();
  };

  const handleSwitchConversation = () => {
    onSwitchConversation();
    handleClose();
  };

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={handleClose}
    >
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.bottomSheetHandle} />

        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Developer Options</Text>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleResetMessages}
          >
            <SymbolView
              name='arrow.clockwise'
              size={20}
              type='hierarchical'
              tintColor={Colors.systemBlue}
              weight='medium'
              style={styles.bottomSheetItemIcon}
            />
            <Text style={styles.bottomSheetItemText}>Reset Messages</Text>
            <SymbolView
              name='chevron.right'
              size={16}
              type='hierarchical'
              tintColor={Colors.textSecondary}
              weight='regular'
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomSheetItem}
            onPress={handleSwitchConversation}
          >
            <SymbolView
              name='person.2'
              size={20}
              type='hierarchical'
              tintColor={Colors.systemBlue}
              weight='medium'
              style={styles.bottomSheetItemIcon}
            />
            <Text style={styles.bottomSheetItemText}>Switch Conversation</Text>
            <SymbolView
              name='chevron.right'
              size={16}
              type='hierarchical'
              tintColor={Colors.textSecondary}
              weight='regular'
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    elevation: 10,
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: Colors.black,
    shadowOffset: {
      height: -2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bottomSheetContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  bottomSheetHandle: {
    alignSelf: 'center',
    backgroundColor: Colors.border,
    borderRadius: 2.5,
    height: 5,
    marginTop: 12,
    width: 36,
  },
  bottomSheetItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
    paddingVertical: 12,
  },
  bottomSheetItemIcon: {
    marginRight: 12,
  },
  bottomSheetItemText: {
    color: Colors.black,
    flex: 1,
    fontFamily: Typography.fontFamily,
    fontSize: 17,
    fontWeight: '400',
  },
  bottomSheetTitle: {
    color: Colors.black,
    fontFamily: Typography.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  overlay: {
    backgroundColor: Colors.overlayBackground,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
});

export default DeveloperBottomSheet;
