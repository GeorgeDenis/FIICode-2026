import React from 'react';
import { View, Text } from 'react-native';

const MissionCard = ({ mission, children }) => {
  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <View className="flex flex-row justify-between items-center mb-2">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          {mission.pulse?.content || 'Untitled Mission'}
        </Text>
        <View className="rounded-full bg-blue-100 px-3 py-1">
          <Text className="text-xs font-semibold text-blue-800">{mission.pulse?.type || 'Unknown'}</Text>
        </View>
      </View>
      <View className="mb-2 flex flex-row gap-2">
        <Text className="text-sm text-gray-600">Urgency: <Text className="font-semibold">{mission.pulse?.urgency_level || 'Unknown'}</Text></Text>
        <Text className="text-sm text-gray-400">|</Text>
        <Text className="text-sm text-gray-600">Status: <Text className="font-semibold">{mission.status}</Text></Text>
      </View>
      
      {children && (
        <View className="mt-4 border-t border-gray-100 pt-3">
          {children}
        </View>
      )}
    </View>
  );
};

export default MissionCard;
