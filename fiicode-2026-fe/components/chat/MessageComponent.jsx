import { View, Text, Image } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageDateTime } from '../../utils/utils_functions';
import ProfilePicture from '../../assets/img/profile-picture.png';
import { useColorScheme } from 'nativewind';

export default function MessageComponent({ item, user }) {
  const status = item.author_id !== user.user_id;
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
  return (
    <View>
      <View className={`mb-4 flex w-full flex-col  ${status ? 'items-start' : 'items-end'} `}>
        <View className="flex flex-row items-center">
          {ProfilePicture ? (
            <Image source={ProfilePicture} className="h-12 w-12" />
          ) : (
            <Ionicons className="mr-4" name="person-circle-outline" size={45} color={iconColor} />
          )}
          <View
            className={`mb-0.5 max-w-[50%] rounded-xl p-3.5 ${status ? 'bg-bubble-received text-bubble-received-text' : 'bg-bubble-sent text-bubble-sent-text'}`}>
            <Text className={` ${status ? 'text-bubble-received-text' : 'text-bubble-sent-text'}`}>
              {item.text}
            </Text>
          </View>
        </View>
        <Text
          className={`ml-10 mt-1 ${status ? 'text-bubble-received-muted' : 'text-bubble-sent-muted'}`}>
          {formatMessageDateTime(item.created_at)}
        </Text>
      </View>
    </View>
  );
}
