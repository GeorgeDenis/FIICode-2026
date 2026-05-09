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
import DocumentService from '../../services/documentService';
import DocumentCard from '../../components/documents/DocumentCard';
import UploadLostDocumentModal from '../../components/documents/UploadLostDocumentModal';
import { useLocation } from '../../hooks/useLocation';
import Slider from '@react-native-community/slider';

const TABS = [
  { key: 'all', label: 'ALL FOUND', icon: 'search-outline' },
  { key: 'mine', label: 'MY REPORTS', icon: 'folder-open-outline' },
  { key: 'matching', label: 'MATCHING ME', icon: 'person-outline' },
];

const DocumentsDashboard = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const { location } = useLocation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchRadius, setSearchRadius] = useState(50); // Default 50km

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      let data = [];
      if (activeTab === 'mine') {
        data = await DocumentService.getMyFoundDocuments();
      } else if (activeTab === 'matching') {
        data = await DocumentService.getSmartMatches();
      } else {
        data = await DocumentService.getAllFoundDocuments(
          location?.coords?.latitude,
          location?.coords?.longitude,
          searchRadius
        );
      }
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [activeTab, searchRadius, location?.coords?.latitude, location?.coords?.longitude]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const handleUploadComplete = () => {
    setIsModalVisible(false);
    loadDocuments();
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerTitle: 'Lost Documents',
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

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="mb-6 flex-row items-center justify-between border-b p-2">
          <View>
            <Text className="text-foreground text-2xl font-black">Lost Documents</Text>
            <Text className="text-foreground text-sm opacity-60">
              Community-powered document recovery
            </Text>
          </View>
          <View className="bg-primary/10 rounded-full p-3">
            <Ionicons name="document-text-outline" size={28} color={theme.tabIconSelected} />
          </View>
        </View>

        <View className="bg-secondary/10 mb-6 flex-row rounded-2xl p-1">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-3 ${
                activeTab === tab.key ? 'bg-slate-300' : ''
              }`}>
              <Ionicons
                name={tab.icon}
                size={13}
                color={activeTab === tab.key ? theme.tabIconSelected : theme.iconColor}
              />
              <Text
                className={`text-xs font-bold ${
                  activeTab === tab.key ? 'text-primary' : 'opacity-50'
                }`}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'all' && (
          <View className="bg-surface mb-6 flex flex-col items-start justify-between rounded-2xl border">
            <View className="bg-secondary/10 mb-2 mt-2 w-full rounded-2xl p-4 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location" size={24} color="#10b981" />
                  <Text className="text-lg font-bold text-text-main">Action Range</Text>
                </View>
                <Text className="text-lg font-bold text-primary">
                  {searchRadius?.toFixed(1)} km
                </Text>
              </View>

              <Slider
                style={{ width: '100%', height: 5 }}
                minimumValue={1}
                maximumValue={10}
                step={0.5}
                value={searchRadius}
                onValueChange={(val) => setSearchRadius(val)}
                minimumTrackTintColor="#10b981"
                maximumTrackTintColor="#d1d5db"
                thumbTintColor="#10b981"
              />
            </View>
          </View>
        )}

        {loading && !refreshing ? (
          <View className="mt-20 items-center justify-center">
            <ActivityIndicator size="large" color={theme.tabIconSelected} />
            <Text className="text-foreground mt-4 font-bold opacity-50">
              Scanning document reports...
            </Text>
          </View>
        ) : documents.length === 0 ? (
          <View className="bg-card mt-20 items-center justify-center rounded-3xl p-10 py-16">
            <View className="bg-secondary/10 mb-4 rounded-full p-6">
              <Ionicons name="document-outline" size={48} color="#ccc" />
            </View>
            <Text className="text-foreground text-center text-lg font-bold">
              {activeTab === 'mine' ? 'No reports yet' : 'No documents found'}
            </Text>
            <Text className="text-foreground mt-2 text-center text-xs opacity-50">
              {activeTab === 'mine'
                ? "You haven't reported any found documents yet."
                : activeTab === 'matching'
                  ? "We couldn't find any reported documents matching your profile."
                  : 'No documents have been reported in your community yet.'}
            </Text>
            {activeTab === 'all' && (
              <Pressable
                onPress={() => {
                  if (!isSearchModalVisible) {
                    setIsModalVisible(true);
                  }
                }}
                className="mt-8 rounded-2xl bg-primary px-10 py-4 shadow-lg">
                <Text className="font-bold text-white">REPORT A FOUND DOC</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View className="pb-20">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onRefresh={loadDocuments} />
            ))}
          </View>
        )}
      </ScrollView>
      {isModalVisible && !isSearchModalVisible && (
        <UploadLostDocumentModal
          onClose={() => setIsModalVisible(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </View>
  );
};

export default DocumentsDashboard;
