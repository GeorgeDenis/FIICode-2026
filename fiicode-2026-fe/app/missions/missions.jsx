import React, { useState, useEffect, useContext } from 'react';
import UserOnly from '../../components/auth/UserOnly';
import { FlatList, Pressable, Text, View, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ActiveMissionCard from '../../components/missions/ActiveMissionCard';
import MyMissionCard from '../../components/missions/MyMissionCard';
import HistoryMissionCard from '../../components/missions/HistoryMissionCard';
import api from '../../services/api';
import { UserContext } from '../../contexts/UserContext';

const Missions = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('active');
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mission');
      setMissions(response.data);
    } catch (error) {
      console.error('Failed to load missions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const activeMissions = missions.filter(m => m.hero_id === user?.user_id && m.status !== 'Completed');
  const myMissions = missions.filter(m => m.pulse.author_id === user?.user_id && (m.status === 'Pending' || m.status === 'Accepted'));
  const historyMissions = missions.filter(m => m.status !== 'Pending' && m.status !== 'Accepted');

  const renderTab = (key, label) => (
    <Pressable
      className={`px-4 py-2 mx-1 rounded-full ${activeTab === key ? 'bg-blue-600' : 'bg-gray-200'}`}
      onPress={() => setActiveTab(key)}>
      <Text className={`font-semibold ${activeTab === key ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </Pressable>
  );

  const renderEmptyState = (title, message) => (
    <View className="flex-1 justify-center items-center mt-20">
      <Image 
        source={require('../../assets/img/empty_missions.png')} 
        className="w-48 h-48 opacity-90"
        resizeMode="contain" 
      />
      <Text className="text-lg font-bold text-gray-800 mt-6 text-center">{title}</Text>
      <Text className="text-sm text-gray-500 text-center mt-2 px-8">{message}</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      );
    }

    switch (activeTab) {
      case 'active':
        return (
          <FlatList
            data={activeMissions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ActiveMissionCard mission={item} />}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState('No Active Missions', "You are not currently assigned to any active missions. Explore available missions on the feed page to join.")}
          />
        );
      case 'mine':
        return (
          <FlatList
            data={myMissions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MyMissionCard mission={item} onMissionUpdate={fetchMissions} />}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState('No Ongoing Missions', "You haven't been assigned to any ongoing missions yet.")}
          />
        );
      case 'history':
        return (
          <FlatList
            data={historyMissions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryMissionCard mission={item} />}
            contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState('No Mission History', "You haven't completed any missions. Once you finish a mission, it will appear here.")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserOnly>
      <View className="flex flex-1 flex-col bg-background pt-4 px-4 w-full">
        <Stack.Screen
          options={{
            title: 'Missions',
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

        <View className="mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {renderTab('active', 'Active Missions')}
            {renderTab('mine', 'My Missions')}
            {renderTab('history', 'Missions History')}
          </ScrollView>
        </View>

        <View className="flex-1 w-full">
          {renderContent()}
        </View>
      </View>
    </UserOnly>
  );
};

export default Missions;
