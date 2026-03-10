import { Link, useFocusEffect } from 'expo-router';

import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import { User } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useUser } from '../hooks/useUser';

export default function Home() {
  const { user } = useUser();
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';

  useFocusEffect(
    useCallback(() => {
      return () => {
        // fetchData();
      };
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="w-full flex-row items-center justify-end gap-2 px-6">
        <ThemeToggle />
        <Link href={user ? "/profile" : "/login"} asChild>
          <Pressable className="rounded-full border-2 border-primary p-2 active:opacity-50">
            <User color={iconColor} size={20} />
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
