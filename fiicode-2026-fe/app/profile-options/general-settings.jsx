import React, { useCallback, useState } from 'react';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { parseTimeStringToDate } from '../../utils/utils_functions';

const GeneralSettings = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    profileImageUrl: null,
    skills: null,
    distanceLimitKm: null,
    quietHoursStart: null,
    quietHoursEnd: null,
  });
  const [distance, setDistance] = useState(null);

  const [quietStart, setQuietStart] = useState(new Date(new Date().setHours(22, 0, 0, 0)));
  const [quietEnd, setQuietEnd] = useState(new Date(new Date().setHours(8, 0, 0, 0)));

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/account');
      const {
        first_name,
        last_name,
        email,
        description,
        image,
        skills,
        distance_limit_km,
        quiet_hours_start,
        quiet_hours_end,
      } = response.data;
      setUser({
        firstName: first_name,
        lastName: last_name,
        description,
        email,
        profileImageUrl: image,
        skills,
        distanceLimitKm: distance_limit_km,
        quietHoursStart: quiet_hours_start,
        quietHoursEnd: quiet_hours_end,
      });
      setDistance(distance_limit_km || 5);
      setQuietStart(parseTimeStringToDate(quiet_hours_start));
      setQuietEnd(parseTimeStringToDate(quiet_hours_end));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return;
      }
      errorToast(error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveSettings = async () => {
    try {
      await api.put('/auth', {
        first_name: user.firstName,
        last_name: user.lastName,
        description: user.description,
        skills: user.skills,
        distance_limit_km: distance,
        quiet_hours_start: quietStart,
        quiet_hours_end: quietEnd,
      });
      successToast('Profile updated successfully.');
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Stack.Screen
        options={{
          headerTitle: 'General Settings',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="return-up-back-outline" size={20} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />
      <View className="mb-8 rounded-2xl border border-gray-100 bg-surface p-4 shadow-sm">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Ionicons name="location" size={24} color="#10b981" />
            <Text className="text-lg font-bold text-text-main">Action Range</Text>
          </View>
          <Text className="text-lg font-bold text-primary">{distance?.toFixed(1)} km</Text>
        </View>

        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={1}
          maximumValue={10}
          step={0.5}
          value={distance}
          onValueChange={(val) => setDistance(val)}
          minimumTrackTintColor="#10b981"
          maximumTrackTintColor="#d1d5db"
          thumbTintColor="#10b981"
        />
        <Text className="mt-2 text-center text-xs text-text-muted">
          You are only going to get alerts for events in this area.
        </Text>
      </View>

      <View className="mb-8 rounded-2xl border border-gray-100 bg-surface p-4 shadow-sm">
        <View className="mb-4 flex-row items-center gap-2">
          <Ionicons name="moon" size={24} color="#6366f1" />
          <Text className="text-lg font-bold text-text-main">Quiet Hours</Text>
        </View>
        <Text className="mb-4 text-sm text-text-muted">
          {"During quiet hours, you won't receive any notifications. Set the time when you want to be undisturbed."}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="items-center">
            <Text className="mb-1 text-sm text-text-muted">Starting at:</Text>
            <Pressable
              onPress={() => {
                setShowStartPicker((prev) => !prev);
                setShowEndPicker(false);
              }}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2">
              <Text className="text-lg font-bold text-text-main">{formatTime(quietStart)}</Text>
            </Pressable>
          </View>

          <Ionicons name="arrow-forward" size={20} color="#9ca3af" />

          <View className="items-center">
            <Text className="mb-1 text-sm text-text-muted">Ending at:</Text>
            <Pressable
              onPress={() => {
                setShowEndPicker((prev) => !prev);
                setShowStartPicker(false);
              }}
              className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2">
              <Text className="text-lg font-bold text-text-main">{formatTime(quietEnd)}</Text>
            </Pressable>
          </View>
        </View>

        {showStartPicker && !showEndPicker && (
          <RNDateTimePicker
            mode="time"
            value={quietStart}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) setQuietStart(selectedDate);
            }}
          />
        )}

        {showEndPicker && !showStartPicker && (
          <RNDateTimePicker
            mode="time"
            value={quietEnd}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) setQuietEnd(selectedDate);
            }}
          />
        )}
      </View>

      <Pressable
        onPress={handleSaveSettings}
        className="mb-8 mt-auto items-center rounded-xl bg-primary p-4">
        <Text className="text-lg font-bold text-white">Salvează Setările</Text>
      </Pressable>
    </ScrollView>
  );
};

export default GeneralSettings;
