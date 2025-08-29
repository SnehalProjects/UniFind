import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const EmptyStateAnimation = ({ size = width * 0.6, color = '#4B6CB7' }) => {
  const floatValue1 = useRef(new Animated.Value(0)).current;
  const floatValue2 = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatValue1, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatValue2, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation1.start();
    floatAnimation2.start();
    scaleAnimation.start();

    return () => {
      floatAnimation1.stop();
      floatAnimation2.stop();
      scaleAnimation.stop();
    };
  }, [floatValue1, floatValue2, scaleValue]);

  const translateY1 = floatValue1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const translateY2 = floatValue2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons name="search-outline" size={size * 0.3} color={color} />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.floatingDot1,
          {
            backgroundColor: color,
            opacity: 0.6,
            transform: [{ translateY: translateY1 }],
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.floatingDot2,
          {
            backgroundColor: color,
            opacity: 0.4,
            transform: [{ translateY: translateY2 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingDot1: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    top: '20%',
    left: '20%',
  },
  floatingDot2: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '30%',
    right: '25%',
  },
});

export default EmptyStateAnimation; 