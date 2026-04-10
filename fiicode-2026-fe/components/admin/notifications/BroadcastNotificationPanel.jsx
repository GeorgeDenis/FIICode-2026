import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import api from '../../../services/api';
import { errorToast, successToast } from '../../../utils/toast';

const BroadcastNotificationPanel = () => {
  const [radius, setRadius] = useState('5');
  const [content, setContent] = useState('');
  const [type, setType] = useState('News'); // 'Emergency' or 'News'
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        errorToast('Permission to access location was denied');
        setFetchingLocation(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setFetchingLocation(false);
    })();
  }, []);

  const handleBroadcast = async () => {
    if (!content.trim()) {
      errorToast('Please enter notification content');
      return;
    }
    if (!location) {
      errorToast('Location data not available');
      return;
    }

    Alert.alert(
      'Confirm Broadcast',
      `Are you sure you want to send this ${type} notification to all users within ${radius}km?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Broadcast',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.post('/notification/broadcast', {
                latitude: location.latitude,
                longitude: location.longitude,
                radius: parseFloat(radius),
                content: content,
                type: type,
              });
              successToast(`Broadcast sent! Users notified: ${response.data.users_notified}`);
              setContent('');
            } catch (error) {
              errorToast(
                'Failed to send broadcast: ' + (error.response?.data?.detail || error.message)
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (fetchingLocation) {
    return (
      <View className="flex-1 items-center justify-center p-10">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-slate-500">Getting current location...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="mt-4 flex-1 p-4">
      <View className="mb-6 rounded-3xl border border-slate-300 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <Text className="mb-6 text-xl font-black text-slate-800 dark:text-slate-100">
          Geo-Broadcast
        </Text>

        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Notification Type
        </Text>
        <View className="mb-6 flex-row items-center gap-3">
          <Pressable
            onPress={() => setType('News')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 py-4 ${type === 'News' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
            <Ionicons
              name="information-circle"
              size={20}
              color={type === 'News' ? '#3B82F6' : '#94A3B8'}
            />
            <Text className={`font-bold ${type === 'News' ? 'text-blue-600' : 'text-slate-500'}`}>
              News
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('Emergency')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 py-4 ${type === 'Emergency' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
            <Ionicons
              name="alert-circle"
              size={20}
              color={type === 'Emergency' ? '#F43F5E' : '#94A3B8'}
            />
            <Text
              className={`font-bold ${type === 'Emergency' ? 'text-rose-600' : 'text-slate-500'}`}>
              Emergency
            </Text>
          </Pressable>
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Target Radius (km)
        </Text>
        <View className="mb-6 flex-row items-center rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <Ionicons name="resize-outline" size={24} color="#6366F1" />
          <TextInput
            className="ml-3 flex-1 text-lg font-bold text-slate-800 dark:text-slate-100"
            keyboardType="numeric"
            value={radius}
            onChangeText={setRadius}
            placeholder="E.g. 5"
          />
        </View>

        <Text className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          Message Content
        </Text>
        <TextInput
          className="mb-8 block h-32 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          placeholder="Enter your broadcast message here..."
          placeholderTextColor="#94A3B8"
          multiline
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
        />

        <Pressable
          onPress={handleBroadcast}
          disabled={loading}
          className={`flex-row items-center justify-center gap-3 rounded-2xl py-3 shadow-lg ${type === 'Emergency' ? 'bg-rose-600' : 'bg-blue-600'} active:opacity-80`}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text className="text-base font-black text-white">SEND BROADCAST</Text>
            </>
          )}
        </Pressable>
      </View>

      <View className="mb-20 rounded-2xl bg-slate-100 border border-slate-300 p-4 dark:bg-slate-800">
        <Text className="mb-2 text-xs font-bold uppercase text-slate-500">Technical Details</Text>
        <Text className="text-xs text-slate-400">
          Center: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}
        </Text>
        <Text className="text-xs text-slate-400">Radius: {radius} km</Text>
      </View>
    </ScrollView>
  );
};

export default BroadcastNotificationPanel;
