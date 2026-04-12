import React from 'react';
import { Image, Text, View } from 'react-native';
import { formatMessageDateTime } from '../../utils/utils_functions';
import ProfilePicture from '../../assets/img/profile-picture.png';

const PulseComment = ({ style, item }) => {
  console.log(item);
  return (
    <View className={`flex flex-row items-start gap-2 ${style} m-1 p-4`}>
      {item.author?.image ? (
        <Image source={{ uri: item.author?.image }} className="h-12 w-12 rounded-full" />
      ) : (
        <Image source={ProfilePicture} className="h-8 w-8 rounded-full" />
      )}
      <View className="flex-1">
        <View className="flex-row justify-between">
          <Text className="font-bold text-text-main">
            {item.author.first_name} {item.author.last_name}
          </Text>
          <Text className="text-sm text-text-muted">{formatMessageDateTime(item.created_at)}</Text>
        </View>
        <Text className="text-base text-text-main">{item.content}</Text>
      </View>
    </View>
  );
};

export default PulseComment;
