import { Image, Pressable, Text, View } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { formatMessageDateTime } from '../../utils/utils_functions';
import { useColorScheme } from 'nativewind';
import { Flag } from 'lucide-react-native';
import AddReportModal from '../admin/reports/AddReportModal';

export default function MessageComponent({ item, user }) {
  const status = item.author_id !== user.user_id;
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
  const reportIconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  return (
    <View>
      <View className={`mb-4 flex w-full flex-col  ${status ? 'items-start' : 'items-end'} `}>
        <View className="flex flex-row items-center gap-1">
          {item.author?.image ? (
            <Image source={{ uri: item.author?.image }} className="h-12 w-12 rounded-full" />
          ) : (
            <Ionicons className="mr-4=" name="person-circle-outline" size={45} color={iconColor} />
          )}
          <View
            className={`mb-0.5 max-w-[70%] rounded-xl p-3.5 ${status ? 'bg-bubble-received text-bubble-received-text' : 'bg-bubble-sent text-bubble-sent-text'}`}>
            {item.is_visible ? (
              <Text
                className={` ${status ? 'text-bubble-received-text' : 'text-bubble-sent-text'}`}>
                {item.text}
              </Text>
            ) : (
              <Text
                className="text-text-main font-bold">
                {"Your message was hidden because it doesn't follow the community guidelines."}
              </Text>
            )}
          </View>
          {status && (
            <Pressable onPress={() => setIsReportModalVisible(true)} className="p-2">
              <Flag color={reportIconColor} size={18} />
            </Pressable>
          )}
        </View>
        <Text
          className={`mt-1 ${status ? 'text-bubble-received-muted' : 'text-bubble-sent-muted'}`}>
          {formatMessageDateTime(item.created_at)}
        </Text>
      </View>

      <AddReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        itemType="Message"
        item={item}
      />
    </View>
  );
}
