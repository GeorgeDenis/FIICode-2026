import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import MissionCard from './MissionCard';
import { useRouter } from 'expo-router';

const ActiveMissionCard = ({ mission }) => {
  const router = useRouter();
  return (
    <MissionCard mission={mission}>
      <TouchableOpacity
        className="items-center rounded-lg bg-blue-500 py-2"
        onPress={() => router.push(`/pulse-comments/${mission.pulse_id}`)}>
        <Text className="flex items-center justify-center font-semibold text-white">
          Go to Pulse
        </Text>
      </TouchableOpacity>
    </MissionCard>
  );
};

export default ActiveMissionCard;
