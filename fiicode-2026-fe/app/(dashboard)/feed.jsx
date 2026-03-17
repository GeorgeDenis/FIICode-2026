import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api, { IP_CONFIG } from '../../services/api';
import AnimatedPulse from '../../components/AnimatedPulse';
import { Ionicons } from '@expo/vector-icons';
import BasicModal from '../../components/BasicModal';
import DropDownPicker from 'react-native-dropdown-picker';
import { useUser } from '../../hooks/useUser';
import { errorToast } from '../../utils/toast';

const Feed = () => {
  const { user } = useUser();
  const [pulses, setPulses] = useState([]);
  const [isAddPulseModalVisible, setIsAddPulseModalVisible] = useState(false);
  const [newPulseContent, setNewPulseContent] = useState({
    authorId: null,
    type: '',
    urgencyLevel: '',
    content: '',
    latitude: null,
    longitude: null,
    status: '',
  });

  const handleFetchPulses = async () => {
    try {
      const response = await api.get('/pulse');
      setPulses(response.data);
    } catch (error) {}
  };

  const handleAddPulse = async () => {
    console.log('api post data');
    try {
      const response = await api.post('/pulse', {
        author_id: user.user_id,
        type: newPulseContent.type,
        urgency_level: newPulseContent.urgencyLevel,
        content: newPulseContent.content,
        latitude: 43.65107,
        longitude: -79.347015,
      });
      if(response.status === 201) {
        setIsAddPulseModalVisible(false);
        clearInputFields();
      }
      // setPulses((prevPulses) => [response.data, ...prevPulses]);
    } catch (error) {
      errorToast(error.message);
    }
  };

  const clearInputFields = () => {
    setNewPulseContent({
      authorId: null,
      type: '',
      urgencyLevel: '',
      content: '',
      latitude: null,
      longitude: null,
      status: '',
    });
    setTypeValue(null);
    setUrgencyValue(null);
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

  return (
    <View className="flex-1 bg-background p-4">
      <Pressable
        className="absolute  bottom-0 right-5 z-10 mb-4 justify-center self-end rounded-full bg-primary p-3"
        onPress={() => setIsAddPulseModalVisible(!isAddPulseModalVisible)}>
        <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
      </Pressable>

      <FlatList
        data={pulses}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={renderPulse}
        ListEmptyComponent={
          <Text className="text-text mt-10 text-center opacity-50">
            No pulses yet. Be the first to share your thoughts!
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
      {isAddPulseModalVisible && (
        <BasicModal
          setVisible={setIsAddPulseModalVisible}
          visible={isAddPulseModalVisible}
          doAction={() => handleAddPulse()}
          title="Add a new Pulse">
          <View className="flex gap-5">
            <Text className="text-center text-lg font-bold">Add a new Pulse</Text>
            <TextInput
              className="mt-4 h-24 w-full rounded-lg border p-3 text-base"
              placeholder="What's on your mind?"
              multiline
              value={newPulseContent.content}
              onChangeText={(text) => setNewPulseContent((prev) => ({ ...prev, content: text }))}
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
          </View>
        </BasicModal>
      )}
    </View>
  );
};

export default Feed;
