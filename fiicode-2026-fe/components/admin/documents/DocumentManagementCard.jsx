import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trash2 } from 'lucide-react-native';
import { fetchOsrmRoute, formatMessageDateTime } from '../../../utils/utils_functions';
import DocumentService from '../../../services/documentService';
import { errorToast } from '../../../utils/toast';
import { useRouter } from 'expo-router';
import { useLocation } from '../../../hooks/useLocation';
import { DocumentMap } from './DocumentMap';

const DOC_TYPE_CONFIG = {
  ID_CARD: { label: 'ID Card', icon: 'card-outline', color: '#6849a7' },
  PASSPORT: { label: 'Passport', icon: 'book-outline', color: '#2563eb' },
  DRIVER_LICENSE: { label: "Driver's License", icon: 'car-outline', color: '#059669' },
  OTHER: { label: 'Document', icon: 'document-outline', color: '#d97706' },
};

const DocumentManagementCard = ({ doc, onDelete, onUpdateStatus }) => {
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fullImageData, setFullImageData] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  const docConfig = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG.OTHER;
  const hasDocLocation = doc.location_lat != null && doc.location_lng != null;

  useEffect(() => {
    if (!hasDocLocation || locationLoading || !location?.coords) return;

    let cancelled = false;

    (async () => {
      try {
        const coords = await fetchOsrmRoute(
          location.coords.latitude,
          location.coords.longitude,
          doc.location_lat,
          doc.location_lng
        );
        if (!cancelled) setRouteCoords(coords);
      } catch (err) {
        console.error('Route fetch failed:', err.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location, doc.location_lat, doc.location_lng]);

  const handleViewImage = async () => {
    if (fullImageData) {
      setIsModalVisible(true);
      return;
    }
    try {
      setImageLoading(true);
      const data = await DocumentService.getDocumentImage(doc.id);
      setFullImageData(data.image_data);
      setIsModalVisible(true);
    } catch (error) {
      errorToast('Failed to load image: ' + (error.response?.data?.detail || error.message));
    } finally {
      setImageLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to permanently delete this document record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => onDelete(doc.id), style: 'destructive' },
      ]
    );
  };

  const handleStatusChange = () => {
    Alert.alert('Update Status', 'Select the new status for this document:', [
      { text: 'Found', onPress: () => onUpdateStatus(doc.id, 'FOUND') },
      { text: 'Claimed', onPress: () => onUpdateStatus(doc.id, 'CLAIMED') },
      { text: 'Archived', onPress: () => onUpdateStatus(doc.id, 'ARCHIVED') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'FOUND':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-900/20';
      case 'CLAIMED':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case 'ARCHIVED':
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <Pressable
      onPress={() => setMapOpen(prev => !prev)}
      className="mb-4 rounded-2xl bg-white p-4 shadow-md dark:bg-slate-900">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center space-x-2">
            <View
              style={{ backgroundColor: docConfig.color + '22' }}
              className="h-10 w-10 items-center justify-center rounded-full">
              <Ionicons name={docConfig.icon} size={20} color={docConfig.color} />
            </View>
            <View className="px-2">
              <Text className="font-semibold text-slate-800 dark:text-slate-100">
                {docConfig.label}
              </Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400">
                Found {formatMessageDateTime(doc.created_at)}
              </Text>
            </View>
          </View>

          <View className="mt-3">
            <Text
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
              numberOfLines={2}>
              {doc.ai_first_name || '?'} {doc.ai_last_name || '?'}
            </Text>
            <Text className="mt-1 text-xs text-slate-500">Finder ID: {doc.finder_id}</Text>
            {doc.matched_owner_id && (
              <Text className="text-xs text-slate-500">
                Matched Owner ID: {doc.matched_owner_id}
              </Text>
            )}
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View className={`rounded-lg px-2 py-1 ${getStatusColor(doc.status)}`}>
              <Text className="text-xs font-bold">{doc.status}</Text>
            </View>
            {doc.ai_issuing_city && (
              <View className="rounded-lg bg-indigo-50 px-2 py-1 dark:bg-indigo-900/20">
                <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {doc.ai_issuing_city}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-2 space-x-2">
          <Pressable
            onPress={() => router.push(`/profiles/${doc.finder_id}`)}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Ionicons name="person-outline" size={20} color="#3B82F6" />
          </Pressable>
          <Pressable
            onPress={handleViewImage}
            disabled={imageLoading}
            className="h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
            {imageLoading ? (
              <ActivityIndicator size={14} color="#6366F1" />
            ) : (
              <Ionicons name="eye-outline" size={20} color="#6366F1" />
            )}
          </Pressable>

          <Pressable
            onPress={handleStatusChange}
            className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
            <Ionicons name="create-outline" size={20} color="#3B82F6" />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/30">
            <Trash2 size={20} color="#F43F5E" />
          </Pressable>
        </View>
      </View>

      {mapOpen && hasDocLocation && !locationLoading && (
        <View className="mt-2">
          <DocumentMap doc={doc} userLocation={location} routeCoords={routeCoords} />
        </View>
      )}

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/90 p-4">
          <Pressable
            className="absolute right-6 top-16 z-10 h-10 w-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          {fullImageData && (
            <Image
              source={{ uri: fullImageData }}
              className="h-[70%] w-full rounded-2xl"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </Pressable>
  );
};

export default DocumentManagementCard;
