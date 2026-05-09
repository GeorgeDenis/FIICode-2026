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

  const getPathnameByType = (itemType) => {
    switch (item.type) {
      case 'Comment':
        return `/pulse-comments/${item.entity_id}`;
      case 'Mission':
        return '/missions/missions';
      case 'Pulse':
        return `/pulse-comments/${item.entity_id}`;
      case 'Document':
        return `/documents/documents-dashboard`;
      default:
        return '/';
    }
  };

  const handleNavigation = () => {
    if (!item.entity_id) {
      return;
    }
    let pathname = getPathnameByType(item.type);
    router.push({
      pathname,
    });
  };

  const getSpecialStyles = () => {
    switch (item.type) {
      case 'Emergency':
        return {
          container: 'border-2 border-rose-500 bg-rose-50 dark:bg-rose-900/20',
          iconName: 'alert-circle',
          iconColor: '#F43F5E',
          title: 'EMERGENCY ALERT',
          titleColor: 'text-rose-600 font-black',
        };
      case 'News':
        return {
          container: 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20',
          iconName: 'information-circle',
          iconColor: '#3B82F6',
          title: 'COMMUNITY NEWS',
          titleColor: 'text-blue-600 font-black',
        };
      default:
        return null;
    }
  };

  const specialStyles = getSpecialStyles();

  return (
    <Pressable
      onPress={handleReadNotification}
      key={item.id}
      className={`mb-4 w-full rounded-xl ${item.is_read ? 'bg-surface' : 'bg-white'} p-4 shadow-sm ${specialStyles?.container || ''}`}>
      <View className="flex-row items-center gap-4">
        {specialStyles ? (
          <View className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-slate-800">
            <Ionicons name={specialStyles.iconName} size={32} color={specialStyles.iconColor} />
          </View>
        ) : item.actor?.image ? (
          <Image source={{ uri: item.actor.image }} className={`h-16 w-16 rounded-full`} />
        ) : (
          <View className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className={`text-xs uppercase tracking-widest ${specialStyles?.titleColor || 'font-bold text-text-main'}`}>
              {specialStyles?.title || item.type}
            </Text>
            {item.is_read ? null : <View className="h-2 w-2 rounded-full bg-red-600" />}
          </View>
          <Text
            className={`mt-1 text-base ${specialStyles ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-text-muted'}`}>
            {item.content}
          </Text>
          <Text className="mt-2 text-xs text-slate-400">
            {formatMessageDateTime(item.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationCard;
