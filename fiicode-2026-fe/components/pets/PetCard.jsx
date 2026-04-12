import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContext';
import PetService from '../../services/petService';
import { formatMessageDateTime } from '../../utils/utils_functions';

const PetCard = ({ pet, showMatchPercentage = false, onRefresh }) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [isManaging, setIsManaging] = useState(false);

  const isAuthor = user?.user_id === pet.author.id;

  const date = new Date(pet.created_at).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePressPhoto = () => {
    if (!showMatchPercentage) {
      router.push(`/pets/similarity/${pet.id}`);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setIsManaging(true);
      await PetService.updatePetStatus(pet.id, newStatus);
      if (onRefresh) onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setIsManaging(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Post', 'Are you sure you want to permanently delete this report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsManaging(true);
            await PetService.deletePet(pet.id);
            if (onRefresh) onRefresh();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete post.');
          } finally {
            setIsManaging(false);
          }
        },
      },
    ]);
  };

  const showStatusOptions = () => {
    Alert.alert('Change Status', 'Select the current status of this animal:', [
      { text: 'Lost', onPress: () => handleUpdateStatus('LOST') },
      { text: 'Found', onPress: () => handleUpdateStatus('FOUND') },
      { text: 'Resolved', onPress: () => handleUpdateStatus('RESOLVED') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View className="bg-card mb-6 overflow-hidden rounded-3xl border border-border shadow-lg">
      <View className="bg-secondary/5 flex-row items-center justify-between border-b border-border p-3 px-4">
        <View className="flex-row items-center">
          <View className="border-primary/20 bg-primary/10 h-10 w-10 overflow-hidden rounded-full border">
            {pet.author?.image ? (
              <Image source={{ uri: pet.author.image }} className="h-full w-full" />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="person" size={20} color={theme.tabIconSelected} />
              </View>
            )}
          </View>
          <View className="ml-3">
            <Text className="text-foreground text-sm font-bold">
              {pet.author ? `${pet.author.first_name} ${pet.author.last_name}` : 'Anonymous User'}
            </Text>
            <Text className="text-foreground text-[10px] opacity-50">{date}</Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          {isAuthor && !showMatchPercentage && (
            <>
              <Pressable
                onPress={showStatusOptions}
                disabled={isManaging}
                className="bg-primary/10 rounded-full p-2">
                <Ionicons name="create-outline" size={18} color={theme.tabIconSelected} />
              </Pressable>
              <Pressable
                onPress={handleDelete}
                disabled={isManaging}
                className="bg-red-500/10 rounded-full p-2">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            </>
          )}
          <Pressable
            className="bg-primary/10 rounded-full p-2"
            onPress={() => router.push(`/profiles/${pet.author?.id}`)}>
            <Ionicons name="mail-outline" size={18} color={theme.tabIconSelected} />
          </Pressable>
        </View>
      </View>

      <Pressable onPress={handlePressPhoto} disabled={showMatchPercentage} className="relative">
        <Image source={{ uri: pet.image_data }} className="h-56 w-full" resizeMode="cover" />
        <View className="absolute bottom-3 left-3 flex-row gap-2">
          <View
            className={`rounded-full px-3 py-1 shadow-sm ${
              pet.status === 'LOST' ? 'bg-red-500' : pet.status === 'FOUND' ? 'bg-green-500' : 'bg-blue-500'
            }`}>
            <Text className="text-[10px] font-black text-white">
              {pet.status.toUpperCase()}
            </Text>
          </View>
          {showMatchPercentage && pet.match_percentage !== undefined && (
            <View className="rounded-full bg-blue-600 px-3 py-1 shadow-sm">
              <Text className="text-[10px] font-black text-white">
                SIMILARITY: {pet.match_percentage}%
              </Text>
            </View>
          )}
        </View>

        {!showMatchPercentage && (
          <View className="absolute right-3 top-3 rounded-full bg-black/40 p-2">
            <Ionicons name="scan-outline" size={20} color="white" />
          </View>
        )}

        {isManaging && (
          <View className="absolute inset-0 items-center justify-center bg-black/20">
            <ActivityIndicator color="white" />
          </View>
        )}
      </Pressable>

      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-foreground text-xl font-black">
            {pet.ai_species || 'Unknown Species'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="color-palette-outline" size={16} color={theme.iconColor} />
          <Text className="text-foreground ml-2 text-sm opacity-70">
            Primary color: <Text className="font-semibold">{pet.ai_primary_color || 'N/A'}</Text>
          </Text>
        </View>

        {pet.ai_tags && pet.ai_tags.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {pet.ai_tags.map((tag, index) => (
              <View
                key={index}
                className="bg-primary/5 border-primary/10 rounded-lg border px-2 py-1">
                <Text className="text-[10px] font-bold text-primary">{tag.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}

        <View className="border-border mt-4 flex-row items-center justify-between border-t pt-4">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color={theme.iconColor} />
            <Text className="text-foreground ml-1 text-[11px] font-medium opacity-50">
              Automatic localization active
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color={theme.iconColor} />
            <Text className="text-foreground ml-1 text-[11px] font-medium opacity-50">
              Posted at: {formatMessageDateTime(pet.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PetCard;
