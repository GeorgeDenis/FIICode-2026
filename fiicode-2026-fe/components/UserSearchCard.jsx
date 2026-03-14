import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const UserSearchCard = ({ user }) => {
  const router = useRouter();

  const initials =
    `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  return (
    <Pressable onPress={() => router.push(`/profiles/${user.id}`)}>
      <View className="bg-surface border-primary/20 mb-3 flex flex-row items-center gap-2 rounded-xl border p-4 shadow-sm">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
          <Text className="text-xl font-bold text-white">{initials || '?'}</Text>
        </View>
        <Text>
          {user.first_name} {user.last_name}
        </Text>
      </View>
    </Pressable>
  );
};

export default UserSearchCard;
