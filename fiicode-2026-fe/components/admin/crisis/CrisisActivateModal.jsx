import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { activateCrisis, getIncidentTypes } from '../../../services/crisisService';
import { errorToast, successToast } from '../../../utils/toast';
import { useCrisis } from '../../../hooks/useCrisis';
import ToastManager from 'toastify-react-native';

const CrisisActivateModal = ({ visible, onClose }) => {
  const { refreshCrisisStatus } = useCrisis();
  const [scope, setScope] = useState('Local');
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [label, setLabel] = useState('');
  const [radius, setRadius] = useState(1000);
  const [center, setCenter] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      try {
        const types = await getIncidentTypes();
        setIncidentTypes(types);
      } catch {}
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setCenter({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    })();
  }, [visible]);

  const handleActivate = () => {
    if (!selectedType) {
      errorToast('Select an incident type');
      return;
    }
    if (scope === 'Local' && !center) {
      errorToast('Location not available');
      return;
    }

    Alert.alert(
      'Activate Crisis Mode',
      `This will activate a ${scope} crisis for "${selectedType.name}". All affected users will be notified immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'ACTIVATE', style: 'destructive', onPress: confirmActivate },
      ]
    );
  };

  const handleClose = () => {
    setSelectedType(null);
    setLabel('');
    setRadius(1000);
    onClose();
  };

  const confirmActivate = async () => {
    setSubmitting(true);
    try {
      await activateCrisis({
        incident_type_id: selectedType.id,
        scope: scope,
        center_latitude: scope === 'Local' ? center?.latitude : null,
        center_longitude: scope === 'Local' ? center?.longitude : null,
        radius_meters: scope === 'Local' ? radius : null,
        crisis_label: label || `${selectedType.name} Emergency`,
      });
      successToast('Crisis mode activated!');
      handleClose();
      refreshCrisisStatus();
    } catch (error) {
      console.error('Crisis Activation Error:', error.response?.data || error.message);
      errorToast('Failed to activate crisis');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        <View className="max-h-[92%] rounded-t-3xl bg-gray-50 px-5 pb-8 pt-4 dark:bg-gray-950">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-800 dark:text-white">
              Activate Crisis Mode
            </Text>
            <Pressable onPress={handleClose}>
              <Ionicons name="close" size={28} color="#999" />
            </Pressable>
          </View>

          <Text className="mb-2 text-sm font-semibold text-gray-500">SCOPE</Text>
          <View className="mb-4 flex-row gap-2">
            {['Local', 'Global'].map((s) => (
              <Pressable
                key={s}
                onPress={() => setScope(s)}
                className={`flex-1 items-center rounded-xl py-3 ${
                  scope === s ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-800'
                }`}>
                <Text
                  className={`font-bold ${scope === s ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {s === 'Local' ? 'Local' : 'Global'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-sm font-semibold text-gray-500">CRISIS TYPE</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {incidentTypes.map((type) => (
              <Pressable
                key={type.id}
                onPress={() => setSelectedType(type)}
                className={`rounded-xl px-3 py-2 ${
                  selectedType?.id === type.id
                    ? 'border-2 border-red-400 bg-red-600'
                    : 'border-2 border-transparent bg-gray-200 dark:bg-gray-800'
                }`}>
                <Text
                  className={`font-semibold ${
                    selectedType?.id === type.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                  {type.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-2 text-sm font-semibold text-gray-500">LABEL</Text>
          <TextInput
            className="mb-4 rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="e.g. Power Outage - Downtown"
            placeholderTextColor="#999"
            value={label}
            onChangeText={setLabel}
          />

          {scope === 'Local' && (
            <>
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                AREA (tap to set center, radius: {radius}m)
              </Text>
              <View className="mb-2 h-48 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-700">
                {center ? (
                  <MapView
                    style={{ width: '100%', height: '100%' }}
                    region={center}
                    onPress={(e) => setCenter({ ...center, ...e.nativeEvent.coordinate })}>
                    <Marker coordinate={center} pinColor="red" />
                    <Circle
                      center={center}
                      radius={radius}
                      fillColor="rgba(239, 68, 68, 0.2)"
                      strokeColor="rgba(239, 68, 68, 0.8)"
                      strokeWidth={2}
                    />
                  </MapView>
                ) : (
                  <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <ActivityIndicator size="large" color="#EF4444" />
                  </View>
                )}
              </View>
              <View className="mb-4 flex-row gap-2">
                {[500, 1000, 2000, 5000].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRadius(r)}
                    className={`flex-1 items-center rounded-lg py-2 ${
                      radius === r ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-800'
                    }`}>
                    <Text
                      className={`text-sm font-bold ${radius === r ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {r}m
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Pressable
            onPress={handleActivate}
            disabled={submitting}
            className={`items-center rounded-2xl py-4 ${
              submitting ? 'bg-gray-400' : 'bg-red-600 active:bg-red-700'
            }`}>
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-lg font-extrabold text-white">ACTIVATE CRISIS MODE</Text>
            )}
          </Pressable>
        </View>
      </View>
      <ToastManager />
    </Modal>
  );
};

export default CrisisActivateModal;
