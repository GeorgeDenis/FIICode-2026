import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfilePicture from '../../assets/img/profile-picture.png';
import {
  formatMessageDateTime,
  getBorderColorByType,
  getIconName,
  getTypeBadgeColor,
} from '../../utils/utils_functions';
import { useLocalSearchParams } from 'expo-router';
import api from '../../services/api';
import PulseComment from '../../components/feed/PulseComment';
import { useUser } from '../../hooks/useUser';
import { errorToast } from '../../utils/toast';

const PulseComments = () => {
  const { user } = useUser();
  const { id } = useLocalSearchParams();
  const [pulse, setPulse] = useState(null);
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState([]);

  const flatListRef = useRef(null);

  const handleFetchPulse = async () => {
    try {
      const response = await api.get('/pulse/by-id/' + id);
      setPulse(response.data);
    } catch (error) {}
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      errorToast('Message cannot be empty');
      return;
    }

    try {
      const response = await api.post('/pulse/comment', {
        pulse_id: id,
        author_id: user.user_id,
        content: message,
      });
      if (response.status === 201) {
        setComments((prevComments) => [...prevComments, response.data]);
      }
    } catch (error) {
      errorToast(error.message);
    } finally {
      setMessage('');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/pulse/comment/by-pulse/${id}`);
      const data = response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setComments(data);
    } catch (error) {
      errorToast(error.message);
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchPulse();
    }
  }, [id]);

  useEffect(() => {
    if (pulse) {
      fetchComments();
    }
  }, [pulse]);

  useEffect(() => {
    if (comments && comments.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [comments]);

  if (!pulse) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <View className="flex flex-1 flex-col bg-background">
        <View className={`m-2 border ${getBorderColorByType(pulse)} rounded-xl`}>
          <View
            className={`flex flex-row items-center gap-2 ${getTypeBadgeColor(pulse)} justify-between rounded-xl rounded-b-none p-4`}>
            <View className="flex flex-row items-center gap-2">
              <Ionicons name={getIconName(pulse)} size={24} color="#ffffff" />
              <Text className="text-md font-semibold text-text-main">{pulse.type}</Text>
            </View>
            <Text className="text-text-reverted text-sm font-semibold">
              {pulse.urgency_level.toUpperCase()}
            </Text>
          </View>
          <View
            className={`pulses-center flex flex-row justify-between gap-2 rounded-xl px-4 py-2`}>
            <View className="pulses-center flex flex-row gap-2">
              <Image source={ProfilePicture} className="mb-2 h-10 w-10" />
              <Text className="font-bold text-text-main">
                {pulse.author?.first_name + ' ' + pulse.author?.last_name || 'Anonym'}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-text-muted">
              {formatMessageDateTime(pulse.created_at)}
            </Text>
          </View>

          <View className="pulses-center flex flex-row px-4 py-2">
            <Text className="text-base text-text-main">{pulse.content}</Text>
          </View>
        </View>
        {comments && comments.length > 0 && (
          <FlatList
            className={`flex-1 border ${getBorderColorByType(pulse)} m-2 rounded-xl`}
            data={comments}
            ref={flatListRef}
            renderItem={({ item, index }) => {
              const isLastItem = index === comments.length - 1;
              return (
                <PulseComment
                  style={isLastItem ? '' : `border-b ${getBorderColorByType(pulse)}`}
                  item={item}
                />
              );
            }}
            keyExtractor={(item) => item.id.toString()}
          />
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
          className="flex w-[30%] flex-row items-center justify-center rounded-sm rounded-b-3xl bg-btn-primary active:bg-btn-primary-active"
          onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PulseComments;
