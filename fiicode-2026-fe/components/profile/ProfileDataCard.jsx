import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileDataCard = ({ text, value, imageColor, imageBackground, imageType }) => {
  return (
    <View className="flex-1 flex-col items-start rounded-xl bg-surface p-5 shadow-sm">
      <View className={`rounded-lg ${imageBackground} p-1`}>
        <Ionicons name={imageType} size={24} color={imageColor} />
      </View>
      <Text className="mt-2 text-2xl font-bold text-text-main">{value}</Text>
      <Text className="text-sm text-text-muted">{text}</Text>
    </View>
  );
};

export default ProfileDataCard;
