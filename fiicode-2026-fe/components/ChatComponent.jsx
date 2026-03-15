import React, { useLayoutEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { errorToast } from '../utils/toast';
import { useUser } from '../hooks/useUser';
import { formatMessageDateTime } from '../utils/utils_functions';

const ChatComponent = ({ item }) => {
  const { user } = useUser();
  const [messages, setMessages] = useState({});
  const [members, setMembers] = useState([]);
  const router = useRouter();

  const handleFetchMessages = async () => {
    try {
      const response = await api.get(`/chat/messages/by-conversation/${item.id}`);
      setMessages(response.data.messages[response.data.messages.length - 1]);
      setMembers(response.data.members);
    } catch (error) {
      errorToast(error.message);
    }
  };

  useLayoutEffect(() => {
    handleFetchMessages();
  }, []);

  const handleNavigation = () => {
    router.push({
      pathname: '/messaging',
      params: {
        conversationId: item.id,
        isGroup: item.is_group,
        name: buildName(),
      },
    });
  };

  const buildName = () => {
    if (item.name) return item.name;
    const otherMember = members.find((member) => member.id !== user.id);
    return otherMember ? otherMember.first_name + ' ' + otherMember.last_name : 'Chat';
  };

  return (
    <Pressable
      className="h-[80px] mb-2.5 flex w-[95%] flex-row items-center rounded-xl bg-primary px-4"
      onPress={handleNavigation}>
      <Ionicons className="mr-4" name="person-circle-outline" size={45} color="black" />
      <View className="flex flex-1 flex-row justify-between">
        <View>
          <Text className="mb-1.5 text-[16px] font-bold text-white">{buildName()}</Text>
          <Text className="text-[14px] opacity-70 text-white">
            {messages?.text ? messages.text : 'Tap to start chatting'}
          </Text>
        </View>
        <View>
          <Text className="opacity-50 text-white text-[14px]">{formatMessageDateTime(messages?.created_at)} </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
