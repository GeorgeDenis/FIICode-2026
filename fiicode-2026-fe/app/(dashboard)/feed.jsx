import React, { useCallback, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { IP_CONFIG } from '../../services/api';
import AnimatedPulse from '../../components/feed/AnimatedPulse';
import { Ionicons } from '@expo/vector-icons';
import FeedFilterPopup from '../../components/feed/FeedFilterPopup';
import AddPulseModal from '../../components/feed/AddPulseModal';
import NoPulse from '../../assets/img/no_pulses.png';
import EditPulseModal from '../../components/feed/EditPulseModal';

const Feed = () => {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [pulses, setPulses] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    type: null,
    urgencyLevel: null,
    sortBy: 'DATE (NEWEST)',
  });
  const [selectedPulse, setSelectedPulse] = useState(null);
  const [isAddPulseModalVisible, setIsAddPulseModalVisible] = useState(false);
  const [isEditPulseModalVisible, setIsEditPulseModalVisible] = useState(false);

  const handleFetchPulses = async () => {
    try {
      const response = await api.get('/pulse');
      setPulses(response.data);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
      handleFetchPulses();

      const wsUrl = `ws://${IP_CONFIG}:8000/ws/feed`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection open');
      };

      ws.onmessage = (e) => {
        const newPulse = JSON.parse(e.data);
        setPulses((prevPulses) => {
          const cleanPulses = prevPulses.filter((pulse) => pulse.id !== newPulse.id);

          return [newPulse, ...cleanPulses];
        });
      };

      ws.onerror = (error) => {
        console.error('Eroare WebSocket:', error.message);
      };

      ws.onclose = () => {
        console.log('Deconectat de la WebSocket.');
      };

      return () => {
        ws.close();
      };
    }, [])
  );

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const filteredPulses = pulses
    .filter((pulse) => {
      const matchesType = activeFilters.type ? pulse.type === activeFilters.type : true;
      const matchesUrgency = activeFilters.urgency
        ? pulse.urgency_level === activeFilters.urgency
        : true;
      return matchesType && matchesUrgency;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      if (activeFilters.sortBy === 'OLDEST') {
        return dateA - dateB;
      }
      return dateB - dateA;
    });

  const openEditPulseModal = (pulse) => {
    setSelectedPulse(pulse);
    setIsEditPulseModalVisible(true);
  };

  const renderPulse = ({ item }) => (
    <AnimatedPulse item={item} openEditPulseModal={openEditPulseModal} />
  );

  return (
    <View className="flex-1 bg-background p-4">
      <Pressable
        onPress={() => setIsFilterVisible(true)}
        className="m-2 items-center self-end rounded-xl bg-primary p-2">
        <Ionicons name="filter" size={20} color="#ffffff" />
      </Pressable>
      <FeedFilterPopup
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApply={handleApplyFilters}
      />
      <Pressable
        className="absolute  bottom-0 right-5 z-10 mb-4 justify-center self-end rounded-full bg-primary p-3"
        onPress={() => setIsAddPulseModalVisible(!isAddPulseModalVisible)}>
        <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
      </Pressable>
      <FlatList
        data={filteredPulses}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderPulse}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        ListEmptyComponent={
          <View className="mt-20 flex-1 items-center justify-center gap-2 rounded-xl">
            <Image source={NoPulse} className="h-40 w-40" />
            <Text className="text-3xl font-bold">No pulses yet.</Text>
            <Text className="text-base ">Be the first one to talk with the community.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      {isAddPulseModalVisible && (
        <AddPulseModal
          setIsAddPulseModalVisible={setIsAddPulseModalVisible}
          isAddPulseModalVisible={isAddPulseModalVisible}
        />
      )}
      {isEditPulseModalVisible && (
        <EditPulseModal
          setIsEditPulseModalVisible={setIsEditPulseModalVisible}
          isEditPulseModalVisible={isEditPulseModalVisible}
          pulse={selectedPulse}
        />
      )}
    </View>
  );
};

export default Feed;
