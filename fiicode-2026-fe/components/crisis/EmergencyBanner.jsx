import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCrisis } from '../../hooks/useCrisis';
import { useRouter } from 'expo-router';

const CRISIS_ICONS = {
  'Power Outage': 'flash-off',
  'Blackout': 'flash-off',
  'Fire': 'flame',
  'Flood': 'water',
  'Earthquake': 'earth',
  'Severe Storm': 'thunderstorm',
  'Road Blockage': 'car',
  'Infrastructure Damage': 'construct',
};

const EmergencyBanner = () => {
  const { isCrisisActive, activeCrisis } = useCrisis();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  useEffect(() => {
    if (!isCrisisActive) return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [isCrisisActive]);

  if (!isCrisisActive || !activeCrisis) return null;

  const typeName = activeCrisis.incident_type?.name || 'Emergency';
  const iconName = CRISIS_ICONS[typeName] || 'warning';
  const label = activeCrisis.crisis_label || typeName;
  const scope = activeCrisis.scope === 'Global' ? 'CITY-WIDE' : 'LOCAL';

  return (
    <Animated.View
      style={{ opacity: pulseAnim }}
      className="mx-4 mt-2 mb-2 rounded-2xl bg-red-600 px-4 py-3 shadow-lg">
      <Pressable
        onPress={() => router.push('/(dashboard)/home')}
        className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="rounded-full bg-red-800 p-2">
            <Ionicons name={iconName} size={20} color="#FFFFFF" />
          </View>
          <View className="flex-shrink">
            <Text className="text-xs font-bold text-red-200">{scope} CRISIS</Text>
            <Text className="text-base font-extrabold text-white" numberOfLines={1}>
              {label.toUpperCase()}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
};

export default EmergencyBanner;
