import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { useFocusEffect } from 'expo-router';
import { Circle } from 'react-native-svg';
import PulsePin from './PulsePin';
import { Ionicons } from '@expo/vector-icons';
import PulseFilterPopup from './PulseFilterPopup';
import { computeHaversineDistance } from '../../utils/utils_functions';
import { useLocation } from '../../hooks/useLocation';

export default function MapScreen() {
  const { location, loading: locationLoading } = useLocation();
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pulses, setPulses] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: null,
    urgencyLevel: null,
    status: '',
    distance: null,
  });

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

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const filteredPulses = pulses.filter((pulse) => {
    const matchesType = activeFilters.type ? pulse.type === activeFilters.type : true;
    const matchesUrgency = activeFilters.urgency
      ? pulse.urgency_level === activeFilters.urgency
      : true;
    const matchesStatus = activeFilters.status ? pulse.status === activeFilters.status : true;
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    const distanceH = computeHaversineDistance(
      latitude,
      longitude,
      pulse.latitude,
      pulse.longitude
    );
    const distanceLimit = activeFilters.distance ? distanceH <= activeFilters.distance : true;
    return matchesType && matchesUrgency && matchesStatus && distanceLimit;
  });
  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#FF0000" />
        <Text className="mt-2 text-gray-500">GPS search</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <View className="absolute right-1 top-1 z-10">
        <Pressable
          onPress={() => setIsFilterVisible(true)}
          className="m-2 items-center self-end rounded-xl bg-primary p-2">
          <Ionicons name="filter" size={20} color="#ffffff" />
        </Pressable>
        <PulseFilterPopup
          visible={isFilterVisible}
          onClose={() => setIsFilterVisible(false)}
          onApply={handleApplyFilters}
        />
      </View>

      {!region ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{errorMsg || 'Searching...'}</Text>
        </View>
      ) : (
        <MapView style={{ width: '100%', height: '100%' }} region={region} showsUserLocation={true}>
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
            pinColor={'purple'}
            title="Your location"
          />
          {filteredPulses &&
            filteredPulses.length > 0 &&
            filteredPulses.map((pulse) => <PulsePin key={pulse.id} pulse={pulse} />)}
        </MapView>
      )}
    </View>
  );
}
