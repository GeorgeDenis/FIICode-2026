import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSafety } from '../../hooks/useSafety';
import { useUser } from '../../hooks/useUser';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

const DURATION_PRESETS = [15, 30, 60, 90];

export default function SafetyHub() {
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    contacts,
    activeTimer,
    loading,
    requestContact,
    acceptContact,
    removeContact,
    startTimer,
    cancelTimer,
  } = useSafety();
  const [emailInput, setEmailInput] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('30');
  const [timeLeft, setTimeLeft] = useState(null);

  const getSecondsLeft = useCallback(() => {
    if (!activeTimer?.expires_at) return 0;

    const expiresStr = activeTimer.expires_at.endsWith('Z')
      ? activeTimer.expires_at
      : activeTimer.expires_at + 'Z';
    const diff = Math.floor((new Date(expiresStr) - Date.now()) / 1000);
    return Math.max(0, diff);
  }, [activeTimer]);

  useEffect(() => {
    if (!activeTimer) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getSecondsLeft());

    const interval = setInterval(() => {
      const secs = getSecondsLeft();
      setTimeLeft(secs);
      if (secs <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, getSecondsLeft]);

  const formatTime = (totalSeconds) => {
    if (totalSeconds === null || isNaN(totalSeconds)) return '--:--:--';
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleStartTimer = async () => {
    const mins = parseFloat(timerMinutes);
    if (isNaN(mins) || mins <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid number of minutes.');
      return;
    }

    let lat = null,
      lon = null;
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      lat = loc.coords.latitude;
      lon = loc.coords.longitude;
    }

    startTimer(mins, lat, lon);
  };

  const bg = isDark ? 'bg-[#0F172A]' : 'bg-gray-100';
  const card = isDark ? 'bg-[#1E293B]' : 'bg-white';
  const border = isDark ? 'border-slate-700' : 'border-gray-200';
  const textMain = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const inputBg = isDark
    ? 'bg-[#0F172A] border-slate-700 text-white'
    : 'bg-gray-100 border-gray-200 text-gray-900';
  const ph = isDark ? '#64748B' : '#9CA3AF';

  return (
    <SafeAreaView className={`flex-1 ${bg}`}>
      <View className="flex-row items-center gap-3 px-5 pb-3 pt-4">
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-50">
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111'} />
        </Pressable>
        <View>
          <Text className={`text-2xl font-extrabold ${textMain}`}>Safety Hub</Text>
          <Text className={`text-xs ${textMuted}`}>Trusted contacts & safety timer</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className={`mt-2 rounded-3xl p-5 ${card} border ${border}`}>
          <View className="mb-1 flex-row items-center gap-2">
            <Ionicons name="timer-outline" size={22} color="#6366F1" />
            <Text className={`text-lg font-bold ${textMain}`}>Safety Timer</Text>
          </View>
          <Text className={`text-xs ${textMuted} mb-4 leading-4`}>
            Start a countdown when walking alone. If you don't cancel in time, your trusted contacts
            get alerted with your location.
          </Text>

          {activeTimer ? (
            <View
              className={`items-center rounded-2xl py-5 ${isDark ? 'bg-[#0F172A]' : 'bg-gray-50'} border ${border}`}>
              <Text className={`mb-2 text-xs font-bold tracking-widest ${textMuted}`}>
                TIME REMAINING
              </Text>
              <Text
                className={`text-5xl font-black tabular-nums ${timeLeft === 0 ? 'text-red-500' : 'text-indigo-500'}`}>
                {formatTime(timeLeft)}
              </Text>
              {timeLeft === 0 && (
                <Text className="mt-2 text-sm font-semibold text-red-400">
                  Timer expired — contacts have been alerted
                </Text>
              )}
              <Pressable
                onPress={cancelTimer}
                disabled={loading}
                className="mt-6 flex-row items-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 shadow-sm active:bg-emerald-600">
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                    <Text className="text-base font-bold text-white">I'm Safe — Cancel Timer</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <View>
              <View className="mb-3 flex-row gap-2">
                {DURATION_PRESETS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => setTimerMinutes(String(p))}
                    className={`flex-1 items-center rounded-xl border py-2 ${timerMinutes === String(p) ? 'border-indigo-400 bg-indigo-500' : `${isDark ? 'border-slate-600 bg-slate-700' : 'border-gray-200 bg-gray-100'}`}`}>
                    <Text
                      className={`text-sm font-bold ${timerMinutes === String(p) ? 'text-white' : textMuted}`}>
                      {p}m
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View className="mb-4 flex-row items-center gap-3">
                <TextInput
                  value={timerMinutes}
                  onChangeText={setTimerMinutes}
                  keyboardType="numeric"
                  className={`h-12 flex-1 rounded-xl border-2 px-4 text-lg font-semibold ${inputBg}`}
                  placeholder="Custom minutes"
                  placeholderTextColor={ph}
                />
              </View>

              <Pressable
                onPress={handleStartTimer}
                disabled={loading}
                className="h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-indigo-600 shadow-sm active:bg-indigo-700">
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={22} color="#FFF" />
                    <Text className="text-base font-bold text-white">Start Safety Timer</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        <View className="mb-10 mt-5">
          <Text className={`mb-3 text-lg font-bold ${textMain}`}>Trusted Contacts</Text>

          <View className={`mb-4 flex-row gap-2 rounded-2xl p-4 ${card} border ${border}`}>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Friend's email address"
              placeholderTextColor={ph}
              className={`h-11 flex-1 rounded-xl border px-3 ${inputBg}`}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Pressable
              onPress={() => {
                requestContact(emailInput);
                setEmailInput('');
              }}
              disabled={!emailInput.trim() || loading}
              className={`h-11 items-center justify-center rounded-xl px-5 ${!emailInput.trim() ? (isDark ? 'bg-slate-700' : 'bg-gray-200') : 'bg-indigo-600 active:bg-indigo-700'}`}>
              <Text className={`font-bold ${!emailInput.trim() ? textMuted : 'text-white'}`}>
                Send
              </Text>
            </Pressable>
          </View>

          {contacts.length === 0 ? (
            <View
              className={`items-center rounded-2xl py-10 ${card} border border-dashed ${border}`}>
              <Ionicons name="people-outline" size={44} color={isDark ? '#334155' : '#D1D5DB'} />
              <Text className={`mt-3 font-semibold ${textMuted}`}>No trusted contacts yet</Text>
              <Text className={`mt-1 px-8 text-center text-xs ${textMuted}`}>
                Add someone by email so they can be alerted if your timer expires.
              </Text>
            </View>
          ) : (
            contacts.map((c) => {
              const isMeTruster = String(c.user_id) === String(user?.user_id);
              const otherUser = isMeTruster ? c.contact : c.user;
              if (!otherUser) return null;

              const isPendingForMe = !isMeTruster && c.status === 'PENDING';
              const isPendingSent = isMeTruster && c.status === 'PENDING';

              return (
                <View
                  key={c.id}
                  className={`${card} mb-3 flex-row items-center rounded-2xl border p-4 ${border}`}>
                  <View className="flex-1">
                    <Text className={`font-bold ${textMain}`}>
                      {otherUser.first_name} {otherUser.last_name}
                    </Text>
                    <Text className={`text-xs ${textMuted}`}>{otherUser.email}</Text>
                    {isPendingSent && (
                      <Text className="mt-1 text-xs font-semibold text-amber-500">
                        Awaiting acceptance…
                      </Text>
                    )}
                    {c.status === 'ACCEPTED' && (
                      <Text className="mt-1 text-xs font-semibold text-emerald-500">
                        ✓ Active — will be alerted
                      </Text>
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    {isPendingForMe && (
                      <Pressable
                        onPress={() => acceptContact(c.id)}
                        className="rounded-full bg-emerald-500 p-2.5 active:opacity-50">
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => removeContact(c.id)}
                      className={`rounded-full border p-2.5 ${isDark ? 'border-red-800 bg-red-950' : 'border-red-200 bg-red-50'} active:opacity-50`}>
                      <Ionicons name="close" size={18} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
