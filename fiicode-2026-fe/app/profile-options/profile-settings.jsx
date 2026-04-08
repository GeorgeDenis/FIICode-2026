import React, { useCallback, useState } from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
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
import * as ImagePicker from 'expo-image-picker';
import { errorToast, successToast } from '../../utils/toast';
import { parseTimeStringToDate } from '../../utils/utils_functions';

const ProfileSettings = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    profileImageUrl: null,
    skills: null,
    distanceLimitKm: null,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
  const [selectedSkills, setSelectedSkills] = useState(user?.skills || []);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';

  const AVAILABLE_SKILLS = [
    { id: 'PHYSICAL_HELP', label: 'Physical Help' },
    { id: 'MEDICAL', label: 'Medical Help/First aid' },
    { id: 'TOOLS', label: 'Tools and Equipment' },
    { id: 'TRANSPORT', label: 'Transport / Evacuation' },
    { id: 'PET_RESCUE', label: 'Pet Rescue' },
  ];

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills((prev) => prev.filter((item) => item !== skillId));
    } else {
      setSelectedSkills((prev) => [...prev, skillId]);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const {
        first_name,
        last_name,
        email,
        description,
        image,
        skills,
        distance_limit_km,
        quiet_hours_start,
        quiet_hours_end,
      } = response.data;
      setUser({
        firstName: first_name,
        lastName: last_name,
        description,
        email,
        profileImageUrl: image,
        skills,
        distanceLimitKm: distance_limit_km,
        quietHoursStart: quiet_hours_start,
        quietHoursEnd: quiet_hours_end,
      });
      setSelectedSkills([...skills]);
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
      errorToast('First name, last name cannot be empty.');
      return;
    }
    try {
      await api.put('/auth', {
        first_name: user.firstName,
        last_name: user.lastName,
        description: user.description,
        skills: selectedSkills,
        distance_limit_km: user.distanceLimitKm,
        quiet_hours_start: parseTimeStringToDate(user.quietHoursStart),
        quiet_hours_end: parseTimeStringToDate(user.quietHoursEnd),
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
    } else if (property === 'description') {
      const trimmedValue = value.trimStart();
      setUser({ ...user, description: trimmedValue });
    }
  };

  const initials =
    `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  const handlePickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      const imageAsset = result.assets[0];

      setUser({ ...user, profileImageUrl: imageAsset.uri });

      const formData = new FormData();

      formData.append('image', {
        uri: imageAsset.uri,
        name: 'profile_picture.jpg',
        type: 'image/jpeg',
      });

      try {
        await api.put('/auth/update-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        successToast('Profile picture updated!');
      } catch (error) {
        errorToast('Failed to upload image');
        console.error(error);
      }
    }
  };
  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Profile Settings',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="return-up-back-outline" size={20} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mt-5 flex flex-col items-center gap-5 px-5">
          <Pressable
            onPress={handlePickAndUploadImage}
            className="relative mb-4 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary shadow-sm active:opacity-70">
            {user.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} className="h-full w-full" />
            ) : (
              <Text className="text-3xl font-bold text-white">{initials || '?'}</Text>
            )}
            <View className="absolute bottom-0 w-full items-center bg-black/40 py-1">
              <Ionicons name="camera" size={12} color="#ffffff" />
            </View>
          </Pressable>
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
                value={user.description}
                className="min-h-[120px] w-[80%] text-text-main"
                onChangeText={(value) => handleSetProfileData(value, 'description')}
                placeholder="Describe yourself in a few words..."
              />
              <Ionicons name="clipboard-outline" color={iconColor} size={20} />
            </View>
          </View>
          <View className="mb-4 mt-6">
            <Text className="mb-3 text-lg font-bold text-text-main">
              How can you help the community?
            </Text>
            <Text className="mb-4 text-sm text-text-muted">
              Select the tags that suit you to be alerted in case of need.
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill.id);

                return (
                  <Pressable
                    key={skill.id}
                    onPress={() => toggleSkill(skill.id)}
                    className={`rounded-full border px-4 py-2 ${
                      isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'
                    }`}>
                    <Text
                      className={`font-semibold ${isSelected ? 'text-white' : 'text-text-main'}`}>
                      {skill.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="mb-4 flex flex-col items-start gap-2">
            <Pressable
              onPress={() => handleEditProfile()}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-btn-primary px-6 py-4 shadow-sm active:bg-btn-primary-active">
              <Text className="text-base font-bold text-white">Save profile</Text>
              <Check color="#ffffff" size={20} />
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

export default ProfileSettings;
