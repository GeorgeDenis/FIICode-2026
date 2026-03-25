import React, { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '../services/api';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notification/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Eroare la fetch notificări:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Pressable
      onPress={() => router.push('/notifications')}
      className="relative p-2 active:opacity-50">
      <Ionicons name="notifications-outline" size={28} color="#000" />

      {unreadCount > 0 && (
        <View className="absolute right-0 top-0 h-5 min-w-[20px] items-center justify-center rounded-full border border-background bg-red-600 px-1">
          <Text className="text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
