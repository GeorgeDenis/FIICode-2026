import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import MessageComponent from '../components/chat/MessageComponent';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import api, { WS_BASE_URL } from '../services/api';
import { errorToast } from '../utils/toast';
import { useUser } from '../hooks/useUser';
import AddInGroupModal from '../components/chat/AddInGroupModal';
import UsersInGroupModal from '../components/chat/UsersInGroupModal';
import { useCrisis } from '../hooks/useCrisis';

const Messaging = () => {
  const { receiverId, conversationId, name, isGroup } = useLocalSearchParams();
  const [isAddUserModalVisibile, setIsAddUserModalVisibile] = useState(false);
  const [isUserListModalVisibile, setIsUserListModalVisibile] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';
  const { isCrisisActive } = useCrisis();
  const router = useRouter();

  const [chatMessages, setChatMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');

  const flatListRef = useRef(null);

  const { user } = useUser();

  useFocusEffect(
    useCallback(() => {
      handleFetchMessages();
      const wsUrl = `${WS_BASE_URL}/chat/${user.user_id}`;
      console.log('Connecting to WebSocket at:', wsUrl);
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
          isGroup: response.data.is_group !== undefined ? response.data.is_group : isGroup,
        });
      }

      setMessage('');
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isCrisisActive ? 'bg-[#0A0A0A]' : 'bg-background'}`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <View className={`flex-1 ${isCrisisActive ? 'bg-[#0A0A0A]' : 'bg-background'}`}>
        <Stack.Screen
          options={{
            title: name || 'Chat',
            headerBackTitleVisible: false,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: isCrisisActive ? '#0A0A0A' : backgroundColor },
            headerTintColor: isCrisisActive ? '#FFFFFF' : undefined,
            headerLeft: () => (
              <Pressable
                className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={20} color={isCrisisActive ? '#9CA3AF' : theme.iconColor} />
              </Pressable>
            ),
            headerRight: () =>
              isGroup === 'true' || isGroup === true ? (
                <View className="flex flex-row items-center">
                  <Pressable
                    disabled={isUserListModalVisibile || isAddUserModalVisibile}
                    className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border active:opacity-50"
                    onPress={() => setIsUserListModalVisibile(true)}>
                    <Ionicons name="people" size={20} color={isCrisisActive ? '#9CA3AF' : theme.iconColor} />
                  </Pressable>

                  <Pressable
                    disabled={isUserListModalVisibile || isAddUserModalVisibile}
                    className="flex h-10 w-10 items-center justify-center rounded-full border active:opacity-50"
                    onPress={() => setIsAddUserModalVisibile(true)}>
                    <Ionicons name="person-add" size={20} color={isCrisisActive ? '#9CA3AF' : theme.iconColor} />
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
              <Ionicons name="chatbubble-ellipses-outline" size={30} color={isCrisisActive ? '#6B7280' : theme.iconColor} />
              <Text className={`font-bold ${isCrisisActive ? 'text-gray-400' : ''}`}>No messages yet.</Text>
              <Text className={isCrisisActive ? 'text-gray-500' : 'text-gray-600'}>Start the conversation by sending a message!</Text>
            </View>
          )}
        </View>

        <View className={`flex min-h-[100px] w-full flex-row justify-center px-3.5 py-7 ${isCrisisActive ? 'bg-[#111] border-t border-red-900/30' : 'bg-background'}`}>
          <TextInput
            className={`mr-2.5 flex-1 rounded-2xl border p-3.5 ${isCrisisActive ? 'border-[#333] bg-[#1A1A1A] text-white' : ''}`}
            placeholder="Type your message..."
            placeholderTextColor={isCrisisActive ? '#666' : '#6b7280'}
            value={message}
            onChangeText={setMessage}
          />
          <Pressable
            className="flex w-[30%] flex-row items-center justify-center rounded-sm rounded-b-3xl bg-btn-primary active:bg-btn-primary-active"
            onPress={handleSendMessage}>
            <Ionicons name="send" size={20} color="#ffffff" />
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
    </KeyboardAvoidingView>
  );
};

export default Messaging;
