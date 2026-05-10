import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCrisis } from '../../hooks/useCrisis';
import { getCheckInsForCrisis } from '../../services/crisisService';
import { WS_BASE_URL } from '../../services/api';
import { useUser } from '../../hooks/useUser';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS = {
  'Safe': '#22C55E',
  'Need Help': '#EF4444',
  'Injured': '#F97316',
  'Available to Help': '#3B82F6',
};

const STATUS_LABELS = {
  'Safe': 'Safe',
  'Need Help': 'Need Help',
  'Injured': 'Injured',
  'Available to Help': 'Volunteer',
};

const SafetyMap = () => {
  const { user } = useUser();
  const { activeCrisis, isSurvivalMode } = useCrisis();
  const [region, setRegion] = useState(null);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckin, setSelectedCheckin] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: activeCrisis?.center_latitude || loc.coords.latitude,
        longitude: activeCrisis?.center_longitude || loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      setLoading(false);
    })();
  }, []);

  const fetchCheckins = async () => {
    if (!activeCrisis) return;
    try {
      const data = await getCheckInsForCrisis(activeCrisis.id);
      setCheckins(data);
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCheckins();

      const wsUrl = `${WS_BASE_URL}/crisis/${user?.user_id}`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'CHECKIN_UPDATE') {
            setCheckins((prev) => {
              const filtered = prev.filter((c) => c.id !== msg.data.id);
              return [...filtered, msg.data];
            });
          }
        } catch {}
      };

      return () => ws.close();
    }, [activeCrisis])
  );

  if (loading || !region) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0A0A0A]">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-2 text-gray-500">Loading safety map...</Text>
      </View>
    );
  }

  // SURVIVAL MODE: Disable MapView to save extreme amounts of battery
  if (isSurvivalMode) {
    return (
      <View className="flex-1 bg-black p-4">
        <View className="bg-yellow-900/40 border border-yellow-600 p-4 rounded-xl mb-4 items-center flex-row gap-3">
          <Ionicons name="battery-dead" size={24} color="#FBBF24" />
          <View className="flex-1">
            <Text className="text-yellow-400 font-bold">SURVIVAL MODE ACTIVE</Text>
            <Text className="text-yellow-500 text-xs">Map rendering disabled to conserve extreme battery.</Text>
          </View>
        </View>
        <Text className="text-white font-bold mb-2">Check-in Statuses near you:</Text>
        {checkins.length === 0 ? (
          <Text className="text-gray-500 text-sm">No check-ins available.</Text>
        ) : (
          checkins.map(c => (
            <View key={c.id} className="flex-row items-center gap-2 mb-2 p-2 border-b border-[#333]">
              <View className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[c.status] || '#6B7280' }} />
              <Text className="text-gray-300 font-medium">
                {c.user ? `${c.user.first_name} ${c.user.last_name}` : 'Unknown'}
              </Text>
              <Text className="text-gray-500 text-xs ml-auto">{c.status}</Text>
            </View>
          ))
        )}
      </View>
    );
  }

  const crisisCenter = activeCrisis?.center_latitude && activeCrisis?.center_longitude
    ? { latitude: activeCrisis.center_latitude, longitude: activeCrisis.center_longitude }
    : null;

  return (
    <View className="flex-1 bg-[#0A0A0A]">
      <View className="absolute top-2 left-2 right-2 z-10 flex-row flex-wrap gap-2 rounded-2xl bg-[#0A0A0A]/90 p-3">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <View key={key} className="flex-row items-center gap-1">
            <View
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[key] }}
            />
            <Text className="text-xs text-gray-300">{label}</Text>
          </View>
        ))}
        <Text className="text-xs text-gray-500 ml-auto">{checkins.length} check-ins</Text>
      </View>

      <MapView
        style={{ width: '100%', height: '100%' }}
        region={region}
        showsUserLocation
        userInterfaceStyle="dark">
        {crisisCenter && activeCrisis?.scope !== 'Global' && (
          <Circle
            center={crisisCenter}
            radius={activeCrisis.radius_meters || 1000}
            fillColor="rgba(239, 68, 68, 0.15)"
            strokeColor="rgba(239, 68, 68, 0.6)"
            strokeWidth={2}
          />
        )}

        {checkins.map((checkin) => {
          if (!checkin.latitude || !checkin.longitude) return null;
          const color = STATUS_COLORS[checkin.status] || '#6B7280';
          return (
            <Marker
              key={checkin.id}
              coordinate={{ latitude: checkin.latitude, longitude: checkin.longitude }}
              onPress={() => setSelectedCheckin(checkin)}
              pinColor={color}>
            </Marker>
          );
        })}
      </MapView>

      {selectedCheckin && (
        <View className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[#1A1A1A] border border-[#333] p-4">
          <Pressable
            onPress={() => setSelectedCheckin(null)}
            className="absolute top-2 right-2 p-1">
            <Ionicons name="close" size={16} color="#6B7280" />
          </Pressable>
          <View className="flex-row items-center gap-3">
            <View
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[selectedCheckin.status] || '#6B7280' }}
            />
            <View>
              <Text className="font-bold text-white">
                {selectedCheckin.user
                  ? `${selectedCheckin.user.first_name} ${selectedCheckin.user.last_name}`
                  : 'Unknown User'}
              </Text>
              <Text className="text-sm text-gray-400">
                Status: {selectedCheckin.status}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SafetyMap;
