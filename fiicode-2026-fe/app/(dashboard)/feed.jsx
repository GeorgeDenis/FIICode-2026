import React, { useCallback, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { IP_CONFIG } from '../../services/api';
import AnimatedPulse from '../../components/AnimatedPulse';

const Feed = () => {
  const [pulses, setPulses] = useState([]);

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

        setPulses((prevPulses) => [newPulse, ...prevPulses]);
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
  const renderPulse = ({ item }) => <AnimatedPulse item={item} />;
  return (
    <View className="flex-1 bg-background p-4">
      <FlatList
        data={pulses}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderPulse}
        ListEmptyComponent={
          <Text className="mt-10 text-center text-text opacity-50">
            No pulses yet. Be the first to share your thoughts!
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Feed;
