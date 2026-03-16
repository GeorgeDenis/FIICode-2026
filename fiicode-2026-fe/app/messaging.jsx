import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, useColorScheme, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MessageComponent from '../components/chat/MessageComponent';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import api, { IP_CONFIG } from '../services/api';
import { errorToast } from '../utils/toast';
import { useUser } from '../hooks/useUser';
import AddInGroupModal from '../components/chat/AddInGroupModal';
import UsersInGroupModal from '../components/chat/UsersInGroupModal';

const Messaging = () => {
  const { receiverId, conversationId, name, isGroup } = useLocalSearchParams();
  const [isAddUserModalVisibile, setIsAddUserModalVisibile] = useState(false);
  const [isUserListModalVisibile, setIsUserListModalVisibile] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';
  const router = useRouter();

  const [chatMessages, setChatMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');

  const flatListRef = useRef(null);

  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      handleFetchMessages();
      const wsUrl = `ws://${IP_CONFIG}:8000/ws/chat/${user.user_id}`;
      console.log("Connecting to WebSocket at:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connection open');
      };

      ws.onmessage = (e) => {
        const newMessage = JSON.parse(e.data);
        setChatMessages((prevMessages) => {
          const alreadyExists = prevMessages.some((msg) => msg.id === newMessage.id);
          if (alreadyExists) {
            return prevMessages;
          }
          console.log('Received message', newMessage);
          return [...prevMessages, newMessage];
        });
      };

      ws.onerror = (error) => {
        console.error('Error WebSocket:', error.message);
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket.');
      };

      return () => {
        ws.close();
      };
    }, [])
  );

  useEffect(() => {
    if (conversationId) {
      handleFetchMessages();
    }
  }, [conversationId]);

  const handleFetchMessages = async () => {
    if (!conversationId) return;

    try {
      const response = await api.get(`/chat/messages/by-conversation/${conversationId}`);
      setChatMessages(response.data.messages);
      setMembers(response.data.members);
    } catch (error) {
      errorToast(error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      const response = await api.post('/chat', {
        conversation_id: conversationId || null,
        receiver_id: receiverId || null,
        text: message,
      });

      if (response.status === 201) {
        router.setParams({
          conversationId: response.data.conversation_id,
          isGroup: response.data.is_group,
        });
      }

      setMessage('');
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: name || 'Chat',
          headerBackTitleVisible: false,
          headerTitleAlign: 'center',
          backgroundColor: backgroundColor,
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={theme.iconColor} />
            </Pressable>
          ),
          headerRight: () =>
            isGroup === 'true' || isGroup === true ? (
              <View className="flex flex-row items-center">
                <Pressable
                  disabled={isUserListModalVisibile || isAddUserModalVisibile}
                  className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border active:opacity-50"
                  onPress={() => setIsUserListModalVisibile(true)}>
                  <Ionicons name="people" size={20} color={theme.iconColor} />
                </Pressable>

                <Pressable
                  disabled={isUserListModalVisibile || isAddUserModalVisibile}
                  className="flex h-10 w-10 items-center justify-center rounded-full border active:opacity-50"
                  onPress={() => setIsAddUserModalVisibile(true)}>
                  <Ionicons name="person-add" size={20} color={theme.iconColor} />
                </Pressable>
              </View>
            ) : null,
        }}
      />
      <View className="flex-1 px-2.5 py-3.5">
        {chatMessages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={chatMessages}
            renderItem={({ item }) => <MessageComponent item={item} user={user} />}
            keyExtractor={(item) => item.id}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          <View className="my-auto flex flex-col items-center  justify-center rounded-xl">
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={theme.iconColor} />
            <Text className="font-bold">No messages yet.</Text>
            <Text className="text-gray-600">Start the conversation by sending a message!</Text>
          </View>
        )}
      </View>

      <View className="flex min-h-[100px] w-full flex-row justify-center bg-background px-3.5 py-7 text-black">
        <TextInput
          className="mr-2.5 flex-1 rounded-2xl border p-3.5"
          placeholder="Type your message..."
          placeholderTextColor="#6b7280"
          value={message}
          onChangeText={setMessage}
        />
        <Pressable
          className="flex w-[30%] flex-row items-center justify-center rounded-sm rounded-b-3xl bg-purple-500 active:bg-purple-600"
          onPress={handleSendMessage}>
          <Text className="text-xl font-bold text-white">SEND</Text>
        </Pressable>
      </View>
      {isGroup && isAddUserModalVisibile ? (
        <AddInGroupModal conversationId={conversationId} setVisible={setIsAddUserModalVisibile} />
      ) : (
        ''
      )}
      {isGroup && isUserListModalVisibile ? (
        <UsersInGroupModal
          conversationId={conversationId}
          setVisible={setIsUserListModalVisibile}
        />
      ) : (
        ''
      )}
    </View>
  );
};

export default Messaging;
