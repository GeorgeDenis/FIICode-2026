import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { errorToast, successToast } from '../../../utils/toast';
import PulseManagementCard from './PulseManagementCard';

const PulseDashboard = () => {
  const [pulses, setPulses] = useState([]);
  const [filteredPulses, setFilteredPulses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPulses = async () => {
    try {
      const response = await api.get('/pulse');
      setPulses(response.data);
      setFilteredPulses(response.data);
    } catch (error) {
      errorToast('Failed to fetch pulses: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPulses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPulses(pulses);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = pulses.filter((pulse) => {
        const authorName = `${pulse.author?.first_name} ${pulse.author?.last_name}`.toLowerCase();
        return (
          pulse.content.toLowerCase().includes(lowerQuery) || authorName.includes(lowerQuery)
        );
      });
      setFilteredPulses(filtered);
    }
  }, [searchQuery, pulses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPulses();
  }, []);

  const handleDeletePulse = async (pulseId) => {
    try {
      await api.delete(`/pulse/${pulseId}`);
      successToast('Pulse restricted successfully');
      fetchPulses();
    } catch (error) {
      errorToast('Failed to restrict pulse: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleVisibility = async (pulseId, newVisibility) => {
    try {
      await api.put(`/pulse/visible/${pulseId}`, null, {
        params: { visible: newVisibility },
      });
      successToast(`Pulse ${newVisibility ? 'unhidden' : 'hidden'} successfully`);
      fetchPulses();
    } catch (error) {
      errorToast(
        'Failed to update visibility: ' + (error.response?.data?.detail || error.message)
      );
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-slate-500">Loading pulses...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="px-4 pt-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-2 flex-1 text-base text-slate-800 dark:text-slate-100"
            placeholder="Search pulses by content or author..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      <FlatList
        data={filteredPulses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PulseManagementCard
            pulse={item}
            onDelete={handleDeletePulse}
            onToggleVisibility={handleToggleVisibility}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center pt-20">
            <Ionicons name="flash-outline" size={80} color="#CBD5E1" />
            <Text className="mt-4 text-xl font-medium text-slate-400">No pulses found</Text>
          </View>
        }
      />
    </View>
  );
};

export default PulseDashboard;
