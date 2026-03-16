import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const UserSearchCard = ({ user }) => {
  const router = useRouter();

  const initials =
    `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <Pressable onPress={() => router.push(`/profiles/${user.id}`)}>
      <View className="mb-3 flex flex-row items-center justify-between rounded-xl bg-surface  p-4 shadow-sm">
        <View className="flex flex-row items-center gap-5">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Text className="text-xl font-bold text-white">{initials || '?'}</Text>
          </View>
          <View className="flex items-start gap-2">
            <Text className="font-bold text-text-main">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-text-muted">{user.email}</Text>
          </View>
        </View>
        <View className="rounded-full bg-primary p-1">
          <Ionicons name="chevron-forward" size={24} color="#ffffff" className="ml-auto" />
        </View>
      </View>
    </Pressable>
  );
};

export default UserSearchCard;
