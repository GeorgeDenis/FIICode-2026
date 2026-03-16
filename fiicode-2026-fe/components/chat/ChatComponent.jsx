import React, { useLayoutEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import { useUser } from '../../hooks/useUser';
import { formatMessageDateTime } from '../../utils/utils_functions';
import { useColorScheme } from 'nativewind';
import ProfilePicture from '../../assets/img/profile-picture.png';

const ChatComponent = ({ item }) => {
  const { user } = useUser();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
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
      className="mb-2.5 flex h-[80px] w-[95%] flex-row items-center rounded-xl bg-surface px-4"
      onPress={handleNavigation}>
      {ProfilePicture ? (
        <Image source={ProfilePicture} className="h-20 w-20" />
      ) : (
        <Ionicons className="mr-4" name="person-circle-outline" size={45} color={iconColor} />
      )}
      <View className="flex flex-1 flex-row justify-between">
        <View>
          <Text className="mb-1.5 text-[16px] font-bold text-text-main">{buildName()}</Text>
          <Text className="text-[14px] text-text-main">
            {messages?.text ? messages.text : 'Tap to start chatting'}
          </Text>
        </View>
        <View>
          <Text className="text-[14px] text-text-main">
            {formatMessageDateTime(messages?.created_at)}{' '}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default ChatComponent;
