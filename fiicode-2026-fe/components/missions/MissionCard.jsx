import React from 'react';
import { View, Text } from 'react-native';

const MissionCard = ({ mission, children }) => {
  return (
    <View className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mb-2 flex flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          {mission.pulse?.content || 'Untitled Mission'}
        </Text>
        <View className="rounded-full bg-blue-100 px-3 py-1">
          <Text className="text-xs font-semibold text-blue-800">
            {mission.pulse?.type || 'Unknown'}
          </Text>
        </View>
      </View>
      <View className="mb-2 flex flex-row gap-2">
        <Text className="text-sm text-gray-600">
          Urgency:{' '}
          <Text className="font-semibold">{mission.pulse?.urgency_level || 'Unknown'}</Text>
        </Text>
        <Text className="text-sm text-gray-400">|</Text>
        <Text className="text-sm text-gray-600">
          Status: <Text className="font-semibold">{mission.status}</Text>
        </Text>
      </View>
      <View className="mb-2 flex flex-col gap-2">
        <Text className="text-sm text-gray-600">
          Feedback: <Text className="font-semibold">{mission.feedback_text}</Text>
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={4}>
          Feedback type: <Text className="font-semibold">{mission.feedback_type}</Text>
        </Text>
      </View>

      {children && <View className="mt-4 border-t border-gray-100 pt-3">{children}</View>}
    </View>
  );
};

export default MissionCard;
