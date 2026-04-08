import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import MissionCard from './MissionCard';

const ActiveMissionCard = ({ mission }) => {
  return (
    <MissionCard mission={mission}>
      <TouchableOpacity className="bg-blue-500 rounded-lg py-2 items-center" onPress={() => console.log('Viewing details of active mission: ', mission.id)}>
        <Text className="text-white font-semibold flex items-center justify-center">View Details</Text>
      </TouchableOpacity>
    </MissionCard>
  );
};

export default ActiveMissionCard;
