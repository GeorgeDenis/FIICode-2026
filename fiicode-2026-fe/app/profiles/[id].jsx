import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import UserOnly from '../../components/auth/UserOnly';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import ProfileDataCard from '../../components/profile/ProfileDataCard';
import { Hammer, PawPrint, PersonStanding, Van } from 'lucide-react-native';
import { BriefcaseMedical } from 'lucide-react-native/icons';

const ProfileDetails = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const router = useRouter();

  const AVAILABLE_SKILLS = [
    {
      id: 'PHYSICAL_HELP',
      label: 'Physical Help',
      icon: <PersonStanding color="white" />,
      background: 'bg-yellow-500',
    },
    {
      id: 'MEDICAL',
      label: 'Medical Help',
      icon: <BriefcaseMedical color="white" />,
      background: 'bg-red-500',
    },
    {
      id: 'TOOLS',
      label: 'Tools & Equipment',
      icon: <Hammer color="white" />,
      background: 'bg-blue-500',
    },
    {
      id: 'TRANSPORT',
      label: 'Transport',
      icon: <Van color="white" />,
      background: 'bg-green-500',
    },
    {
      id: 'PET_RESCUE',
      label: 'Pet Rescue',
      icon: <PawPrint color="white" />,
      background: 'bg-orange-500',
    },
  ];

  const handleFetchUser = async () => {
    try {
      const response = await api.get('/user/by-id/' + id);
      setUser(response.data);
      console.log(response.data.skills);
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
      <ScrollView>
        <View className="flex flex-1 flex-col items-center bg-primary pt-4">
          <Stack.Screen
            options={{
              title: '',
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

          <View className="mt-12 w-full flex-1 items-center bg-primary pt-4">
            <View className="absolute left-5 top-4 z-10 mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
              {user?.image ? (
                <Image source={{ uri: user?.image }} className="h-full w-full rounded-full" />
              ) : (
                <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
              )}
            </View>
            <View className="mt-14 w-full flex-1 items-center rounded-t-3xl bg-gray-200 p-4">
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
              <View className="mt-5 flex w-full flex-col items-start">
                <Text className="text-xl font-bold text-text-main">About</Text>
                <Text className="min-h-[200px] w-full rounded-xl bg-surface p-2 p-5 text-text-main shadow-sm">
                  {user?.description ||
                    'No description provided. This user has not added any information about themselves yet.'}
                </Text>
              </View>
              <View className="mt-5 flex-row flex-wrap gap-2">
                {user?.skills &&
                  AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = user.skills.includes(skill.id);

                    if (!isSelected) return;

                    return (
                      <View
                        key={skill.id}
                        className={`flex flex-row  items-center gap-2 rounded-full px-4 py-2 shadow-sm ${skill.background}`}>
                        <Text className={`font-semibold text-text-inverted`}>{skill.label}</Text>
                        {skill.icon}
                      </View>
                    );
                  })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </UserOnly>
  );
};

export default ProfileDetails;
