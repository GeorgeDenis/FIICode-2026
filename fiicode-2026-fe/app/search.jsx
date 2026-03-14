import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, useColorScheme, View } from 'react-native';
import UserOnly from '../components/auth/UserOnly';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import api from '../services/api';
import UserSearchCard from '../components/UserSearchCard';

const SearchScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);

  const fetchUsers = async (query) => {
    try {
      const response = await api.get(`/user/search/?query=${query}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchUsers(searchQuery);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const handleCancelSearch = () => {
    setSearchQuery('');
    setUsers([]);
  };

  return (
    <UserOnly>
      <View className="flex-1 flex flex-col justify-start bg-background">
        <Stack.Screen
          options={{
            headerTitle: () => (
              <View className="flex flex-row items-center justify-center gap-3">
                <TextInput
                  autoFocus={true}
                  placeholder="Search for neighbors..."
                  placeholderTextColor={theme.iconColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="h-10 w-[260px] rounded-xl bg-gray-200 px-4 text-base text-black dark:bg-slate-700 dark:text-white"
                />
                <Pressable onPress={handleCancelSearch}>
                  <Ionicons name="close-circle" size={20} color={theme.iconColor} />
                </Pressable>
              </View>
            ),
            headerBackTitleVisible: false,
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Pressable
                className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={theme.iconColor} />
              </Pressable>
            ),
          }}
        />

        <View className="px-4 py-4">
          <Text className="mt-4 text-center text-text opacity-50">
            {searchQuery.length > 0
              ? `Searching: ${searchQuery}...`
              : 'Start typing to search for neighbors in your area!'}
          </Text>
        </View>
        <View className="flex-col flex-1 px-2.5 py-3.5 h-full">
          {users[0] ? (
            <FlatList
              data={users}
              renderItem={({ item }) => <UserSearchCard user={item} />}
              keyExtractor={(item) => item.id}
            />
          ) : (
            ''
          )}
        </View>
      </View>
    </UserOnly>
  );
};

export default SearchScreen;
