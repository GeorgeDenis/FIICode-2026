import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PulseCard = ({ pulse, onPress }) => {
  const getInitials = (first, last) => {
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'H';
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case 'Emergency':
        return {
          bg: 'bg-rose-100',
          text: 'text-rose-600',
          icon: 'alert-circle',
          label: 'Emergency',
        };
      case 'Item':
        return {
          bg: 'bg-emerald-100',
          text: 'text-emerald-600',
          icon: 'hand-left',
          label: 'Item',
        };
      default:
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          icon: 'information-circle',
          label: 'Skill',
        };
    }
  };

  const config = getTypeConfig(pulse.type);

  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-[280px] rounded-3xl border border-gray-100 bg-white p-4 shadow-sm active:bg-gray-50">
      <View className="mb-3 flex-row items-center justify-between">
        <View className={`flex-row items-center rounded-full px-2.5 py-1 ${config.bg}`}>
          <Ionicons name={config.icon} size={14} className={config.text} color="currentColor" />
          <Text className={`ml-1 text-xs font-bold ${config.text}`}>{config.label}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="location-outline" size={12} color="#6b7280" />
          <Text className="ml-1 text-xs font-medium text-gray-500">Near you</Text>
        </View>
      </View>

      <Text className="mb-4 text-sm font-semibold leading-5 text-gray-800" numberOfLines={2}>
        {pulse.content}
      </Text>

      <View className="mt-auto flex-row items-center justify-between border-t border-gray-50 pt-3">
        <View className="flex-row items-center">
          {pulse.author?.image ? (
            <Image
              source={{ uri: pulse.author.image }}
              className="h-8 w-8 rounded-full bg-gray-200"
            />
          ) : (
            <View className="bg-primary/20 h-8 w-8 items-center justify-center rounded-full">
              <Text className="font-bold text-primary">
                {getInitials(pulse.author?.first_name, pulse.author?.last_name)}
              </Text>
            </View>
          )}
          <Text className="ml-2 text-xs font-bold text-gray-700">{pulse.author?.first_name}</Text>
        </View>

        <Ionicons name="chevron-forward-circle" size={24} color="#10b981" />
      </View>
    </Pressable>
  );
};

export default PulseCard;
