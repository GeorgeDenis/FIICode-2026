import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useColorScheme } from 'react-native';
import PetService from '../../../services/petService';
import PetCard from '../../../components/pets/PetCard';

const SimilarityResultsPage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [similarPets, setSimilarPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSimilar = async () => {
    try {
      const data = await PetService.getSimilarPetsById(id);
      setSimilarPets(data);
    } catch (error) {
      console.error('Error fetching similar pets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSimilar();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSimilar();
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Similarity Analysis',
          headerLeft: () => (
            <Pressable
              className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
              onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={theme.iconColor} />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-8 rounded-[32px] bg-primary/10 p-6 shadow-sm">
          <View className="flex-row items-center gap-4">
             <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-sm">
                <Ionicons name="analytics" size={24} color="white" />
             </View>
             <View className="flex-1">
                <Text className="text-lg font-black text-foreground">AI Match Results</Text>
                <Text className="text-xs opacity-60 text-foreground">Similarity score is calculated based on visual descriptions and semantic AI embeddings.</Text>
             </View>
          </View>
        </View>

        {loading ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color={theme.tabIconSelected} />
            <Text className="mt-4 font-bold opacity-50 text-foreground">Calculating matches...</Text>
          </View>
        ) : similarPets.length === 0 ? (
          <View className="mt-20 items-center justify-center rounded-3xl bg-secondary/5 p-10 py-20">
            <Ionicons name="sparkles-outline" size={48} color="#ccc" />
            <Text className="mt-4 text-center text-lg font-bold text-foreground">No matches found</Text>
            <Text className="mt-2 text-center text-xs opacity-50 text-foreground">We haven't found other animals with a high similarity score in our database.</Text>
          </View>
        ) : (
          <View className="pb-10">
            {similarPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} showMatchPercentage={true} />
            ))}
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-6 left-6 right-6">
        <Pressable 
            onPress={() => router.back()}
            className="flex-row items-center justify-center rounded-2xl bg-foreground p-4 shadow-xl"
        >
            <Text className="font-bold text-background">BACK TO DASHBOARD</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SimilarityResultsPage;
