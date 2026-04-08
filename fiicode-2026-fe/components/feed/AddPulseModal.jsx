import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { errorToast } from '../../utils/toast';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useUser } from '../../hooks/useUser';
import Toast from 'toastify-react-native';

const AddPulseModal = ({ setIsAddPulseModalVisible, isAddPulseModalVisible }) => {
  const { user } = useUser();
  const [pinLocation, setPinLocation] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [newPulseContent, setNewPulseContent] = useState({
    authorId: null,
    type: '',
    urgencyLevel: '',
    content: '',
    skills: null,
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
  const AVAILABLE_SKILLS = [
    { id: 'PHYSICAL_HELP', label: 'Physical Help' },
    { id: 'MEDICAL', label: 'Medical Help/First aid' },
    { id: 'TOOLS', label: 'Tools and Equipment' },
    { id: 'TRANSPORT', label: 'Transport / Evacuation' },
    { id: 'PET_RESCUE', label: 'Pet Rescue' },
  ];

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills((prev) => prev.filter((item) => item !== skillId));
    } else {
      setSelectedSkills((prev) => [...prev, skillId]);
    }
  };

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
        skills: selectedSkills,
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
      <View className="mt-[50px] flex w-full flex-col gap-3 rounded-b-3xl bg-surface px-5 pb-6 pt-1 shadow-2xl">
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
        <View className="h-60 w-full overflow-hidden rounded-xl border border-gray-300">
          {pinLocation ? (
            <MapView
              style={{ width: '100%', height: '100%' }}
              initialRegion={pinLocation}
              onPress={handleMapPress}>
              <Marker
                coordinate={pinLocation}
                title="Pulse location"
                description="This is where the pulse is located"
              />
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-100">
              <ActivityIndicator size="large" color="#FF0000" />
              <Text className="mt-2 text-gray-500">GPS search</Text>
            </View>
          )}
        </View>
        <View className="mb-4 mt-6">
          <Text className="mb-4 text-base text-text-main">
            Select the tags that suit you to be alerted in case of need.
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);

              return (
                <Pressable
                  key={skill.id}
                  onPress={() => toggleSkill(skill.id)}
                  className={`rounded-full border px-4 py-2 ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'
                  }`}>
                  <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-text-main'}`}>
                    {skill.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <Pressable
          onPress={addPulse}
          className="self-end rounded-lg bg-green-600 px-6 py-3 active:opacity-50">
          <Ionicons name={'checkmark'} size={24} color="white" />
        </Pressable>
        <Toast />
      </View>
    </Modal>
  );
};

export default AddPulseModal;
