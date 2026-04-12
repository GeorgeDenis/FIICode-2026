import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { formatMessageDateTime, getInitials } from '../../utils/utils_functions';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import ReactionBar from './ReactionBar';
import { errorToast, successToast } from '../../utils/toast';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';
import AddReportModal from '../admin/reports/AddReportModal';
import { TriangleAlert } from 'lucide-react-native';

const AnimatedPulse = ({ item, openEditPulseModal, refetch }) => {
  const { user } = useUser();
  const router = useRouter();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

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
      if (response.status === 201) {
        successToast('You have successfully joined the mission! Check your missions tab for details.');
      }
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
          <View className="flex flex-row items-center gap-2">
            <Text className="text-sm font-bold text-white">Verified: </Text>
            {item.is_verified ? (
              <Ionicons name={'shield-checkmark'} size={20} color="orange" />
            ) : (
              <Ionicons name={'close-circle'} size={20} color="black" />
            )}
          </View>
          <Text className="text-sm font-bold text-white">{item.urgency_level.toUpperCase()}</Text>
        </View>

        <View className="flex flex-row items-center justify-between gap-2 rounded-xl px-4 py-2">
          <View className="flex flex-row items-center gap-2">
            {item.author?.image ? (
              <Image
                source={{ uri: item.author.image }}
                className="h-8 w-8 rounded-full bg-gray-200"
              />
            ) : (
              <View className="bg-primary/20 h-8 w-8 items-center justify-center rounded-full">
                <Text className="font-bold text-primary">
                  {getInitials(item.author?.first_name, item.author?.last_name)}
                </Text>
              </View>
            )}
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
            {user.user_id !== item.author_id && item.status === 'Active' && (
              <Pressable
                onPress={() => setIsReportModalVisible(true)}
                className={`${getTypeBadgeColor(item)} items-center gap-1 rounded-xl px-3 py-3`}>
                <TriangleAlert color="white" size={24} />
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
            refetch={refetch}
            pulseId={item.id}
            authorId={item.author_id}
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
      <AddReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        itemType="Pulse"
        item={item}
      />
    </Animated.View>
  );
};

export default AnimatedPulse;
