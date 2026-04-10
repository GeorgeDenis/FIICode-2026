import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ShieldCheck, Trash2 } from 'lucide-react-native';

const UserManagementCard = ({ user, onDelete, onPromote }) => {
  const router = useRouter();

  const initials =
    `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();

  const handlePromote = () => {
    Alert.alert(
      'Promote User',
      `Are you sure you want to promote ${user.first_name} ${user.last_name} to Admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Promote', onPress: () => onPromote(user.id), style: 'default' },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => onDelete(user.id), style: 'destructive' },
      ]
    );
  };

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            {user.image ? (
              <Image source={{ uri: user.image }} className="h-full w-full rounded-full" />
            ) : (
              <Text className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
                {initials || '?'}
              </Text>
            )}
          </View>
          <View className="px-3">
            <Text className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {user.first_name} {user.last_name}
            </Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400">{user.email}</Text>
            <View className="mt-1 self-start rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {user.role === 1 ? 'Admin' : 'User'}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={() => router.push(`/profiles/${user.id}`)}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
          </Pressable>

          {user.role !== 1 && (
            <Pressable
              onPress={handlePromote}
              className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30">
              <ShieldCheck size={20} color="#10B981" />
            </Pressable>
          )}

          <Pressable
            onPress={handleDelete}
            className="h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30">
            <Trash2 size={20} color="#F43F5E" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default UserManagementCard;
