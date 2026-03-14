import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';

const AnimatedPulse = ({ item }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
      }}
      className="bg-surface border-primary/20 mb-3 rounded-xl border p-4 shadow-sm">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-bold text-text">{item.author || 'Vecin Anonim'}</Text>
        <View className="bg-primary/10 rounded-full px-2 py-1">
          <Text className="text-xs font-semibold text-primary">{item.type}</Text>
          <Text className="text-xs font-semibold text-primary">{item.created_at}</Text>
        </View>
      </View>
      <Text className="text-base text-text">{item.content}</Text>
    </Animated.View>
  );
};

export default AnimatedPulse;
