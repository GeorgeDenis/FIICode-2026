import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import BasicModal from './BasicModal';
import { errorToast, successToast } from '../utils/toast';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const AddInGroupModal = ({ conversationId, setVisible }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsersNotInGroup = async (query) => {
    try {
      const response = await api.get(
        `/chat/group/search/?query=${query}&conversation_id=${conversationId}`
      );
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 0) {
      fetchUsersNotInGroup(searchQuery);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const handleAddToGroup = async () => {
    if (!selectedUser) {
      errorToast('Please select a user to add');
      return;
    }
    try {
      const response = await api.put('chat/group/add_user', {
        user_id: selectedUser.id,
        conversation_id: conversationId,
      });
      if (response.status === 200) {
        successToast('Successfully added user');
        setSelectedUser(null);
        await fetchUsersNotInGroup();
      }
    } catch (err) {
      errorToast(err.message);
    }
  };

  const handleSelectUser = (user) => {
    if (selectedUser) {
      if (selectedUser.id === user.id) {
        setSelectedUser(null);
        return;
      }
    }
    setSelectedUser(user);
  };

  return (
    <BasicModal setVisible={setVisible} doAction={handleAddToGroup} doActionText="Add">
      <Text className="mb-4 text-center text-xl font-bold">Add user to group</Text>
      <View className="flex w-full flex-row items-center justify-center gap-2">
        <TextInput
          className="b-0.5 w-[80%] rounded-3xl border p-3"
          placeholder="User email"
          value={searchQuery}
          onChangeText={(value) => setSearchQuery(value)}
        />
        <Pressable>
          <Ionicons
            name={searchQuery.length > 0 ? 'close-circle' : 'search'}
            size={20}
            color="gray"
            onPress={() => setSearchQuery('')}
          />
        </Pressable>
      </View>
      <View className="flex h-[250px] flex-col justify-center">
        {users && users.length > 0 ? (
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <Pressable
                className={`bg-surface shadow-sm" mb-3 mt-2 flex flex-row items-center justify-center gap-2 rounded-3xl border p-3.5 ${
                  selectedUser?.id === item.id ? 'bg-gray-400' : ''
                }`}
                onPress={() => handleSelectUser(item)}>
                <View className="bg-surface flex flex-row items-center gap-2 rounded-xl shadow-sm">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-primary shadow-sm">
                    <Text className="text-xl font-bold text-white">
                      {`${item.first_name?.charAt(0) || ''}${item.last_name?.charAt(0) || ''}`.toUpperCase() ||
                        '?'}
                    </Text>
                  </View>
                  <View className="flex flex-1 flex-row items-center">
                    <View className="flex flex-1 flex-col">
                      <Text className="text-base font-bold" numberOfLines={1}>
                        {item.first_name} {item.last_name}
                      </Text>
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {item.email}
                      </Text>
                    </View>

                    <Ionicons name="person-add-outline" size={20} color="gray" />
                  </View>
                </View>
              </Pressable>
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text className="text-center text-gray-400">No users found</Text>
        )}
      </View>
    </BasicModal>
  );
};

export default AddInGroupModal;
