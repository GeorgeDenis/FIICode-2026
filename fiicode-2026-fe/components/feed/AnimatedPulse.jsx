import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import {
  formatMessageDateTime,
} from '../../utils/utils_functions';
import { Ionicons } from '@expo/vector-icons';
import ProfilePicture from '../../assets/img/profile-picture.png';
import { useRouter } from 'expo-router';

const AnimatedPulse = ({ item }) => {
  const router = useRouter();
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

  const handleNavigation = () => {
    router.push({
      pathname: '/pulse-comments/' + item.id,
    });
  };

   const getBorderColorByType = (item) => {
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

   const getTypeBadgeColor = (item) => {
    switch (item.type) {
      case 'Emergency':
        return 'bg-red-500';
      case 'Skill':
        return 'bg-blue-500';
      case 'Item':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

   const getIconName = (item) => {
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


  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: translateYAnim }],
      }}
      className={`mb-3 rounded-xl border ${getBorderColorByType(item)} shadow-sm`}>
      <View className="mb-2 flex-1 flex-col">
        <View
          className={`flex flex-row items-center gap-2 ${getTypeBadgeColor(item)} justify-between rounded-xl rounded-b-none p-4`}>
          <View className="flex flex-row items-center gap-2">
            <Ionicons name={getIconName(item)} size={24} color="#ffffff" />
            <Text className="text-md font-semibold text-text-main">{item.type}</Text>
          </View>
          <Text className="text-text-reverted text-sm font-semibold">
            {item.urgency_level.toUpperCase()}
          </Text>
        </View>
        <View className={`flex flex-row items-center justify-between gap-2 rounded-xl px-4 py-2`}>
          <View className="flex flex-row items-center gap-2">
            <Image source={ProfilePicture} className="mb-2 h-10 w-10" />
            <Text className="font-bold text-text-main">{item.author || 'Anonym'}</Text>
          </View>
          <Text className="text-sm font-semibold text-text-muted">
            {formatMessageDateTime(item.created_at)}
          </Text>
        </View>

        <View className="flex flex-row items-center px-4 py-2">
          <Text className="text-base text-text-main">{item.content}</Text>
        </View>
        <View className="flex flex-row gap-5  border-t px-4 py-2">
          <View className="flex flex-row  items-center gap-1">
            <Ionicons name="chatbubble-ellipses-outline" color="green" size={24} />
            <Pressable onPress={handleNavigation}>
              <Text className="text-sm font-semibold text-black">Comments</Text>
            </Pressable>
          </View>
          <View className="flex flex-row  items-center gap-1">
            <Ionicons name="heart-outline" color="red" size={24} />
            <Text className="text-sm font-semibold text-black">51</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AnimatedPulse;
