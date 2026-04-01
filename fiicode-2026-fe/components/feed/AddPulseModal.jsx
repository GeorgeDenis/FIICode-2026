import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { errorToast } from '../../utils/toast';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';

const AddPulseModal = ({ setIsAddPulseModalVisible, isAddPulseModalVisible }) => {
  const { user } = useUser();
  const [pinLocation, setPinLocation] = useState(null);
  const [newPulseContent, setNewPulseContent] = useState({
    authorId: null,
    type: '',
    urgencyLevel: '',
    content: '',
    latitude: null,
    longitude: null,
    status: '',
  });
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(null);
  const [typeItems, setTypeItems] = useState([
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Skill', value: 'Skill' },
    { label: 'Item', value: 'Item' },
  ]);
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [urgencyValue, setUrgencyValue] = useState(null);
  const [urgencyItems, setUrgencyItems] = useState([
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ]);

  const handleMapPress = (e) => {
    setPinLocation({
      ...pinLocation,
      latitude: e.nativeEvent.coordinate.latitude,
      longitude: e.nativeEvent.coordinate.longitude,
    });
  };

  const addPulse = () => {
    if (!newPulseContent.content || !newPulseContent.type || !newPulseContent.urgencyLevel) {
      errorToast('Please fill in all fields');
      return;
    }
    if (!pinLocation) {
      errorToast('Please select a location on the map');
      return;
    }
    const pulseToSend = {
      ...newPulseContent,
      latitude: pinLocation.latitude,
      longitude: pinLocation.longitude,
    };

    setNewPulseContent(pulseToSend);

    handleAddPulse(pulseToSend);
  };

  const handleAddPulse = async (newPulse) => {
    try {
      const response = await api.post('/pulse', {
        author_id: user.user_id,
        type: newPulse.type,
        urgency_level: newPulse.urgencyLevel,
        content: newPulse.content,
        latitude: newPulse.latitude,
        longitude: newPulse.longitude,
      });
      if (response.status === 201) {
        setIsAddPulseModalVisible(false);
      }
    } catch (error) {
      errorToast(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        errorToast('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setPinLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isAddPulseModalVisible}
      onRequestClose={() => setIsAddPulseModalVisible(false)}>
      <View className="mt-[60px] flex w-full flex-col gap-4 rounded-b-3xl bg-surface px-5 pb-6 pt-12 shadow-2xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold tracking-widest text-text-main">Add pulse</Text>
          <Pressable
            onPress={() => setIsAddPulseModalVisible(false)}
            className="p-1 active:opacity-50">
            <Ionicons name="close" size={28} color="gray" />
          </Pressable>
        </View>
        <TextInput
          className="h-24 w-full rounded-lg border p-3 text-base"
          placeholder="What's on your mind?"
          multiline
          value={newPulseContent.content}
          onChangeText={(text) => setNewPulseContent((prev) => ({ ...prev, content: text }))}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text>Select the type</Text>
        <DropDownPicker
          zIndex={3000}
          zIndexInverse={1000}
          items={typeItems}
          open={typeOpen}
          setOpen={setTypeOpen}
          value={typeValue}
          setValue={setTypeValue}
          onChangeValue={(value) => setNewPulseContent((prev) => ({ ...prev, type: value }))}
        />
        <Text>Select the urgency level</Text>
        <DropDownPicker
          zIndex={2000}
          zIndexInverse={2000}
          items={urgencyItems}
          open={urgencyOpen}
          setOpen={setUrgencyOpen}
          value={urgencyValue}
          setValue={setUrgencyValue}
          onChangeValue={(value) =>
            setNewPulseContent((prev) => ({ ...prev, urgencyLevel: value }))
          }
        />
        <View className="h-72 w-full overflow-hidden rounded-xl border border-gray-300">
          {pinLocation ? (
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={pinLocation}
              onPress={handleMapPress}>
              <Marker
                coordinate={pinLocation}
                title="Locația Urgenței"
                description="Aici va fi postat Pulse-ul tău"
              />
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-100">
              <ActivityIndicator size="large" color="#FF0000" />
              <Text className="mt-2 text-gray-500">GPS search</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={addPulse}
          className="self-end rounded-lg bg-green-600 px-6 py-3 active:opacity-50">
          <Ionicons name={'checkmark'} size={24} color="white" />
        </Pressable>
      </View>
    </Modal>
  );
};

export default AddPulseModal;
