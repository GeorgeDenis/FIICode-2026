import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  getActiveCrises,
  getAllIncidentTypes,
  resolveCrisis,
} from '../../../services/crisisService';
import { errorToast, successToast } from '../../../utils/toast';
import IncidentTypeManager from './IncidentTypeManager';
import CrisisActivateModal from './CrisisActivateModal';
import { useCrisis } from '../../../hooks/useCrisis';

const CrisisDashboard = () => {
  const { refreshCrisisStatus } = useCrisis();
  const [activeCrises, setActiveCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activateModalVisible, setActivateModalVisible] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('active');

  const fetchData = async () => {
    setLoading(true);
    try {
      const crises = await getActiveCrises();
      setActiveCrises(crises);
    } catch (error) {
      console.error('Failed to fetch crises:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const handleResolve = async (crisisId) => {
    try {
      await resolveCrisis(crisisId);
      successToast('Crisis resolved');
      fetchData();
      refreshCrisisStatus();
    } catch (error) {
      errorToast('Failed to resolve crisis');
    }
  };

  const renderSubTab = (key, label) => (
    <Pressable
      className={`mx-1 rounded-full px-3 py-1.5 ${activeSubTab === key ? 'bg-red-600' : 'bg-gray-700'}`}
      onPress={() => setActiveSubTab(key)}>
      <Text className={`text-sm font-semibold ${activeSubTab === key ? 'text-white' : 'text-gray-300'}`}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row">
          {renderSubTab('active', 'Active')}
          {renderSubTab('types', 'Types')}
        </View>
        <Pressable
          onPress={() => setActivateModalVisible(true)}
          className="rounded-full bg-red-600 px-4 py-2 active:bg-red-700">
          <Text className="font-bold text-white">Activate Crisis</Text>
        </Pressable>
      </View>

      {activeSubTab === 'active' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#EF4444" className="mt-10" />
          ) : activeCrises.length === 0 ? (
            <View className="mt-10 items-center">
              <Ionicons name="shield-checkmark" size={48} color="#22C55E" />
              <Text className="mt-3 text-lg font-bold text-gray-500">No active crises</Text>
            </View>
          ) : (
            activeCrises.map((crisis) => (
              <View
                key={crisis.id}
                className="mb-3 rounded-2xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="warning" size={20} color="#EF4444" />
                    <Text className="font-bold text-red-700 dark:text-red-400">
                      {crisis.crisis_label || crisis.incident_type?.name || 'Crisis'}
                    </Text>
                  </View>
                  <View className="rounded-full bg-red-200 px-2 py-0.5 dark:bg-red-800">
                    <Text className="text-xs font-bold text-red-700 dark:text-red-300">
                      {crisis.scope}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Reports: {crisis.report_count} • Confidence: {Math.round(crisis.confidence_score * 100)}%
                </Text>
                {crisis.radius_meters && (
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Radius: {crisis.radius_meters}m
                  </Text>
                )}
                <Pressable
                  onPress={() => handleResolve(crisis.id)}
                  className="self-end rounded-full bg-emerald-600 px-4 py-2 active:bg-emerald-700">
                  <Text className="font-semibold text-white">Resolve</Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {activeSubTab === 'types' && <IncidentTypeManager />}

      <CrisisActivateModal
        visible={activateModalVisible}
        onClose={() => { setActivateModalVisible(false); fetchData(); }}
      />
    </View>
  );
};

export default CrisisDashboard;
