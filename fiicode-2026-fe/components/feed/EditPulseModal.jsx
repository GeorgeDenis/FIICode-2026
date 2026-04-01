import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { errorToast } from '../../utils/toast';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';

const EditPulseModal = ({ setIsEditPulseModalVisible, isEditPulseModalVisible, pulse }) => {
  const { user } = useUser();
  const [pinLocation, setPinLocation] = useState({
    latitude: pulse.latitude,
    longitude: pulse.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [newPulseContent, setNewPulseContent] = useState({
    type: pulse.type,
    urgencyLevel: pulse.urgency_level,
    content: pulse.content,
    latitude: pulse.latitude,
    longitude: pulse.longitude,
    status: pulse.status,
  });
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeValue, setTypeValue] = useState(pulse.type);
  const [typeItems, setTypeItems] = useState([
    { label: 'Emergency', value: 'Emergency' },
    { label: 'Skill', value: 'Skill' },
    { label: 'Item', value: 'Item' },
  ]);
  const [urgencyOpen, setUrgencyOpen] = useState(false);
  const [urgencyValue, setUrgencyValue] = useState(pulse.urgency_level);
  const [urgencyItems, setUrgencyItems] = useState([
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
  ]);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(pulse.status);
  const [statusItems, setItemsValue] = useState([
    { label: 'Active', value: 'Active' },
    { label: 'Completed', value: 'Completed' },
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

    handleEditPulse(pulseToSend);
  };

  const handleEditPulse = async (newPulse) => {
    try {
      const response = await api.put('/pulse', {
        id: pulse.id,
        type: newPulse.type,
        urgency_level: newPulse.urgencyLevel,
        content: newPulse.content,
        latitude: newPulse.latitude,
        longitude: newPulse.longitude,
        status: newPulse.status,
      });
      if (response.status === 200) {
        setIsEditPulseModalVisible(false);
      }
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isEditPulseModalVisible}
      onRequestClose={() => setIsEditPulseModalVisible(false)}>
      <View className="mt-[60px] flex w-full flex-col gap-2 rounded-b-3xl bg-surface px-5 pb-6 pt-12 shadow-2xl">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold tracking-widest text-text-main">Edit pulse</Text>
          <Pressable
            onPress={() => setIsEditPulseModalVisible(false)}
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
        <Text>Select the active status</Text>
        <DropDownPicker
          zIndex={1000}
          zIndexInverse={1000}
          items={statusItems}
          open={statusOpen}
          setOpen={setStatusOpen}
          value={statusValue}
          setValue={setStatusValue}
          onChangeValue={(value) => setNewPulseContent((prev) => ({ ...prev, status: value }))}
        />
        <View className="h-72 w-full overflow-hidden rounded-xl border border-gray-300">
          {pinLocation ? (
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={pinLocation}
              onPress={handleMapPress}>
              <Marker
                coordinate={pinLocation}
                title="Pulse location"
                description="Help is needed here!"
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

export default EditPulseModal;
