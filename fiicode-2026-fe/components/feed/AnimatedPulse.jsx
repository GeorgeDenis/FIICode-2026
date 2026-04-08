import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatMessageDateTime } from '../../utils/utils_functions';
import { Ionicons } from '@expo/vector-icons';
import ProfilePicture from '../../assets/img/profile-picture.png';
import { useRouter } from 'expo-router';

import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import ReactionBar from './ReactionBar';
import { errorToast } from '../../utils/toast';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';

const AnimatedPulse = ({ item, openEditPulseModal }) => {
  const { user } = useUser();
  const router = useRouter();

  const handleNavigation = () => {
    router.push({
      pathname: '/pulse-comments/' + item.id,
    });
  };

  const handleCreateMission = async () => {
    try {
      const response = await api.post('/mission', {
        pulse_id: item.id,
      });
    } catch (error) {
      errorToast('You are already part of this mission');
    }
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
      entering={FadeInUp.duration(400).springify()}
      layout={LinearTransition.springify()}
      className={`mb-4 rounded-xl border ${getBorderColorByType(item)} bg-surface shadow-sm`}>
      <View className="mb-2 flex-col">
        <View
          className={`flex flex-row items-center gap-2 ${getTypeBadgeColor(item)} justify-between rounded-xl rounded-b-none p-4`}>
          <View className="flex flex-row items-center gap-2">
            <Ionicons name={getIconName(item)} size={24} color="#ffffff" />
            <Text className="text-md font-semibold text-white">{item.type}</Text>
          </View>
          <Text className="text-sm font-bold text-white">Status: {item.status}</Text>
          <Text className="text-sm font-bold text-white">{item.urgency_level.toUpperCase()}</Text>
        </View>

        <View className="flex flex-row items-center justify-between gap-2 rounded-xl px-4 py-2">
          <View className="flex flex-row items-center gap-2">
            <Image source={ProfilePicture} className="mb-2 h-10 w-10" />
            <Text className="font-bold text-text-main">
              {item.author ? `${item.author.first_name} ${item.author.last_name}` : 'Anonym'}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            {user.user_id === item.author_id && (
              <Pressable
                onPress={() => openEditPulseModal(item)}
                className={`${getTypeBadgeColor(item)} items-center gap-1 rounded-xl px-3 py-1`}>
                <Ionicons name={'pencil-outline'} size={20} color="white" />
                <Text className="text-text-inverted">Edit</Text>
              </Pressable>
            )}
            {user.user_id !== item.author_id && item.status === 'Active' && (
              <Pressable
                onPress={() => handleCreateMission()}
                className={`${getTypeBadgeColor(item)} items-center gap-1 rounded-xl px-3 py-1`}>
                <Ionicons name={'hand-right-outline'} size={20} color="white" />
                <Text className="text-text-inverted">Help</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex flex-row items-center px-4 py-2">
          <Text className="text-base text-text-main">{item.content}</Text>
        </View>

        <View className="flex flex-row justify-center gap-3 border-t border-gray-100 px-3 pb-1 pt-3">
          <Pressable
            onPress={handleNavigation}
            className="flex flex-row items-center gap-1 active:opacity-50">
            <Ionicons name="chatbubble-ellipses-outline" color="#10b981" size={20} />
            <Text className="text-sm font-semibold text-text-main">Comments</Text>
          </Pressable>
          <ReactionBar
            pulseId={item.id}
            initialLikes={item.likes_count}
            initialDislikes={item.dislikes_count}
          />
          <View className="flex flex-col items-start gap-1">
            <Text className="text-xs font-semibold text-text-muted">
              Created: {formatMessageDateTime(item.created_at)}
            </Text>
            <Text className="text-xs font-semibold text-text-muted">
              Updated: {formatMessageDateTime(item.updated_at)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default AnimatedPulse;
