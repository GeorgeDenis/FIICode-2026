import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCrisis } from '../../hooks/useCrisis';
import { successToast, errorToast } from '../../utils/toast';

const STATUS_OPTIONS = [
  { key: 'Safe', label: "I'm Safe", icon: 'shield-checkmark', color: 'bg-emerald-600', activeColor: 'bg-emerald-500', borderColor: 'border-emerald-400', dotColor: '#22C55E' },
  { key: 'Need Help', label: 'Need Help', icon: 'hand-left', color: 'bg-red-600', activeColor: 'bg-red-500', borderColor: 'border-red-400', dotColor: '#EF4444' },
  { key: 'Injured', label: 'Injured', icon: 'medkit', color: 'bg-orange-600', activeColor: 'bg-orange-500', borderColor: 'border-orange-400', dotColor: '#F97316' },
  { key: 'Available to Help', label: 'Can Help', icon: 'heart', color: 'bg-blue-600', activeColor: 'bg-blue-500', borderColor: 'border-blue-400', dotColor: '#3B82F6' },
];

const SafetyCheckIn = () => {
  const { myCheckInStatus, submitCheckIn } = useCrisis();

  const handleCheckIn = async (status) => {
    try {
      await submitCheckIn(status);
      successToast(`Status updated: ${status}`);
    } catch (error) {
      errorToast('Failed to update status');
    }
  };

  return (
    <View className="mx-4 mt-6">
      <Text className="text-sm font-bold text-gray-500 mb-3 tracking-widest">
        SAFETY CHECK-IN
      </Text>
      <View className="rounded-2xl bg-[#1A1A1A] border border-[#333] p-4">
        {myCheckInStatus && (
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-sm text-gray-400">Current status:</Text>
            <View className="rounded-full bg-[#333] px-3 py-1">
              <View className="flex-row items-center gap-1">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: STATUS_OPTIONS.find(s => s.key === myCheckInStatus)?.dotColor || '#6B7280' }}
              />
              <Text className="text-sm font-bold text-white">{myCheckInStatus}</Text>
            </View>
            </View>
          </View>
        )}
        <View className="flex-row flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = myCheckInStatus === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => handleCheckIn(option.key)}
                className={`flex-1 min-w-[45%] items-center rounded-2xl py-4 px-2 ${
                  isActive
                    ? `${option.activeColor} border-2 ${option.borderColor}`
                    : `${option.color} border-2 border-transparent`
                } active:opacity-80`}>
                <Ionicons name={option.icon} size={28} color="#FFFFFF" />
                <Text className="mt-1 text-sm font-bold text-white">{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default SafetyCheckIn;
