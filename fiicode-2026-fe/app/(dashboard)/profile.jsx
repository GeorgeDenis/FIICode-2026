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

import { Trash } from 'lucide-react-native';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';
import { Ionicons } from '@expo/vector-icons';
import ProfileDataCard from '../../components/profile/ProfileDataCard';
import BasicModal from '../../components/BasicModal';

const Profile = () => {
  const { logout, user } = useUser();
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImageUrl: null,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const { first_name, last_name, email, image } = response.data;
      setCurrentUser({
        firstName: first_name,
        lastName: last_name,
        email,
        profileImageUrl: image,
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
              <Image source={{ uri: currentUser.profileImageUrl }} className="h-full w-full rounded-full" />
            ) : (
              <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
            )}
          </View>
          <View className="mb-5 flex w-full flex-row items-center justify-end gap-2 px-5">
            <View className="flex flex-row gap-2">
              <Link href="/profile-options/profile-settings" asChild>
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
          <View className="mt-10 w-full flex-1 items-center rounded-t-3xl bg-gray-200 p-5">
            <View className="mt-14 flex w-full flex-col justify-start gap-2">
              <Text className="text-xl font-bold text-text-main">
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Text className="text-base text-text-muted">{currentUser.email}</Text>
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
              <Text>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                Ipsum has been the industrys standard dummy text ever since the 1500s, when an
                unknown printer took a galley of type and scrambled it to make a type specimen book.
                It has survived not only five centuries, but also the leap into electronic
                typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                with desktop publishing software like Aldus PageMaker including versions of Lorem
                Ipsum.
              </Text>
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
