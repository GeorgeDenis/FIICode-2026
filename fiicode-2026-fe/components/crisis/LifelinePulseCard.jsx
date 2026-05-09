import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatMessageDateTime } from '../../utils/utils_functions';
import { useUser } from '../../hooks/useUser';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';

const LifelinePulseCard = ({ item }) => {
  const router = useRouter();
  const { user } = useUser();
  const isVerified = item.is_verified || item.author?.role >= 1;
  const [confirmCount, setConfirmCount] = useState(item.like_count ?? 0);
  const [confirmed, setConfirmed] = useState(false);

  const urgencyColors = {
    High: { bg: 'bg-red-900/60', border: 'border-red-600', badge: 'bg-red-600' },
    Medium: { bg: 'bg-amber-900/40', border: 'border-amber-700', badge: 'bg-amber-600' },
    Low: { bg: 'bg-gray-800', border: 'border-gray-600', badge: 'bg-gray-600' },
  };
  const urgency = urgencyColors[item.urgency_level] || urgencyColors.Low;

  const handleConfirm = async () => {
    if (user?.user_id === item.author_id) {
      errorToast('You cannot confirm your own pulse.');
      return;
    }
    try {
      const response = await api.post('/pulse/react', {
        pulse_id: item.id,
        is_like: true,
      });
      setConfirmCount(response.data.like_count);
      setConfirmed(true);
      successToast('Confirmed — thanks for verifying!');
    } catch {
      errorToast('Failed to confirm. Please try again.');
    }
  };

  const handleHelp = () => {
    router.push('/pulse-comments/' + item.id);
  };

  return (
    <View className={`rounded-2xl ${urgency.bg} border-2 ${urgency.border} overflow-hidden`}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-2">
          <View className="rounded-full bg-[#333] p-2">
            <Ionicons name="alert-circle" size={22} color="#F87171" />
          </View>
          <View>
            <View className="flex-row items-center gap-1">
              <Text className="font-bold text-white">
                {item.author ? `${item.author.first_name} ${item.author.last_name}` : 'Anonymous'}
              </Text>
              {isVerified && <Ionicons name="shield-checkmark" size={14} color="#FCD34D" />}
            </View>
            <Text className="text-xs text-gray-500">{formatMessageDateTime(item.created_at)}</Text>
          </View>
        </View>
        <View className={`${urgency.badge} rounded-full px-3 py-1`}>
          <Text className="text-xs font-extrabold text-white">{item.urgency_level?.toUpperCase()}</Text>
        </View>
      </View>

      <View className="px-4 pb-4">
        <Text className="text-base text-white leading-5">{item.content}</Text>
      </View>

      <View className="flex-row border-t border-[#333] px-2 py-2 gap-1">
        <Pressable
          onPress={() => router.push('/pulse-comments/' + item.id)}
          className="flex-1 flex-row items-center justify-center gap-1 rounded-xl py-2 active:bg-[#333]">
          <Ionicons name="chatbubble-outline" size={16} color="#9CA3AF" />
          <Text className="text-sm font-semibold text-gray-400">Comments</Text>
        </Pressable>
        <Pressable
          onPress={handleHelp}
          className="flex-1 flex-row items-center justify-center gap-1 rounded-xl py-2 bg-emerald-900/50 active:bg-emerald-800">
          <Ionicons name="hand-right" size={16} color="#34D399" />
          <Text className="text-sm font-semibold text-emerald-400">I Can Help</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={confirmed}
          className={`flex-1 flex-row items-center justify-center gap-1 rounded-xl py-2 ${confirmed ? 'bg-blue-900/50' : 'active:bg-[#333]'}`}>
          <Ionicons name="checkmark-circle" size={16} color={confirmed ? '#93C5FD' : '#60A5FA'} />
          <Text className="text-sm font-semibold text-blue-400">
            {confirmCount > 0 ? `${confirmCount}` : 'Confirm'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LifelinePulseCard;
