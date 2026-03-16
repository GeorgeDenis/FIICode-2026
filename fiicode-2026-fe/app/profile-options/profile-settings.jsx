import React, { useCallback, useState } from 'react';
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Check } from 'lucide-react-native';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';

const ProfileSettings = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const { first_name, last_name, email } = response.data;
      setUser({ firstName: first_name, lastName: last_name, email });
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

  const handleEditProfile = async () => {
    if (!user.firstName || !user.lastName) {
      errorToast('First name and last name cannot be empty.');
      return;
    }
    try {
      await api.put('/auth', {
        first_name: user.firstName,
        last_name: user.lastName,
      });
      successToast('Profile updated successfully.');
    } catch (error) {
      errorToast(error.message);
    }
  };

  const handleSetProfileData = (value, property) => {
    if (property === 'firstName') {
      setUser({ ...user, firstName: value });
    } else if (property === 'lastName') {
      setUser({ ...user, lastName: value });
    }
  };

  const initials =
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Profile Settings',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mt-5 flex flex-col items-center gap-5 px-5">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-primary shadow-sm">
            <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
          </View>
          <View className="flex flex-col items-start gap-2">
            <Text className="text-text-muted">First name</Text>
            <View className="flex flex-row items-center justify-between rounded-3xl border-2 border-primary bg-surface px-3 py-1">
              <TextInput
                className="w-[80%] py-3 text-text-main"
                value={user.firstName}
                onChangeText={(value) => handleSetProfileData(value, 'firstName')}
                placeholder="First Name"
              />
              <Ionicons name="person-outline" color={iconColor} size={20} />
            </View>
          </View>

          <View className="flex flex-col items-start gap-2">
            <Text className="text-text-muted">First name</Text>
            <View className="flex flex-row items-center justify-between rounded-3xl border-2 border-primary bg-surface px-3 py-1">
              <TextInput
                className="w-[80%] py-3 text-text-main"
                value={user.lastName}
                onChangeText={(value) => handleSetProfileData(value, 'lastName')}
                placeholder="First Name"
              />
              <Ionicons name="person-outline" color={iconColor} size={20} />
            </View>
          </View>
          <View className="flex flex-col items-start gap-2">
            <Text className="text-text-muted">Email</Text>
            <View className="flex flex-row items-center justify-between rounded-3xl border-2 border-primary bg-surface px-3 py-1">
              <TextInput
                className="w-[80%] py-3 text-text-main"
                value={user.email}
                placeholder="Email"
                editable={false}
              />
              <Ionicons name="mail-outline" color={iconColor} size={20} />
            </View>
          </View>
          <View className="flex flex-col items-start gap-2">
            <Text className="text-text-muted">Bio</Text>
            <View className="flex flex-row items-center justify-between rounded-3xl border-2 border-primary bg-surface px-3 py-1">
              <TextInput
                multiline={true}
                numberOfLines={4}
                value={user.lastName}
                className="min-h-[120px] w-[80%] text-text-main"
                onChangeText={(value) => handleSetProfileData(value, 'lastName')}
                placeholder="First Name"
              />
              <Ionicons name="clipboard-outline" color={iconColor} size={20} />
            </View>
          </View>
          <View className="flex flex-col items-start gap-2">
            <Pressable
              onPress={() => handleEditProfile()}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-btn-primary px-6 py-4 shadow-sm active:bg-btn-primary-active">
              <Text className="text-base font-bold text-white">Save profile</Text>
              <Check color="#ffffff" size={20} />
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default ProfileSettings;
