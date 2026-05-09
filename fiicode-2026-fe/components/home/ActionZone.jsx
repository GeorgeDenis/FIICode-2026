import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { HeartHandshake, MessageSquareWarning, AlertTriangle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import ReportIncidentModal from '../crisis/ReportIncidentModal';

const ActionZone = () => {
  const router = useRouter();
  const [reportModalVisible, setReportModalVisible] = useState(false);

  return (
    <View className="mx-5 mb-8 mt-8 flex-col gap-4">
      <View className="flex-row items-center justify-center gap-4">
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

      <Pressable
        className="flex-col items-center justify-center rounded-3xl border border-amber-100 bg-amber-200 p-4 shadow-sm active:bg-amber-300"
        onPress={() => setReportModalVisible(true)}>
        <AlertTriangle size={28} color="#d97706" className="mb-2" />
        <Text className="text-base font-extrabold text-amber-700">Report an Incident</Text>
      </Pressable>

      <ReportIncidentModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
      />
    </View>
  );
};

export default ActionZone;
