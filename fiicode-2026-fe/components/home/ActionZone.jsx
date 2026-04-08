import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { HeartHandshake, MessageSquareWarning } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const ActionZone = () => {
  const router = useRouter();

  return (
    <View className="mx-5 mb-8 mt-8 flex-row items-center justify-center gap-6">
      <Pressable
        className="flex-1 flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-200 p-6 shadow-sm active:bg-rose-300"
        onPress={() => router.push('/(dashboard)/feed')}>
        <MessageSquareWarning size={32} color="#e11d48" className="mb-3" />
        <Text className="text-base font-extrabold text-rose-700">I need help</Text>
      </Pressable>

      <Pressable
        className="flex-1 flex-col items-center justify-center rounded-3xl border border-emerald-100 bg-emerald-200 p-6 shadow-sm active:bg-emerald-300"
        onPress={() => router.push('/(dashboard)/map')}>
        <HeartHandshake size={32} color="#059669" className="mb-3" />
        <Text className="text-base font-extrabold text-emerald-700">I want to help</Text>
      </Pressable>
    </View>
  );
};

export default ActionZone;
