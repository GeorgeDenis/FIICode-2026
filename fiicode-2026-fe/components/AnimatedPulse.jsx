import React, { useEffect, useRef } from 'react';
import { Animated, Image, Text, View } from 'react-native';
import { formatMessageDateTime } from '../utils/utils_functions';
import { Ionicons } from '@expo/vector-icons';
import ProfilePicture from '../assets/img/profile-picture.png';

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

  const getBorderColorByType = () => {
    switch (item.type) {
      case 'Emergency':
        return 'border-red-500';
      case 'Skill':
        return 'border-blue-500';
      case 'Item':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const getTypeBadgeColor = () => {
    switch (item.urgency_level) {
      case 'Low':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-blue-500';
      case 'High':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIconName = () => {
    switch (item.type) {
      case 'Emergency':
        return 'flame-outline';
      case 'Skill':
        return 'construct';
      case 'Item':
        return 'cube';
      default:
        return 'help-circle';
    }
  };

  const getIconColor = () => {
    switch (item.type) {
      case 'Emergency':
        return '#ef4444';
      case 'Skill':
        return '#3b82f6';
      case 'Item':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
      }}
      className={`border-2 ${getBorderColorByType(item.type)} mb-3 rounded-xl px-4 py-2 shadow-sm`}>
      <View className="mb-2 flex-1 flex-row items-center">
        <View className="flex items-center">
          <Image source={ProfilePicture} className="mb-2 h-10 w-10" />
          <Text className="text-text font-bold">{item.author || 'Anonym'}</Text>
        </View>
        <View>
          <View className="flex-1 flex-row justify-between">
            <View className="flex flex-row items-center justify-between gap-3">
              <Ionicons name={getIconName()} size={24} color={getIconColor()} />
              <Text className="text-md font-semibold text-text-main">{item.type}</Text>
            </View>
            <View className={`flex flex-col items-center justify-center ${getTypeBadgeColor()} px-2 rounded-3xl`}>
              <Text className="text-sm font-semibold text-white">{item.urgency_level.toUpperCase()}</Text>
            </View>
          </View>
          <Text className="text-text text-base">{item.content}</Text>
          <View className="bg-primary/10 rounded-full px-2 py-1">
            <Text className="text-xs font-semibold text-text-main">
              {formatMessageDateTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AnimatedPulse;
