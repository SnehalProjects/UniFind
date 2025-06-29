import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import DrawerScreen from '../screens/DrawerScreen';

const { width } = Dimensions.get('window');
const drawerWidth = width * 0.7;

const DrawerModal = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;

  useEffect(() => {
    if (visible) {
      // 🔄 UPDATED: Slide in from left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 🔄 UPDATED: Slide out to left
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 🔄 UPDATED: Dimmed area (tap to close) */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* 🔄 UPDATED: Animated drawer from left */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* ✅ NEW: Pass closeDrawer prop to DrawerScreen */}
          <DrawerScreen closeDrawer={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row', // 🔄 UPDATED: Ensures drawer slides in from left
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // 🔄 UPDATED: Dimmed background
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: drawerWidth, // 🔄 UPDATED: 70% width of screen
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
});

export default DrawerModal;
