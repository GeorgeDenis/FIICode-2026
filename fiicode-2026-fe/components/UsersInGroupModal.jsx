import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const UsersInGroupModal = ({ conversationId, setVisible }) => {
  const [usersList, setUsersList] = useState([]);

  const fetchUsersInGroup = async () => {
    try {
      const response = await api.get(`/chat/group/users/?conversation_id=${conversationId}`);
      setUsersList(response.data);
    } catch (error) {
      console.error('Error fetching users in group:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUsersInGroup();
    }, [conversationId])
  );

  return (
    <View className="absolute inset-0 z-10 bg-black/50">
      <View className="elevation-sm absolute top-10 z-10 h-[600px] w-[95%] self-center rounded-xl bg-[#fff] px-5 py-12">
        <Pressable
          className="absolute right-4 top-4"
          onPress={() => {
            setVisible(false);
          }}>
          <Ionicons className="rounded-full bg-primary p-1" name="close" size={24} color="white" />
        </Pressable>
        <View className="flex flex-col items-center mb-4">
          <Text className="text-center text-xl font-bold">Members</Text>
          <Text className="text-sm">{usersList.length} people</Text>
        </View>
        <FlatList
          data={usersList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-surface  mb-3 flex flex-row items-center gap-2 rounded-xl  p-2 shadow-sm">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
                <Text className="text-xl font-bold text-white">
                  {`${item.first_name?.charAt(0) || ''}${item.last_name?.charAt(0) || ''}`.toUpperCase() ||
                    '?'}
                </Text>
              </View>
              <View className="flex w-full flex-col border-b p-1">
                <Text className="text-base font-bold ">
                  {item.first_name} {item.last_name}
                </Text>
                <Text className="text-sm text-gray-500">{item.email}</Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default UsersInGroupModal;
