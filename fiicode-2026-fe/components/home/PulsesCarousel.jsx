import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import PulseCard from './PulseCard';

const PulsesCarousel = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pulses, setPulses] = useState();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchPulses = async () => {
        try {
          const response = await api.get('/pulse/account');
          setPulses(response.data);
        } catch (error) {
          if (error.response && error.response.status === 403) {
            return;
          }
          errorToast(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchPulses();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleNavigation = (id) => {
    router.push({
      pathname: `/pulse-comments/${id}`,
    });
  };

  if (loading) {
    return (
      <View className="mx-4 mb-4 h-32 items-center justify-center rounded-3xl bg-surface shadow-sm">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  if (!pulses) return null;

  return (
    <FlatList
      horizontal
      data={pulses}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      renderItem={({ item }) => (
        <PulseCard pulse={item} onPress={() => handleNavigation(item.id)} />
      )}
    />
  );
};

export default PulsesCarousel;
