import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, useColorScheme, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { useUser } from '../../hooks/useUser';
import { useLocation } from '../../hooks/useLocation';
import DocumentService from '../../services/documentService';
import { fetchOsrmRoute, formatMessageDateTime } from '../../utils/utils_functions';
import api from '../../services/api';
import { useRouter } from 'expo-router';
import { errorToast } from '../../utils/toast';

const DOC_TYPE_CONFIG = {
  ID_CARD: { label: 'ID Card', icon: 'card-outline', color: '#6849a7' },
  PASSPORT: { label: 'Passport', icon: 'book-outline', color: '#2563eb' },
  DRIVER_LICENSE: { label: "Driver's License", icon: 'car-outline', color: '#059669' },
  OTHER: { label: 'Document', icon: 'document-outline', color: '#d97706' },
};

const STATUS_CONFIG = {
  Claimed: { label: 'CLAIMED', color: '#059669' },
  Archived: { label: 'ARCHIVED', color: '#6b7280' },
  Found: { label: 'FOUND', color: '#e11d48' },
};

const maskName = (name) => (name ? `${name[0].toUpperCase()}***` : '???');

const withAlpha = (hex, alpha) => `${hex}${alpha}`;


const InfoChip = ({ icon, label, theme }) => (
  <View className="bg-secondary/10 flex-row items-center gap-1.5 rounded-xl px-3 py-2">
    <Ionicons name={icon} size={14} color={theme.iconColor} />
    <Text className="text-foreground text-xs font-semibold">{label}</Text>
  </View>
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Found;
  return (
    <View
      style={{ backgroundColor: withAlpha(cfg.color, '22') }}
      className="rounded-full px-3 py-1">
      <Text style={{ color: cfg.color }} className="text-[10px] font-black">
        {cfg.label}
      </Text>
    </View>
  );
};

const CardHeader = ({ doc, isMyDoc, isDeleting, onDelete, docConfig, handleChatNavigation }) => (
  <View
    style={{ backgroundColor: withAlpha(docConfig.color, '18') }}
    className="flex-row items-center justify-between border-b border-border px-4 py-3">
    <View className="flex-row items-center gap-3">
      <View
        style={{ backgroundColor: withAlpha(docConfig.color, '22') }}
        className="h-10 w-10 items-center justify-center rounded-full">
        <Ionicons name={docConfig.icon} size={22} color={docConfig.color} />
      </View>
      <View>
        <Text className="text-foreground text-sm font-black">{docConfig.label}</Text>
        <Text className="text-foreground text-[10px] opacity-50">
          Found {formatMessageDateTime(doc.created_at)}
        </Text>
      </View>
    </View>
    <View className="flex-row items-center gap-2">
      <StatusBadge status={doc.status} />
      {isMyDoc && (
        <Pressable
          onPress={onDelete}
          disabled={isDeleting}
          className="rounded-full bg-red-500/10 p-2">
          {isDeleting ? (
            <ActivityIndicator size={14} color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          )}
        </Pressable>
      )}
    </View>
    <Pressable
      className="flex items-center justify-center rounded-lg bg-primary p-3"
      onPress={() => handleChatNavigation()}>
      <Ionicons name="chatbubble-ellipses" size={22} color="#ffffff" />
    </Pressable>
  </View>
);

const DocumentMap = ({ doc, userLocation, routeCoords }) => {
  const hasUserLocation = !!userLocation?.coords;
  return (
    <View className="mt-3 h-60 w-full overflow-hidden rounded-xl border">
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: doc.location_lat,
          longitude: doc.location_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Marker
          coordinate={{ latitude: doc.location_lat, longitude: doc.location_lng }}
          title="Document location"
          description="This is where the document was found"
        />
        {hasUserLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            pinColor="purple"
            title="Your location"
          />
        )}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#10b981" />
        )}
      </MapView>
    </View>
  );
};

