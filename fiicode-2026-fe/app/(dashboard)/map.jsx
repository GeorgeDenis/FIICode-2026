import React from 'react';
import { View } from 'react-native';
import MapScreen from '../../components/map/MapScreen';
import SafetyMap from '../../components/crisis/SafetyMap';
import { useCrisis } from '../../hooks/useCrisis';

const Map = () => {
  const { isCrisisActive } = useCrisis();

  return (
    <View className="flex-1 bg-background">
      {isCrisisActive ? <SafetyMap /> : <MapScreen />}
    </View>
  );
};

export default Map;
