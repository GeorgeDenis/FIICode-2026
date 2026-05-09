import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ChatComponent from '../../components/chat/ChatComponent';
import CreateGroupModal from '../../components/chat/CreateGroupModal';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { useFocusEffect } from 'expo-router';
import EmergencyBanner from '../../components/crisis/EmergencyBanner';
import { useCrisis } from '../../hooks/useCrisis';

const Chat = () => {
  const [visible, setVisible] = useState(false);
  const [rooms, setRooms] = useState([]);
  const { isCrisisActive } = useCrisis();

  const handleFetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setRooms(response.data);
    } catch (error) {
      errorToast(error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setVisible(false);
      handleFetchConversations();
    }, [])
  );

  return (
    <View className={`flex-1 ${isCrisisActive ? 'bg-[#0A0A0A]' : 'bg-background'}`}>
      <EmergencyBanner />
      <View className={`elevation-sm mb-4 h-[70px] w-full justify-center p-5 ${isCrisisActive ? 'border-b border-red-900/50' : ''}`}>
        <View className="flex flex-row items-center justify-between">
          <Text className={`text-2xl font-bold ${isCrisisActive ? 'text-white' : 'text-text-main'}`}>Chats</Text>

          <Pressable onPress={() => setVisible(true)}>
            <Feather name="edit" size={24} color={isCrisisActive ? '#F87171' : 'indigo'} />
          </Pressable>
        </View>
      </View>
      <View className="w-full flex-1">
        {rooms.length > 0 ? (
          <FlatList
            data={rooms}
            contentContainerStyle={{ alignItems: 'center' }}
            renderItem={({ item }) => <ChatComponent item={item} />}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View className="flex h-[80%] w-full items-center justify-center">
            <Text className={`pb-7 text-2xl font-bold ${isCrisisActive ? 'text-gray-400' : ''}`}>No rooms created!</Text>
            <Text className={isCrisisActive ? 'text-gray-500' : ''}>Click the icon above to create a Chat room</Text>
          </View>
        )}
      </View>
      {visible ? (
        <CreateGroupModal
          setVisible={setVisible}
          handleFetchConversations={handleFetchConversations}
        />
      ) : (
        ''
      )}
    </View>
  );
};

export default Chat;
