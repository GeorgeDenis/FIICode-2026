import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, useColorScheme, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import DocumentService from '../../services/documentService';
import { useLocation } from '../../hooks/useLocation';

const UploadLostDocumentModal = ({ onComplete, onClose }) => {
  const { location, loading: locationLoading } = useLocation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('We need permissions in order to access the camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      alert('Please select an image');
      return;
    }

    setLoading(true);
    if (!location || !location.coords) {
      return;
    }
    try {
      const result = await DocumentService.scanDocument(
        image,
        location.coords.latitude,
        location.coords.longitude
      );
      alert('Document lost reported successfully! The AI has identified the features.');
      onComplete(result);
    } catch (error) {
      alert('Error loading. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <View className="w-full max-w-md overflow-hidden rounded-3xl bg-background p-6 shadow-2xl">
        {!image ? (
          <View className="mb-6 flex-row gap-4">
            <Pressable
              onPress={takePhoto}
              className="bg-primary/5 flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-primary p-8">
              <Ionicons name="camera-outline" size={40} color={theme.tabIconSelected} />
              <Text className="mt-2 font-semibold">Take a photo</Text>
            </Pressable>
            <Pressable
              onPress={pickImage}
              className="bg-primary/5 flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-primary p-8">
              <Ionicons name="images-outline" size={40} color={theme.tabIconSelected} />
              <Text className="mt-2 font-semibold">From gallery</Text>
            </Pressable>
          </View>
        ) : (
          <View className="mb-6">
            <View className="relative h-64 w-full overflow-hidden rounded-2xl shadow-md">
              <Image source={{ uri: image }} className="h-full w-full" resizeMode="cover" />
              <Pressable
                onPress={() => setImage(null)}
                className="bg-red-650 absolute right-2 top-2 rounded-full p-2 shadow-lg">
                <Ionicons name="trash-outline" size={20} color="white" />
              </Pressable>
            </View>
            <Text className="mt-2 text-center text-sm opacity-60">
              Image selected for AI analysis
            </Text>
          </View>
        )}

        <View className="gap-3">
          <Pressable
            disabled={loading}
            onPress={handleSubmit}
            className={`flex-row items-center justify-center rounded-xl p-4 shadow-sm ${
              loading ? 'bg-primary/50' : 'bg-primary'
            }`}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="white" className="mr-2" />
                <Text className="ml-2 font-bold text-white">Send&Analyze</Text>
              </>
            )}
          </Pressable>

          {!loading && (
            <Pressable onPress={onClose} className="rounded-xl bg-gray-100 p-4">
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-4 flex-row items-start rounded-xl bg-blue-50 p-3">
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#3b82f6"
            style={{ marginTop: 2 }}
          />
          <Text className="ml-2 flex-1 text-xs text-blue-700">
            We use OCR to automatically extract the most important details from the document.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default UploadLostDocumentModal;
