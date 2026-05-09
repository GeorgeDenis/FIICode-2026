import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack, useRouter } from 'expo-router';
import ToastManager from 'toastify-react-native';
import { UserProvider } from '../contexts/UserContext';
import { CrisisProvider } from '../contexts/CrisisContext';
import EmergencyBanner from '../components/crisis/EmergencyBanner';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function Layout() {
  const router = useRouter();
  return (
    <UserProvider>
      <CrisisProvider>
        <SafeAreaProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen
              name="pulse-comments/[id]"
              options={{
                title: '',
                headerBackTitleVisible: false,
                headerBackTitle: '',
                headerLeft: () => (
                  <Pressable
                    className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                    onPress={() => router.back()}>
                    <Ionicons name="return-up-back-outline" size={24} color="#000" />
                  </Pressable>
                ),
              }}
            />
          </Stack>
        </SafeAreaProvider>
        <ToastManager />
      </CrisisProvider>
    </UserProvider>
  );
}
