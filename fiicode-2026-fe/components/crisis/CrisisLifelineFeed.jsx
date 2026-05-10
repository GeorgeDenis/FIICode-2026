import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { WS_BASE_URL } from '../../services/api';
import { useCrisis } from '../../hooks/useCrisis';
import LifelinePulseCard from './LifelinePulseCard';
import QuickEmergencyPulse from './QuickEmergencyPulse';
import { Ionicons } from '@expo/vector-icons';
import VoiceSOSButton from './VoiceSOSButton';

const CrisisLifelineFeed = () => {
  const { activeCrisis, isSurvivalMode } = useCrisis();
  const [pulses, setPulses] = useState([]);
  const [activeTab, setActiveTab] = useState('lifeline');
  const [quickPulseVisible, setQuickPulseVisible] = useState(false);

  const handleFetchPulses = async () => {
    try {
      const response = await api.get('/pulse');
      setPulses(response.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      handleFetchPulses();

      const wsUrl = `${WS_BASE_URL}/feed`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (e) => {
        const newPulse = JSON.parse(e.data);
        setPulses((prev) => {
          const clean = prev.filter((p) => p.id !== newPulse.id);
          return [newPulse, ...clean];
        });
      };

      return () => ws.close();
    }, [])
  );

  const lifelinePulses = pulses
    .filter((p) => p.type === 'Emergency' && p.is_visible)
    .sort((a, b) => {
      // Primary: newest first
      const dateDiff = new Date(b.created_at) - new Date(a.created_at);
      if (dateDiff !== 0) return dateDiff;

      // Tie-break 1: urgency
      const urgencyOrder = { High: 0, Medium: 1, Low: 2 };
      const aUrg = urgencyOrder[a.urgency_level] ?? 2;
      const bUrg = urgencyOrder[b.urgency_level] ?? 2;
      if (aUrg !== bUrg) return aUrg - bUrg;

      // Tie-break 2: verified / authority
      const aVerified = a.is_verified || a.author?.role >= 1 ? 0 : 1;
      const bVerified = b.is_verified || b.author?.role >= 1 ? 0 : 1;
      return aVerified - bVerified;
    });

  const regularPulses = pulses
    .filter((p) => p.type !== 'Emergency' && p.is_visible)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const displayedPulses = activeTab === 'lifeline' ? lifelinePulses : regularPulses;

  return (
    <View className={`flex-1 ${isSurvivalMode ? 'bg-[#000000]' : 'bg-[#0A0A0A]'}`}>
      {isSurvivalMode && (
        <View className="bg-amber-600 px-4 py-2 flex-row items-center justify-center gap-2">
          <Ionicons name="battery-dead" size={18} color="#FFF" />
          <Text className="text-white font-bold text-xs">SURVIVAL MODE ACTIVE</Text>
        </View>
      )}
      <View className="flex-row gap-2 px-4 pb-2 pt-3">
        <Pressable
          onPress={() => setActiveTab('lifeline')}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
            activeTab === 'lifeline'
              ? 'border-2 border-red-400 bg-red-600'
              : 'border-2 border-[#333] bg-[#1A1A1A]'
          }`}>
          <Ionicons name="pulse" size={18} color={activeTab === 'lifeline' ? '#FFF' : '#F87171'} />
          <Text
            className={`font-bold ${activeTab === 'lifeline' ? 'text-white' : 'text-gray-400'}`}>
            Lifeline
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('regular')}
          className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3 ${
            activeTab === 'regular'
              ? 'border-2 border-gray-400 bg-gray-600'
              : 'border-2 border-[#333] bg-[#1A1A1A]'
          }`}>
          <Ionicons
            name="chatbubbles"
            size={18}
            color={activeTab === 'regular' ? '#FFF' : '#9CA3AF'}
          />
          <Text className={`font-bold ${activeTab === 'regular' ? 'text-white' : 'text-gray-500'}`}>
            Regular
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={displayedPulses}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => <LifelinePulseCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Ionicons
              name={activeTab === 'lifeline' ? 'pulse' : 'chatbubbles'}
              size={48}
              color="#333"
            />
            <Text className="mt-3 text-lg font-bold text-gray-600">
              {activeTab === 'lifeline' ? 'No emergency pulses yet' : 'No regular posts'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <View className="absolute bottom-4 left-5 z-10">
        <VoiceSOSButton refetch={handleFetchPulses} />
      </View>

      <Pressable
        className="absolute bottom-4 right-5 z-10 rounded-full bg-red-600 p-4 shadow-lg active:bg-red-700"
        onPress={() => setQuickPulseVisible(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {quickPulseVisible && (
        <QuickEmergencyPulse
          visible={quickPulseVisible}
          onClose={() => setQuickPulseVisible(false)}
          refetch={handleFetchPulses}
        />
      )}
    </View>
  );
};

export default CrisisLifelineFeed;
