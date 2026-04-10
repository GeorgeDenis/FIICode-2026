import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useUser } from '../../hooks/useUser';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';

import { Hammer, PawPrint, PersonStanding, Trash, Van } from 'lucide-react-native';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import ProfileDataCard from '../../components/profile/ProfileDataCard';
import BasicModal from '../../components/BasicModal';
import { BriefcaseMedical } from 'lucide-react-native/icons';

const Profile = () => {
  const { logout, user } = useUser();
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    profileImageUrl: null,
    skills: null,
    role: 0,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const { first_name, last_name, email, description, image, skills, role } = response.data;
      setCurrentUser({
        firstName: first_name,
        lastName: last_name,
        description,
        email,
        profileImageUrl: image,
        skills,
        role,
      });
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return;
      }
      errorToast(error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleDeleteModal = () => {
    setDeleteModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    setDeleteModalVisible(true);
    try {
      await api.delete('/auth');
      successToast('Account deleted successfully.');
      logout();
    } catch (error) {
      errorToast(error.message);
    }
  };

  const initials =
    `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <ScrollView
      className="bg-indigo-500"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mt-2 flex-1 items-center bg-indigo-500 pt-4">
          <View className="absolute left-5 top-20 z-10 mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
            {currentUser.profileImageUrl ? (
              <Image
                source={{ uri: currentUser.profileImageUrl }}
                className="h-full w-full rounded-full"
              />
            ) : (
              <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
            )}
          </View>
          <View className="mb-5 flex w-full flex-row items-center justify-end gap-2 px-5">
            <View className="flex flex-row gap-2">
              <Link href="/profile-options/settings" asChild>
                <Pressable className="flex flex-row items-center justify-center gap-2 rounded-xl bg-primary p-4 shadow-sm">
                  <Ionicons name="settings" size={20} color="#ffffff" />
                </Pressable>
              </Link>
              <Pressable
                className="flex flex-row items-center justify-center gap-2 rounded-xl bg-yellow-500 p-4 shadow-sm"
                onPress={logout}>
                <Ionicons name="exit" size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>
          <View className="mt-10 w-full flex-1 rounded-t-3xl bg-gray-200 p-5">
            <View className="mt-14 flex w-full flex-row items-center justify-between gap-2 px-5">
              <View className="flex flex-col justify-start gap-2">
                <Text className="text-xl font-bold text-text-main">
                  {currentUser.firstName} {currentUser.lastName}
                </Text>
                <Text className="text-base text-text-muted">{currentUser.email}</Text>
              </View>
              <View className="flex flex-col gap-2">
                <Link href="/missions/missions" asChild>
                  <Pressable className="flex flex-row items-center justify-between gap-2 rounded-lg bg-orange-500 p-4 shadow-sm active:bg-orange-400">
                    <Text className="font-bold text-text-inverted">Missions</Text>
                    <Ionicons name="star" size={20} color="yellow" />
                  </Pressable>
                </Link>
                {currentUser.role === 1 && (
                  <Link href="/admin/admin-dashboard" asChild>
                    <Pressable className="flex flex-row items-center justify-between gap-2 rounded-lg bg-red-500 p-4 shadow-sm active:bg-red-400">
                      <Text className="font-bold text-text-inverted">Admin</Text>
                      <Ionicons name="flag" size={20} color="white" />
                    </Pressable>
                  </Link>
                )}
              </View>
            </View>
            <View className="mt-10 w-full justify-center gap-5">
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
              <Text className="min-h-[200px] w-full rounded-xl bg-surface p-5 text-text-main shadow-sm">
                {currentUser.description ||
                  'No description provided. You can add a bio in your profile settings.'}
              </Text>
            </View>
            <View className="mt-5 flex-row flex-wrap gap-2">
              {currentUser.skills &&
                AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = currentUser.skills.includes(skill.id);

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
            <View className="mb-5 mt-10 w-[95%]">
              <Pressable
                onPress={() => handleDeleteModal()}
                className="w-full flex-row items-center justify-between gap-2 rounded-xl bg-red-400 p-2 py-4 shadow-sm active:bg-red-500">
                <Text className="text-base font-bold text-white">Delete account</Text>
                <Trash color="#ffffff" size={20} />
              </Pressable>
            </View>
          </View>
          {deleteModalVisible && (
            <BasicModal
              setVisible={setDeleteModalVisible}
              doAction={handleDeleteAccount}
              doActionText="Delete account">
              <Text className="text-bold text-text text-lg">
                Are you sure you want to delete your account?
              </Text>
            </BasicModal>
          )}
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default Profile;
