import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import UserOnly from '../../components/auth/UserOnly';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';

const ProfileDetails = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleFetchUser = async () => {
    try {
      const response = await api.get('/user/by-id/' + id);
      setUser(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return;
      }
      errorToast(error.message);
    }
  };

  useEffect(() => {
    handleFetchUser();
  }, [id]);

  const handleNavigation = async () => {
    let conversationId = null;
    let isGroup = false;
    try {
      const response = await api.get(`/chat/conversations/${user.id}`);
      if (response.data.id) {
        conversationId = response.data.id;
        isGroup = response.data.is_group;
      }
    } catch (error) {}

    router.push({
      pathname: '/messaging',
      params: {
        conversationId,
        isGroup,
        receiverId: user.id,
        name: user.first_name + ' ' + user.last_name,
      },
    });
  };

  const initials =
    `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();
  return (
    <UserOnly>
      <View className="flex flex-1 flex-col items-center bg-background pt-4">
        <Stack.Screen
          options={{
            title: '',
            headerBackTitleVisible: false,
            headerBackTitle: '',

            headerLeft: () => (
              <Pressable
                className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </Pressable>
            ),
          }}
        />

        <View className="items-center bg-background">
          <View className="items-center">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
              <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
            </View>
          </View>
        </View>
        <Pressable
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary active:opacity-50"
          onPress={() => handleNavigation()}>
          <Text className="color-white">Chat</Text>
        </Pressable>
      </View>
    </UserOnly>
  );
};

export default ProfileDetails;
