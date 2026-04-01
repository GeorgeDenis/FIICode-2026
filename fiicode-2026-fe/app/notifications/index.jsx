import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import UserOnly from '../../components/auth/UserOnly';
import MailboxPicture from '../../assets/img/mailbox.png';
import NotificationCard from '../../components/notifications/NotificationCard';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';

const Notifications = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  const handleFetchNotifications = async () => {
    try {
      const response = await api.get('/notification/by-recipient');
      const data = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(data);
    } catch (error) {
      errorToast(error.message);
    }
  };

  useEffect(() => {
    handleFetchNotifications();

    const interval = setInterval(() => {
      handleFetchNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <UserOnly>
      <View className="flex flex-1 flex-col items-center bg-background pt-4">
        <Stack.Screen
          options={{
            title: 'Notifications',
            headerBackTitleVisible: false,
            headerBackTitle: '',

            headerLeft: () => (
              <Pressable
                className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={24} color="#000" />
              </Pressable>
            ),
          }}
        />
        {notifications.length === 0 ? (
          <View className="mt-40 flex items-center gap-3">
            <Image source={MailboxPicture} className="h-40 w-36" />
            <View className="flex w-[80%] items-center gap-2">
              <Text className="text-3xl font-bold">No notifications yet</Text>
              <Text className="text-center">{`Your notification will appear here once you've received them.`}</Text>
            </View>
          </View>
        ) : (
          <View className="w-full flex-1 px-4">
            <FlatList
              data={notifications}
              renderItem={({ item }) => (
                <NotificationCard item={item} fetchNotifications={handleFetchNotifications} />
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>
    </UserOnly>
  );
};

export default Notifications;
