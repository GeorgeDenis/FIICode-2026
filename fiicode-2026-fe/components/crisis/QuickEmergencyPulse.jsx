import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';
import { useLocation } from '../../hooks/useLocation';
import { errorToast, successToast } from '../../utils/toast';

const EMERGENCY_TYPES = [
  { label: 'Medical Help', value: 'Medical Help', icon: 'medkit' },
  { label: 'Water / Shelter', value: 'Water Needed', icon: 'water' },
  { label: 'SOS', value: 'SOS', icon: 'alert-circle' },
  { label: 'Missing Person', value: 'Missing Person', icon: 'person' },
  { label: 'Road Blocked', value: 'Road Blocked', icon: 'car' },
  { label: 'Evacuation Info', value: 'Evacuation Info', icon: 'exit' },
];

const QuickEmergencyPulse = ({ visible, onClose, refetch }) => {
  const { user } = useUser();
  const { location } = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const handleQuickPulse = async (type) => {
    if (!location?.coords) {
      errorToast('Location not available');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/pulse', {
        author_id: user.user_id,
        type: 'Emergency',
        urgency_level: 'High',
        content: type,
        skills: [],
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      successToast('Emergency pulse sent!');
      refetch?.();
      onClose();
    } catch (error) {
      errorToast('Failed to send pulse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className="rounded-t-3xl bg-[#0A0A0A] px-5 pb-8 pt-4">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-white">Quick Emergency Pulse</Text>
            <Pressable onPress={onClose} className="p-1">
              <Ionicons name="close" size={28} color="#999" />
            </Pressable>
          </View>
          <Text className="text-sm text-gray-400 mb-4">
            Tap to instantly send an emergency pulse with your current location
          </Text>
          <View className="gap-2">
            {EMERGENCY_TYPES.map((type) => (
              <Pressable
                key={type.value}
                disabled={submitting}
                onPress={() => handleQuickPulse(type.value)}
                className="flex-row items-center gap-3 rounded-2xl bg-[#1A1A1A] border border-[#333] p-4 active:bg-red-900/30">
                <Ionicons name={type.icon} size={24} color="#F87171" />
                <Text className="text-base font-semibold text-white">
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuickEmergencyPulse;
