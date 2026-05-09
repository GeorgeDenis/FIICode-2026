import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import PetService from '../../services/petService';
import PetCard from '../../components/pets/PetCard';
import UploadLostAnimalModal from '../../components/pets/UploadLostAnimalModal';
import SimilaritySearchModal from '../../components/pets/SimilaritySearchModal';
import EmergencyBanner from '../../components/crisis/EmergencyBanner';

const PetsDashboard = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [showMyPets, setShowMyPets] = useState(false);

  const loadPets = async () => {
    try {
      setLoading(true);
      const data = showMyPets ? await PetService.getMyPets() : await PetService.getPets();
      setPets(data);
    } catch (error) {
      console.error('Failed to load pets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [showMyPets]);

  const onRefresh = () => {
    setRefreshing(true);
    loadPets();
  };

  const handleUploadComplete = () => {
    setIsModalVisible(false);
    loadPets();
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Pets Dashboard',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="return-up-back-outline" size={20} color={theme.iconColor} />
            </Pressable>
          ),
          headerRight: () => (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => {
                  if (!isModalVisible) {
                    setIsSearchModalVisible(true);
                  }
                }}
                className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <Ionicons name="search-outline" size={20} color={theme.tabIconSelected} />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!isSearchModalVisible) {
                    setIsModalVisible(true);
                  }
                }}
                className="bg-primary/10 mr-2 flex h-10 w-10 items-center justify-center rounded-full">
                <Ionicons name="add-circle-outline" size={24} color={theme.tabIconSelected} />
              </Pressable>
            </View>
          ),
        }}
      />
      <EmergencyBanner />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-foreground text-2xl font-black">Lost Pets</Text>
            <Text className="text-foreground text-sm opacity-60">
              Find your companion through AI
            </Text>
          </View>
          <Ionicons
            name="paw-outline"
            size={32}
            color={theme.tabIconSelected}
            className="opacity-20"
          />
        </View>

        <View className="bg-secondary/10 mb-6 flex-row rounded-2xl p-1">
          <Pressable
            onPress={() => setShowMyPets(false)}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${!showMyPets ? 'bg-slate-300' : ''}`}>
            <Text className={`text-xs font-bold ${!showMyPets ? 'text-primary' : 'opacity-50'}`}>
              ALL POSTS
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setShowMyPets(true)}
            className={`flex-1 items-center justify-center rounded-xl py-3 ${showMyPets ? 'bg-slate-300' : ''}`}>
            <Text className={`text-xs font-bold ${showMyPets ? 'text-primary' : 'opacity-50'}`}>
              MY PULSES
            </Text>
          </Pressable>
        </View>

        {loading && !refreshing ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color={theme.tabIconSelected} />
            <Text className="text-foreground mt-4 font-bold opacity-50">
              {showMyPets ? 'Fetching your reports...' : 'Scanning pet pulses...'}
            </Text>
          </View>
        ) : pets.length === 0 ? (
          <View className="bg-card mt-20 items-center justify-center rounded-3xl p-10 py-16">
            <View className="bg-secondary/10 mb-4 rounded-full p-6">
              <Ionicons name="search-outline" size={48} color="#ccc" />
            </View>
            <Text className="text-foreground text-center text-lg font-bold">
              {showMyPets ? 'No posts yet' : 'No pets reported'}
            </Text>
            <Text className="text-foreground mt-2 text-center text-xs opacity-50">
              {showMyPets
                ? "You haven't reported any animals yet."
                : 'Be the first to report a lost or found animal in the area.'}
            </Text>
            {!showMyPets && (
              <Pressable
                onPress={() => setIsModalVisible(true)}
                className="mt-8 rounded-2xl bg-primary px-10 py-4 shadow-lg">
                <Text className="font-bold text-white">REPORT NOW</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="pb-20">
            {pets
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((pet) => (
                <PetCard key={pet.id} pet={pet} onRefresh={loadPets} />
              ))}
          </View>
        )}
      </ScrollView>

      {isModalVisible && !isSearchModalVisible && (
        <UploadLostAnimalModal
          onClose={() => setIsModalVisible(false)}
          onComplete={handleUploadComplete}
        />
      )}

      {isSearchModalVisible && !isModalVisible && (
        <SimilaritySearchModal onClose={() => setIsSearchModalVisible(false)} />
      )}
    </View>
  );
};

export default PetsDashboard;
