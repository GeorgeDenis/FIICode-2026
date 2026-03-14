import {
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import { useUser } from '../../hooks/useUser';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';

import { Check, LogOut, Mail, Trash, User } from 'lucide-react-native';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';

const Profile = () => {
  const { logout, user } = useUser();
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const { first_name, last_name, email } = response.data;
      setCurrentUser({ firstName: first_name, lastName: last_name, email });
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

  const handleSetProfileData = (value, property) => {
    if (property === 'firstName') {
      setCurrentUser({ ...currentUser, firstName: value });
    } else if (property === 'lastName') {
      setCurrentUser({ ...currentUser, lastName: value });
    }
  };

  const handleEditProfile = async () => {
    if (!currentUser.firstName || !currentUser.lastName) {
      errorToast('First name and last name cannot be empty.');
      return;
    }
    try {
      await api.put('/auth', {
        first_name: currentUser.firstName,
        last_name: currentUser.lastName,
      });
      successToast('Profile updated successfully.');
    } catch (error) {
      errorToast(error.message);
    }
  };

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center bg-background pt-4">
        <View className="mb-5 items-center">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
            <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
          </View>
        </View>

        <View className="w-[95%] gap-4">
          <View className="w-full flex-row gap-4">
            <View className="bg-surface flex-1 flex-row items-center justify-between rounded-xl border-2 border-primary px-3 py-1">
              <TextInput
                className="flex-1 py-3 text-text"
                value={currentUser.firstName}
                onChangeText={(value) => handleSetProfileData(value, 'firstName')}
                placeholder="First Name"
              />
              <User color={iconColor} size={20} />
            </View>

            <View className="bg-surface flex-1 flex-row items-center rounded-xl border-2 border-primary px-3 py-1">
              <TextInput
                className="flex-1 py-3 text-text"
                value={currentUser.lastName}
                onChangeText={(value) => handleSetProfileData(value, 'lastName')}
                placeholder="Last Name"
              />
              <User color={iconColor} size={20} />
            </View>
          </View>

          <View className="bg-surface w-full flex-row items-center rounded-xl border-2 border-primary px-3 py-1 opacity-80">
            <TextInput
              className="flex-1 py-3 text-text"
              value={currentUser.email}
              placeholder="Email"
              editable={false}
            />
            <Mail color={iconColor} size={20} />
          </View>
        </View>

        <View className="flex-1" />
        <View className="mb-5 w-[95%]">
          <Pressable
            onPress={() => handleDeleteModal()}
            className="w-full flex-row items-center justify-between gap-2 rounded-xl bg-red-400 p-2 py-4 shadow-sm active:bg-red-500">
            <Text className="text-base font-bold text-white">Delete account</Text>
            <Trash color="#ffffff" size={20} />
          </Pressable>
        </View>
        <View className="mb-5 w-[95%]">
          <Pressable
            onPress={() => logout()}
            className="w-full flex-row items-center justify-between gap-2 rounded-xl bg-yellow-400 p-2 py-4 shadow-sm active:bg-yellow-500">
            <Text className="text-base font-bold text-white">Logout</Text>
            <LogOut color="#ffffff" size={20} />
          </Pressable>
        </View>
        <View className="mb-5 w-[95%]">
          <Pressable
            onPress={() => handleEditProfile()}
            className="w-full flex-row items-center justify-between gap-2 rounded-xl bg-green-400 p-2 py-4 shadow-sm active:bg-green-500">
            <Text className="text-base font-bold text-white">Save profile</Text>
            <Check color="#ffffff" size={20} />
          </Pressable>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}>
          <View className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <View className="w-[380px] items-center rounded-lg bg-background p-[20px]">
              <Text className="text-bold text-lg text-text">
                Are you sure you want to delete your account?
              </Text>
              <View className="mt-4 flex-row gap-4">
                <Pressable
                  className="rounded-lg border bg-red-700 p-2"
                  onPress={() => handleDeleteAccount()}>
                  <Text className="text-lg font-bold text-white">Delete</Text>
                </Pressable>
                <Pressable
                  className="rounded-lg border bg-blue-700 p-2"
                  onPress={() => setDeleteModalVisible(false)}>
                  <Text className="text-lg font-bold text-white">Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Profile;
