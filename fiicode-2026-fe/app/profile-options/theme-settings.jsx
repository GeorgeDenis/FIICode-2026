import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import ThemeToggle from '../../components/ThemeToggle';

const ThemeSettings = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const iconColor = colorScheme === 'dark' ? '#94A3B8' : '#64748B';
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Stack.Screen
        options={{
          headerTitle: 'Theme Settings',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="return-up-back-outline" size={20} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />
      <ThemeToggle />
    </ScrollView>
  );
};

export default ThemeSettings;
