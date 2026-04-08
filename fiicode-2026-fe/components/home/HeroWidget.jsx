import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from 'expo-router';
import { errorToast } from '../../utils/toast';

const HeroWidget = ({ latitude, longitude }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

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
          setCurrentUser({
            firstName: first_name,
            lastName: last_name,
            description,
            email,
            profileImageUrl: image,
            skills,
            distance_limit_km,
            quiet_hours_start,
            quiet_hours_end,
          });
        } catch (error) {
          if (error.response && error.response.status === 403) {
            return;
          }
          errorToast(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <View className="mx-4 mb-4 h-32 items-center justify-center rounded-3xl bg-surface shadow-sm">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  if (!currentUser) return null;

  const isQuietModeActive = () => {
    if (!currentUser?.quiet_hours_start || !currentUser?.quiet_hours_end) {
      return false;
    }

    const toMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start = toMinutes(currentUser.quiet_hours_start);
    const end = toMinutes(currentUser.quiet_hours_end);

    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    if (start < end) {
      return current >= start && current <= end;
    } else {
      return current >= start || current <= end;
    }
  };

  const isQuiet = isQuietModeActive();

  const getCardBg = () => {
    return isQuiet ? 'bg-rose-500' : 'bg-emerald-500';
  };

  return (
    <View className={`mx-4 mb-4 mt-2 overflow-hidden rounded-3xl ${getCardBg()} p-5 shadow-lg`}>
      <View className="mb-4 flex-row items-center justify-between opacity-90">
        <View className="flex-row items-center">
          <Ionicons name="shield-checkmark" size={16} color="white" />
          <Text className="ml-1 text-xs font-extrabold uppercase tracking-widest text-white">
            Hero Status
          </Text>
        </View>

        <View className="rounded-full bg-white/20 px-3 py-1">
          <Text className="text-[10px] font-bold uppercase text-white">
            {isQuiet ? 'Do Not Disturb' : 'Active'}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="mb-1 text-xl font-extrabold text-white">
            {isQuiet ? 'You are in silent mode.' : 'You are at the reception!'}
          </Text>
          <Text className="text-sm font-medium leading-5 text-white/80">
            {isQuiet
              ? 'You will not receive emergency alerts during this time frame.'
              : `We monitor a radius of ${currentUser.distance_limit_km} km to find people who need you.`}
          </Text>
        </View>

        <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20 active:bg-white/30">
          <Ionicons name={isQuiet ? 'moon' : 'radio'} size={26} color="white" />
        </View>
      </View>
    </View>
  );
};

export default HeroWidget;
