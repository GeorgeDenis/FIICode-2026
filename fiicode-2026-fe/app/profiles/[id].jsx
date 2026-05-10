import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import UserOnly from '../../components/auth/UserOnly';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import ProfileDataCard from '../../components/profile/ProfileDataCard';
import { Hammer, PawPrint, PersonStanding, TriangleAlert, Van } from 'lucide-react-native';
import { BriefcaseMedical } from 'lucide-react-native/icons';
import AddReportModal from '../../components/admin/reports/AddReportModal';
import ProfileRank from '../../components/profile/ProfileRank';

const ProfileDetails = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
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
    setLoading(true);
    try {
      const response = await api.get('/user/by-id/' + id);
      setUser(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return;
      }
      errorToast(error.message);
    } finally {
      setLoading(false);
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

  if (loading && !user) {
    return (
      <View className="mx-4 mb-4 h-32 items-center justify-center rounded-3xl bg-surface shadow-sm">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  if (!user) return null;


  const initials =
    `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase();
  return (
    <UserOnly>
      <ScrollView>
        <View className="flex flex-1 flex-col items-center bg-indigo-500 pt-4">
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

          <View className="mt-12 w-full flex-1 items-center bg-indigo-500 pt-4">
            <View className="absolute left-5 top-4 z-10 mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
              {user?.image ? (
                <Image source={{ uri: user?.image }} className="h-full w-full rounded-full" />
              ) : (
                <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
              )}
            </View>
            <View className="mt-14 w-full flex-1 items-center rounded-t-3xl bg-gray-200 p-4">
              <View className="mt-10 flex w-full flex-row items-center justify-between gap-2">
                <View className="flex-1 flex-col justify-start gap-2 px-3">
                  <Text className="text-xl font-bold text-text-main">
                    {user?.first_name} {user?.last_name}
                  </Text>
                  <Text className="text-base text-text-muted">{user?.email}</Text>
                </View>
                <Pressable
                  onPress={() => setIsReportModalVisible(true)}
                  className="flex items-center justify-center rounded-lg bg-primary p-3">
                  <TriangleAlert color="red" size={24} />
                </Pressable>
                <Pressable
                  className="flex items-center justify-center rounded-lg bg-primary p-3"
                  onPress={() => handleNavigation()}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" />
                </Pressable>
              </View>
              <ProfileRank currentUser={user} />
              <View className="mt-10 w-full justify-center gap-5 px-2">
                <View className="flex w-full flex-row gap-5">
                  <ProfileDataCard
                    text="Trust score"
                    value={user.trust_score.toFixed(0) || 0}
                    imageColor="orange"
                    imageBackground="bg-orange-300"
                    imageType="shield-checkmark"
                  />
                  <ProfileDataCard
                    text="Missions"
                    value={user.total_missions || 0}
                    imageColor="green"
                    imageBackground="bg-green-300"
                    imageType="pricetags"
                  />
                </View>
                <View className="flex w-full flex-row gap-5">
                  <ProfileDataCard
                    text="People helped"
                    value={user.people_helped || 0}
                    imageColor="blue"
                    imageBackground="bg-blue-300"
                    imageType="accessibility"
                  />
                  <ProfileDataCard
                    text="Pulses created"
                    value={user.pulses_created || 0}
                    imageColor="red"
                    imageBackground="bg-red-300"
                    imageType="pulse"
                  />
                </View>
              </View>
              <View className="mt-5 flex w-full flex-col items-start">
                <Text className="text-xl font-bold text-text-main">About</Text>
                <Text className="min-h-[200px] w-full rounded-xl bg-surface p-2 text-text-main shadow-sm">
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
      <AddReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        itemType="User"
        item={user}
      />
    </UserOnly>
  );
};

export default ProfileDetails;