const DocumentCard = ({ doc, onRefresh, showClaimButton = true }) => {
  const { user } = useUser();
  const router = useRouter();
  const { location, loading: locationLoading } = useLocation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [isClaiming, setIsClaiming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);
  const [finder, setFinder] = useState(null);

  const isMyDoc = user?.user_id === doc.finder_id;
  const isClaimed = doc.status === 'Claimed';
  const isArchived = doc.status === 'Archived';
  const hasDocLocation = doc.location_lat != null && doc.location_lng != null;

  const docConfig = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG.OTHER;

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

  useEffect(() => {
    fetchFinderDetails();
  }, [doc]);

  const handleClaim = () => {
    Alert.alert(
      'Claim this Document',
      `Is this your ${docConfig.label}? The finder will be notified and you can arrange its return via platform chat.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, this is mine',
          onPress: async () => {
            try {
              setIsClaiming(true);
              await DocumentService.claimDocument(doc.id);
              Alert.alert(
                'Claimed!',
                'The finder has been notified. You can now chat with them to arrange the return safely.'
              );
              onRefresh?.();
            } catch (error) {
              Alert.alert(
                'Error',
                error?.response?.data?.error?.message || 'Failed to claim document.'
              );
            } finally {
              setIsClaiming(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert('Remove Report', 'Are you sure you want to remove this document report?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await DocumentService.deleteDocument(doc.id);
            onRefresh?.();
          } catch {
            Alert.alert('Error', 'Failed to remove the report.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const fetchFinderDetails = async () => {
    try {
      const response = await api.get('/user/by-id/' + doc.finder_id);
      setFinder(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        return;
      }
      errorToast(error.message);
    }
  };

  const handleChatNavigation = async () => {
    let conversationId = null;
    let isGroup = false;
    try {
      const response = await api.get(`/chat/conversations/${user.id}`);
      if (response.data.id) {
        conversationId = response.data.id;
        isGroup = response.data.is_group;
      }
    } catch (error) {}

    router.push({
      pathname: '/messaging',
      params: {
        conversationId,
        isGroup,
        receiverId: finder.id,
        name: finder.first_name + ' ' + finder.last_name,
      },
    });
  };

  return (
    <View className="bg-card mb-4 overflow-hidden rounded-3xl border border-border shadow-sm">
      <CardHeader
        doc={doc}
        isMyDoc={isMyDoc}
        isDeleting={isDeleting}
        onDelete={handleDelete}
        docConfig={docConfig}
        handleChatNavigation={handleChatNavigation}
      />

      <View className="px-4 py-4">
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons name="person-outline" size={16} color={theme.iconColor} />
          <Text className="text-foreground text-base font-black tracking-wider">
            {maskName(doc.ai_first_name)} {maskName(doc.ai_last_name)}
          </Text>
          <View className="ml-auto rounded-md bg-amber-100 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-amber-700">MASKED</Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {doc.ai_birth_year && (
            <InfoChip icon="calendar-outline" label={`Born ${doc.ai_birth_year}`} theme={theme} />
          )}
          {doc.ai_issuing_city && (
            <InfoChip icon="location-outline" label={doc.ai_issuing_city} theme={theme} />
          )}
          {doc.ai_gender && (
            <InfoChip
              icon={doc.ai_gender === 'M' ? 'male-outline' : 'female-outline'}
              label={doc.ai_gender === 'M' ? 'Male' : 'Female'}
              theme={theme}
            />
          )}
          {doc.ai_has_face && <InfoChip icon="image-outline" label="Has photo" theme={theme} />}
        </View>

        {hasDocLocation && !locationLoading && (
          <DocumentMap doc={doc} userLocation={location} routeCoords={routeCoords} />
        )}
      </View>

      {showClaimButton && !isClaimed && !isArchived && !isMyDoc && (
        <View className="border-t border-border px-4 pb-4 pt-3">
          <Pressable
            onPress={handleClaim}
            disabled={isClaiming}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 active:opacity-80">
            {isClaiming ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="hand-left-outline" size={18} color="white" />
                <Text className="font-black text-white">This might be mine</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {isClaimed && !isMyDoc && (
        <View className="border-t border-border px-4 pb-4 pt-3">
          <View className="flex-row items-center justify-center gap-2 rounded-2xl bg-green-500/10 py-3">
            <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
            <Text className="font-bold text-green-700">Document has been claimed</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default DocumentCard;
