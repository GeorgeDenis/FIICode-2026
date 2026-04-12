import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import PetService from '../../services/petService';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

const SimilaritySearchModal = ({ onClose }) => {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleSearch(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      handleSearch(result.assets[0].uri);
    }
  };

  const handleSearch = async (uri) => {
    setLoading(true);
    try {
      const data = await PetService.getSearchSimilarPetsByImage(uri);
      setResults(data);
    } catch (error) {
      alert('Error during semantic search.');
    } finally {
      setLoading(false);
    }
  };

  const renderResultItem = ({ item }) => (
    <Pressable
      onPress={() => router.push(`/profiles/${item.author.id}`)}
      className="bg-secondary/10 mr-4 w-60 overflow-hidden rounded-3xl border border-border shadow-sm">
      <View className="relative">
        <Image source={{ uri: item.image_data }} className="h-40 w-full" resizeMode="cover" />
        <View className="absolute bottom-2 right-2 rounded-full bg-blue-600 px-2 py-1">
          <Text className="text-[10px] font-black text-white">
            {Math.round(item.match_percentage)}% MATCH
          </Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="text-foreground text-sm font-bold" numberOfLines={1}>
          {item.ai_species}
        </Text>
        <Text className="text-foreground text-[10px] opacity-60" numberOfLines={1}>
          {item.ai_primary_color}
        </Text>
        <View className="mt-2 flex-row gap-1">
          {item.ai_tags?.slice(0, 2).map((tag, i) => (
            <View key={i} className="bg-primary/10 rounded px-1">
              <Text className="text-[8px] font-bold text-primary">{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <View className="w-full max-w-lg rounded-[40px] bg-background p-6 shadow-2xl">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-foreground text-2xl font-black">Semantic Search</Text>
            <Text className="text-foreground text-xs opacity-50">
              Find similar animals through AI
            </Text>
          </View>
          <Pressable onPress={onClose} className="bg-secondary/20 rounded-full p-2">
            <Ionicons name="close" size={24} color={theme.iconColor} />
          </Pressable>
        </View>

        {!image ? (
          <View className="mb-6 flex-row gap-4">
            <Pressable
              onPress={takePhoto}
              className="border-primary/30 bg-primary/5 flex-1 items-center justify-center rounded-3xl border-2 border-dashed p-10">
              <Ionicons name="camera-outline" size={40} color={theme.tabIconSelected} />
              <Text className="text-foreground mt-2 font-bold">Camera</Text>
            </Pressable>
            <Pressable
              onPress={pickImage}
              className="border-primary/30 bg-primary/5 flex-1 items-center justify-center rounded-3xl border-2 border-dashed p-10">
              <Ionicons name="images-outline" size={40} color={theme.tabIconSelected} />
              <Text className="text-foreground mt-2 font-bold">Gallery</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mb-8">
            <View className="relative mb-6 h-40 w-40 self-center overflow-hidden rounded-full border-4 border-primary shadow-xl">
              <Image source={{ uri: image }} className="h-full w-full" />
              {loading && (
                <View className="absolute inset-0 items-center justify-center bg-black/30">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>

            {results.length > 0 ? (
              <View>
                <Text className="text-foreground mb-3 text-sm font-bold opacity-70">
                  SIMILAR RESULTS
                </Text>
                <FlatList
                  data={results}
                  renderItem={renderResultItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 10 }}
                />
              </View>
            ) : (
              !loading && (
                <Text className="text-foreground py-10 text-center text-sm opacity-50">
                  No results found yet. Try another photo.
                </Text>
              )
            )}

            <Pressable
              onPress={() => {
                setImage(null);
                setResults([]);
              }}
              className="mt-6 self-center">
              <Text className="font-bold text-primary">CHANGE PHOTO</Text>
            </Pressable>
          </View>
        )}

        <View className="flex-row items-start rounded-2xl bg-orange-50 p-4">
          <Ionicons name="flash-outline" size={20} color="#f97316" />
          <Text className="ml-3 flex-1 text-[11px] leading-4 text-orange-700">
            Our algorithm scans visual features and semantic descriptions to find matches even if
            the photos are taken from different angles.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SimilaritySearchModal;
