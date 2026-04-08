import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Palette, SlidersHorizontal, UserRoundCog } from 'lucide-react-native';

const Settings = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
  const navigateTo = (link) => {
    router.push(link);
  };
  return (
    <ScrollView className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="return-up-back-outline" size={20} color={iconColor} />
            </Pressable>
          ),
        }}
      />
      <View className="mt-5 flex items-center gap-5 px-5">
        <Pressable
          onPress={() => navigateTo('/profile-options/profile-settings')}
          className="flex w-[95%] flex-row items-center justify-between gap-2 rounded-lg bg-surface px-3 py-4 shadow-sm">
          <Text className="font-bold text-text-main">Profile Settings</Text>
          <UserRoundCog size={20} color={iconColor} />
        </Pressable>

        <Pressable
          onPress={() => navigateTo('/profile-options/general-settings')}
          className="flex w-[95%] flex-row items-center justify-between gap-2 rounded-lg bg-surface px-3 py-4 shadow-sm">
          <Text className="font-bold text-text-main">General Settings</Text>
          <SlidersHorizontal size={20} color={iconColor} />
        </Pressable>
        <Pressable
          onPress={() => navigateTo('/profile-options/theme-settings')}
          className="flex w-[95%] flex-row items-center justify-between gap-2 rounded-lg bg-surface px-3 py-4 shadow-sm">
          <Text className="font-bold text-text-main">Theme</Text>
          <Palette size={20} color={iconColor} />
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Settings;
