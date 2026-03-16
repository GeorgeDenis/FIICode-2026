import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import UserOnly from '../../components/auth/UserOnly';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import ProfileDataCard from '../../components/profile/ProfileDataCard';

const ProfileDetails = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleFetchUser = async () => {
    try {
      const response = await api.get('/user/by-id/' + id);
      setUser(response.data);
      console.log(response.data);
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

        <View className="mt-12 w-full flex-1 items-center bg-background pt-4">
          <View className="absolute left-5 top-4 z-10 mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
            <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
          </View>
          <View className="mt-14 w-full flex-1 items-center rounded-t-3xl bg-gray-200 p-2">
            <View className="mt-10 flex w-full flex-row items-center justify-between">
              <View className="flex-1 flex-col justify-start gap-2 px-3">
                <Text className="text-xl font-bold text-text-main">
                  {user?.first_name} {user?.last_name}
                </Text>
                <Text className="text-base text-text-muted">{user?.email}</Text>
              </View>
              <Pressable
                className="flex items-center justify-center rounded-lg bg-primary p-3"
                onPress={() => handleNavigation()}>
                <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" />
              </Pressable>
            </View>
            <View className="mt-10 w-full justify-center gap-5 px-2">
              <View className="flex w-full flex-row gap-5">
                <ProfileDataCard
                  text="Trust score"
                  value="51"
                  imageColor="orange"
                  imageBackground="bg-orange-300"
                  imageType="shield-checkmark"
                />
                <ProfileDataCard
                  text="Tags"
                  value="51"
                  imageColor="green"
                  imageBackground="bg-green-300"
                  imageType="pricetags"
                />
              </View>
              <View className="flex w-full flex-row gap-5">
                <ProfileDataCard
                  text="People helped"
                  value="51"
                  imageColor="blue"
                  imageBackground="bg-blue-300"
                  imageType="accessibility"
                />
                <ProfileDataCard
                  text="Pulses created"
                  value="51"
                  imageColor="red"
                  imageBackground="bg-red-300"
                  imageType="pulse"
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </UserOnly>
  );
};

export default ProfileDetails;
