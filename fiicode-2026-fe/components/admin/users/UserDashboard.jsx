import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { errorToast, successToast } from '../../../utils/toast';
import UserManagementCard from './UserManagementCard';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user');
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      errorToast('Failed to fetch users: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        return fullName.includes(lowerQuery) || user.email.toLowerCase().includes(lowerQuery);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/user/${userId}`);
      successToast('User deleted successfully');
      fetchUsers();
    } catch (error) {
      errorToast('Failed to delete user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await api.post(`/user/promote/${userId}`);
      successToast('User promoted to admin');
      fetchUsers();
    } catch (error) {
      errorToast('Failed to promote user: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-slate-950">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-slate-500">Loading users...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-slate-950">
      <View className="px-4 pt-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            className="ml-2 flex-1 text-base text-slate-800 dark:text-slate-100"
            placeholder="Search users by name or email..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Ionicons
              name="close-circle"
              size={20}
              color="#94A3B8"
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserManagementCard
            user={item}
            onDelete={handleDeleteUser}
            onPromote={handlePromoteUser}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center pt-20">
            <Ionicons name="people-outline" size={80} color="#CBD5E1" />
            <Text className="mt-4 text-xl font-medium text-slate-400">No users found</Text>
          </View>
        }
      />
    </View>
  );
};

export default UserDashboard;
