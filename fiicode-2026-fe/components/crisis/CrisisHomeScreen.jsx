import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCrisis } from '../../hooks/useCrisis';
import { useLocation } from '../../hooks/useLocation';
import SafetyCheckIn from './SafetyCheckIn';
import ReportIncidentModal from './ReportIncidentModal';

const CrisisHomeScreen = () => {
  const router = useRouter();
  const { activeCrisis } = useCrisis();
  const { location } = useLocation();
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const typeName = activeCrisis?.incident_type?.name || 'Emergency';
  const label = activeCrisis?.crisis_label || typeName;
  const scope = activeCrisis?.scope === 'Global' ? 'City-Wide' : 'Local Area';
  const createdAt = activeCrisis?.created_at
    ? new Date(activeCrisis.created_at).toLocaleTimeString()
    : '';

  return (
    <ScrollView className="flex-1 bg-[#0A0A0A]" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mx-4 mt-4 rounded-2xl bg-red-900/40 border-2 border-red-800 p-5">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="rounded-full bg-red-600 p-3">
            <Ionicons name="warning" size={28} color="#FFF" />
          </View>
          <View className="flex-shrink">
            <Text className="text-xs font-bold text-red-400 tracking-widest">
              CRISIS MODE ACTIVE
            </Text>
            <Text className="text-2xl font-extrabold text-white">{label}</Text>
          </View>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="location" size={14} color="#F87171" />
            <Text className="text-sm text-red-300">{scope}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="time" size={14} color="#F87171" />
            <Text className="text-sm text-red-300">Since {createdAt}</Text>
          </View>
          {activeCrisis?.report_count > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="people" size={14} color="#F87171" />
              <Text className="text-sm text-red-300">{activeCrisis.report_count} reports</Text>
            </View>
          )}
        </View>
      </View>

      <SafetyCheckIn />

      <View className="mx-4 mt-6">
        <Text className="text-sm font-bold text-gray-500 mb-3 tracking-widest">QUICK ACTIONS</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setReportModalVisible(true)}
            className="flex-1 items-center rounded-2xl bg-red-900/50 border border-red-800 p-4 active:bg-red-900">
            <Ionicons name="alert-circle" size={32} color="#F87171" />
            <Text className="mt-2 text-sm font-bold text-red-300">Report Incident</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('tel:123')}
            className="flex-1 items-center rounded-2xl bg-blue-900/50 border border-blue-800 p-4 active:bg-blue-900">
            <Ionicons name="call" size={32} color="#60A5FA" />
            <Text className="mt-2 text-sm font-bold text-blue-300">Emergency Call</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(dashboard)/map')}
            className="flex-1 items-center rounded-2xl bg-amber-900/50 border border-amber-800 p-4 active:bg-amber-900">
            <Ionicons name="map" size={32} color="#FCD34D" />
            <Text className="mt-2 text-sm font-bold text-amber-300">Safety Map</Text>
          </Pressable>
        </View>
      </View>

      <View className="mx-4 mt-6">
        <Text className="text-sm font-bold text-gray-500 mb-3 tracking-widest">
          EMERGENCY GUIDELINES
        </Text>
        <View className="rounded-2xl bg-[#1A1A1A] border border-[#333] p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <Ionicons name="battery-charging" size={20} color="#FCD34D" />
            <Text className="text-sm text-gray-300 flex-shrink">
              Save battery — reduce screen brightness and close unused apps
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="water" size={20} color="#60A5FA" />
            <Text className="text-sm text-gray-300 flex-shrink">
              Secure clean water and essential supplies
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="people" size={20} color="#34D399" />
            <Text className="text-sm text-gray-300 flex-shrink">
              Check on neighbors — especially elderly and disabled
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Ionicons name="radio" size={20} color="#F87171" />
            <Text className="text-sm text-gray-300 flex-shrink">
              Follow official instructions from emergency services
            </Text>
          </View>
        </View>
      </View>

      <ReportIncidentModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </ScrollView>
  );
};

export default CrisisHomeScreen;
