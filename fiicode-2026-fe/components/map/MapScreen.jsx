import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { useFocusEffect } from 'expo-router';
import { Circle } from 'react-native-svg';
import PulsePin from './PulsePin';

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pulses, setPulses] = useState({});

  const handleFetchPulses = async () => {
    try {
      const response = await api.get('/pulse');
      setPulses(response.data);
    } catch (error) {
      errorToast(error.message);
    }
  };
  useFocusEffect(
    useCallback(() => {
      handleFetchPulses();
    }, [])
  );
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('You need to grant location permissions to see the map centered on you!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={{ flex: 1, width: '100%', height: '50%' }}>
      {!region ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{errorMsg || 'Searching...'}</Text>
        </View>
      ) : (
        <MapView style={{ flex: 1 }} region={region} showsUserLocation={true}>
          <Circle
            center={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            radius={500}
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor="rgba(59, 130, 246, 0.8)"
            strokeWidth={2}
          />

          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            pinColor={'blue'}
            title="Your location"
          />
          {pulses &&
            pulses.length > 0 &&
            pulses.map((pulse) => <PulsePin key={pulse.id} pulse={pulse} />)}
        </MapView>
      )}
    </View>
  );
}
