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
        id: item.id,
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
      className="height-[80px] mb-2.5 flex w-full flex-row items-center rounded-md bg-[#94A3B8] px-4"
      onPress={handleNavigation}>
      <Ionicons className="mr-4" name="person-circle-outline" size={45} color="black" />
      <View className="flex flex-1 flex-row justify-between">
        <View>
          <Text className="mb-1.5 text-base font-bold">{buildName()}</Text>
          <Text className="text-[14px] opacity-70">
            {messages?.text ? messages.text : 'Tap to start chatting'}
          </Text>
        </View>
        <View>
          <Text className="opacity-50">{formatMessageDateTime(messages?.created_at)} </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
