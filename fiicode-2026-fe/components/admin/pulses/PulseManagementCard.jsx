import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Trash2 } from 'lucide-react-native';

const PulseManagementCard = ({ pulse, onDelete, onToggleVisibility }) => {
  const router = useRouter();

  const authorInitials =
    `${pulse.author?.first_name?.charAt(0) || ''}${pulse.author?.last_name?.charAt(0) || ''}`.toUpperCase();

  const handleDelete = () => {
    Alert.alert(
      'Restrict Pulse',
      `Are you sure you want to delete and restrict this pulse? The author will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restrict', onPress: () => onDelete(pulse.id), style: 'destructive' },
      ]
    );
  };

  const handleToggleVisibility = () => {
    Alert.alert(
      `${pulse.is_visible ? 'Hide' : 'Unhide'} Pulse`,
      `Are you sure you want to ${pulse.is_visible ? 'hide' : 'unhide'} this pulse? The author will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: pulse.is_visible ? 'Hide' : 'Unhide',
          onPress: () => onToggleVisibility(pulse.id, !pulse.is_visible),
        },
      ]
    );
  };

  const getUrgencyColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    }
  };

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center space-x-2">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              {pulse.author?.image ? (
                <Image
                  source={{ uri: pulse.author.image }}
                  className="h-full w-full rounded-full"
                />
              ) : (
                <Text className="font-bold text-slate-500">{authorInitials || '?'}</Text>
              )}
            </View>
            <View className="px-2">
              <Text className="font-semibold text-slate-800 dark:text-slate-100">
                {pulse.author?.first_name} {pulse.author?.last_name}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(pulse.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View className="mt-3">
            <Text
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
              numberOfLines={3}>
              {pulse.content}
            </Text>
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className={`rounded-lg px-2 py-1 ${getUrgencyColor(pulse.urgency_level)}`}>
              <Text className="text-xs font-bold">{pulse.urgency_level}</Text>
            </View>
            <View className="rounded-lg bg-indigo-50 px-2 py-1 dark:bg-indigo-900/20">
              <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {pulse.type}
              </Text>
            </View>
            {!pulse.is_visible && (
              <View className="rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Text className="text-xs font-bold text-slate-500">Hidden</Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={() => router.push({ pathname: `/pulse-comments/[id]`, params: { id: pulse.id } })}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
          </Pressable>

          <Pressable
            onPress={handleToggleVisibility}
            className={`h-10 w-10 items-center justify-center rounded-full ${pulse.is_visible ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
            <Ionicons
              name={pulse.is_visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={pulse.is_visible ? '#D97706' : '#10B981'}
            />
          </Pressable>

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

export default PulseManagementCard;
