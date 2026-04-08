import React from 'react';
import MissionCard from './MissionCard';
import { Text, View } from 'react-native';

const HistoryMissionCard = ({ mission }) => {
  return (
    <MissionCard mission={mission}>
      <View className="bg-gray-100 rounded-lg p-2">
        <Text className="text-xs text-gray-500 text-center">
           This mission is archived. {mission.isOwner ? 'You were the owner.' : 'You were a participant.'}
        </Text>
      </View>
    </MissionCard>
  );
};

export default HistoryMissionCard;
