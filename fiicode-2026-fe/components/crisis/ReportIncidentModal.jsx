import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useCrisis } from '../../hooks/useCrisis';
import { useUser } from '../../hooks/useUser';
import { errorToast, successToast } from '../../utils/toast';
import ToastManager from 'toastify-react-native';

const ReportIncidentModal = ({ visible, onClose }) => {
  const { user } = useUser();
  const { isCrisisActive, incidentTypes, submitReport, refreshCrisisStatus } = useCrisis();
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [pinLocation, setPinLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setPinLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, [visible]);

  const handleSubmit = async () => {
    if (!selectedType) {
      errorToast('Please select an incident type');
      return;
    }
    if (!pinLocation) {
      errorToast('Location not available');
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        reporter_id: user.user_id,
        incident_type_id: selectedType.id,
        description: description || null,
        latitude: pinLocation.latitude,
        longitude: pinLocation.longitude,
      });
      successToast('Incident reported successfully');
      setDescription('');
      setSelectedType(null);
      onClose();
      refreshCrisisStatus();
    } catch (error) {
      errorToast('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const INCIDENT_ICONS = {
    'Power Outage': 'flash-off',
    'Blackout': 'flash-off',
    'Fire': 'flame',
    'Flood': 'water',
    'Earthquake': 'earth',
    'Severe Storm': 'thunderstorm',
    'Road Blockage': 'car',
    'Infrastructure Damage': 'construct',
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <View className={`max-h-[90%] rounded-t-3xl px-5 pb-8 pt-4 ${isCrisisActive ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-xl font-bold ${isCrisisActive ? 'text-white' : 'text-gray-900'}`}>Report Incident</Text>
            <Pressable onPress={onClose} className="p-1 active:opacity-50">
              <Ionicons name="close" size={28} color={isCrisisActive ? '#999' : '#666'} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className={`mb-3 text-sm font-semibold ${isCrisisActive ? 'text-gray-400' : 'text-gray-500'}`}>SELECT TYPE</Text>
            <View className="flex-row flex-wrap gap-2 mb-5">
              {incidentTypes.map((type) => {
                const isSelected = selectedType?.id === type.id;
                const iconName = INCIDENT_ICONS[type.name] || 'alert-circle';

                let typeClass = '';
                if (isSelected) {
                  typeClass = isCrisisActive ? 'bg-red-600 border-red-400' : 'bg-amber-600 border-amber-400';
                } else {
                  typeClass = isCrisisActive ? 'bg-[#1A1A1A] border-[#333]' : 'bg-gray-100 border-gray-200';
                }

                const textColor = isSelected ? 'text-white' : (isCrisisActive ? 'text-gray-300' : 'text-gray-700');
                const iconColor = isSelected ? '#FFF' : (isCrisisActive ? '#F87171' : '#d97706');

                return (
                  <Pressable
                    key={type.id}
                    onPress={() => setSelectedType(type)}
                    className={`rounded-2xl px-4 py-3 flex-row items-center gap-2 border-2 ${typeClass}`}>
                    <Ionicons name={iconName} size={18} color={iconColor} />
                    <Text className={`font-semibold ${textColor}`}>
                      {type.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text className={`mb-2 text-sm font-semibold ${isCrisisActive ? 'text-gray-400' : 'text-gray-500'}`}>DESCRIPTION (OPTIONAL)</Text>
            <TextInput
              className={`mb-5 h-20 rounded-xl border-2 p-3 ${isCrisisActive
                  ? 'border-[#333] bg-[#1A1A1A] text-white'
                  : 'border-gray-200 bg-gray-100 text-gray-900'
                }`}
              placeholder="What's happening?"
              placeholderTextColor={isCrisisActive ? '#666' : '#999'}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <Text className={`mb-2 text-sm font-semibold ${isCrisisActive ? 'text-gray-400' : 'text-gray-500'}`}>LOCATION</Text>
            <View className={`h-48 mb-5 overflow-hidden rounded-xl border-2 ${isCrisisActive ? 'border-[#333]' : 'border-gray-200'}`}>
              {pinLocation ? (
                <MapView
                  style={{ width: '100%', height: '100%' }}
                  initialRegion={pinLocation}
                  userInterfaceStyle={isCrisisActive ? 'dark' : 'light'}
                  onPress={(e) =>
                    setPinLocation({
                      ...pinLocation,
                      latitude: e.nativeEvent.coordinate.latitude,
                      longitude: e.nativeEvent.coordinate.longitude,
                    })
                  }>
                  <Marker coordinate={pinLocation} pinColor={isCrisisActive ? 'red' : 'orange'} />
                </MapView>
              ) : (
                <View className={`flex-1 items-center justify-center ${isCrisisActive ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}>
                  <ActivityIndicator size="large" color={isCrisisActive ? '#EF4444' : '#d97706'} />
                  <Text className={`mt-2 ${isCrisisActive ? 'text-gray-500' : 'text-gray-400'}`}>Getting location...</Text>
                </View>
              )}
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              className={`rounded-2xl py-4 items-center ${submitting
                  ? (isCrisisActive ? 'bg-gray-700' : 'bg-gray-300')
                  : (isCrisisActive ? 'bg-red-600 active:bg-red-700' : 'bg-amber-600 active:bg-amber-700')
                }`}>
              {submitting ? (
                <ActivityIndicator color={isCrisisActive ? '#FFF' : '#666'} />
              ) : (
                <Text className={`text-lg font-bold ${submitting ? (isCrisisActive ? 'text-gray-400' : 'text-gray-500') : 'text-white'}`}>Report Incident</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
      <ToastManager />
    </Modal>
  );
};

export default ReportIncidentModal;
