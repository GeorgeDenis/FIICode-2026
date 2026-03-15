import { View, Text } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageDateTime } from '../utils/utils_functions';

export default function MessageComponent({ item, user }) {
  const status = item.author_id !== user.user_id;
  return (
    <View>
      <View className={`mb-4 flex w-full flex-col  ${status ? 'items-start' : 'items-end'} `}>
        <View className="flex flex-row items-center">
          <Ionicons name="person-circle-outline" size={30} color="black" className="mr-1.5" />
          <View
            className={`mb-0.5 max-w-[50%] rounded-xl p-3.5 ${status ? 'bg-purple-700' : 'bg-purple-800'}`}>
            <Text className="text-white">{item.text}</Text>
          </View>
        </View>
        <Text className="ml-10">{formatMessageDateTime(item.created_at)}</Text>
      </View>
    </View>
  );
}
