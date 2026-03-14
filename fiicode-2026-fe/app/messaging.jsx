import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, useColorScheme, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MessageComponent from '../components/MessageComponent';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import api from '../services/api';
import { errorToast } from '../utils/toast';
import { useUser } from '../hooks/useUser';

const Messaging = () => {
  const { id, name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const router = useRouter();

  const [chatMessages, setChatMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');

  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      handleFetchMessages();
      console.log('Setting up WebSocket connection for user ID:', user.user_id);
      const wsUrl = `ws://192.168.1.114:8000/ws/chat/${user.user_id}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection open');
      };

      ws.onmessage = (e) => {
        const newMessage = JSON.parse(e.data);
        console.log(newMessage);
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
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

  const handleFetchMessages = async () => {
    try {
      const response = await api.get(`/chat/messages/by-conversation/${id}`);
      setChatMessages(response.data.messages);
      setMembers(response.data.members);
    } catch (error) {
      errorToast(error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const targetMember = members.find((m) => m.id !== user.id);

      if (!targetMember) {
        errorToast('Could not find the target member of this conversation.');
        return;
      }

      await api.post('/chat', {
        receiver_id: targetMember.id,
        text: message,
      });

      setMessage('');
      handleFetchMessages();
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: name || 'Chat',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 px-2.5 py-3.5">
        {chatMessages.length > 0 ? (
          <FlatList
            data={chatMessages}
            renderItem={({ item }) => <MessageComponent item={item} user={user} />}
            keyExtractor={(item) => item.id}
            // inverted={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-gray-400">
              No messages yet. Start the conversation by sending a message!
            </Text>
          </View>
        )}
      </View>

      <View className="flex min-h-[100px] w-full flex-row justify-center bg-white px-3.5 py-7">
        <TextInput
          className="mr-2.5 flex-1 rounded-2xl border p-3.5"
          placeholder="Scrie un mesaj..."
          value={message}
          onChangeText={setMessage}
        />
        <Pressable
          className="flex w-[30%] flex-row items-center justify-center rounded-sm rounded-b-3xl bg-green-500 active:bg-green-600"
          onPress={handleSendMessage}>
          <Text className="text-xl font-bold text-white">SEND</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Messaging;
