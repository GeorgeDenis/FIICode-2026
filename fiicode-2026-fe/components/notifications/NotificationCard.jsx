import React from 'react';
import { Image, Pressable, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageDateTime } from '../../utils/utils_functions';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { useRouter } from 'expo-router';

const NotificationCard = ({ item, fetchNotifications }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';
  const handleReadNotification = async () => {
    if (item.is_read) {
      handleNavigation();
      return;
    }
    try {
      const response = await api.patch(`/notification/mark-as-read/${item.id}`);
      if (response.status === 200) {
        fetchNotifications();
      }
      handleNavigation();
    } catch (error) {
      errorToast(error.message);
    }
  };

  const handleNavigation = () => {
    if (!item.entity_id) {
      return;
    }
    let pathname = '';
    switch (item.type) {
      case 'Comment':
        pathname = `/pulse-comment/${item.entity_id}`;
        break;
      case 'Mission':
        pathname = '/missions/missions';
        break;
      case 'Pulse':
        pathname = '/(dashboard)/feed';
        break;
      default:
        pathname = '/';
    }
    router.push({
      pathname,
    });
  };

  return (
    <Pressable
      onPress={handleReadNotification}
      key={item.id}
      className={`mb-4 w-full flex-1 rounded-lg ${item.is_read ? 'bg-surface' : 'bg-white/75'} p-4 shadow-sm`}>
      <View className="flex-row items-center gap-3">
        {item.actor?.image ? (
          <Image source={{ uri: item.actor.image }} className={`h-16 w-16 rounded-full`} />
        ) : (
          <View className="flex h-16 w-16 items-center justify-center rounded-full">
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-text-main">{item.type}</Text>
            {item.is_read ? null : <View className="h-2 w-2 rounded-full bg-red-600" />}
          </View>
          <Text className="text-sm text-text-muted">{item.content}</Text>
          <Text className="text-sm text-text-muted">{formatMessageDateTime(item.created_at)}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationCard;
