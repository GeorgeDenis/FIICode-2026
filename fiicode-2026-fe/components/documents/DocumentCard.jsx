import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, useColorScheme, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { UserContext } from '../../contexts/UserContext';
import DocumentService from '../../services/documentService';
import { formatMessageDateTime } from '../../utils/utils_functions';

const DOC_TYPE_CONFIG = {
  ID_CARD: { label: 'ID Card', icon: 'card-outline', color: '#6849a7' },
  PASSPORT: { label: 'Passport', icon: 'book-outline', color: '#2563eb' },
  DRIVER_LICENSE: { label: "Driver's License", icon: 'car-outline', color: '#059669' },
  OTHER: { label: 'Document', icon: 'document-outline', color: '#d97706' },
};

const maskName = (name) => {
  if (!name) return '???';
  return name[0].toUpperCase() + '***';
};

const DocumentCard = ({ doc, onRefresh, showClaimButton = true }) => {
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const [isClaiming, setIsClaiming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMyDoc = user?.user_id === doc.finder_id;
  const isClaimed = doc.status === 'Claimed';
  const isArchived = doc.status === 'Archived';

  const docConfig = DOC_TYPE_CONFIG[doc.doc_type] || DOC_TYPE_CONFIG.OTHER;

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
                '✅ Claimed!',
                'The finder has been notified. You can now chat with them to arrange the return safely.'
              );
              if (onRefresh) onRefresh();
            } catch (error) {
              Alert.alert('Error', error?.response?.data?.error?.message || 'Failed to claim document.');
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
            if (onRefresh) onRefresh();
          } catch (error) {
            Alert.alert('Error', 'Failed to remove the report.');
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const statusColor = isClaimed ? '#059669' : isArchived ? '#6b7280' : '#e11d48';
  const statusLabel = isClaimed ? 'CLAIMED' : isArchived ? 'ARCHIVED' : 'FOUND';

  return (
    <View className="bg-card mb-4 overflow-hidden rounded-3xl border border-border shadow-sm">
      <View
        style={{ backgroundColor: docConfig.color + '18' }}
        className="flex-row items-center justify-between border-b border-border px-4 py-3">
        <View className="flex-row items-center gap-3">
          <View
            style={{ backgroundColor: docConfig.color + '22' }}
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
          <View style={{ backgroundColor: statusColor + '22' }} className="rounded-full px-3 py-1">
            <Text style={{ color: statusColor }} className="text-[10px] font-black">
              {statusLabel}
            </Text>
          </View>

          {isMyDoc && (
            <Pressable
              onPress={handleDelete}
              disabled={isDeleting}
              className="bg-red-500/10 rounded-full p-2">
              {isDeleting ? (
                <ActivityIndicator size={14} color="#ef4444" />
              ) : (
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              )}
            </Pressable>
          )}
        </View>
      </View>

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

        <View className="flex-row flex-wrap gap-3">
          {doc.ai_birth_year && (
            <View className="bg-secondary/10 flex-row items-center gap-1.5 rounded-xl px-3 py-2">
              <Ionicons name="calendar-outline" size={14} color={theme.iconColor} />
              <Text className="text-foreground text-xs font-semibold">Born {doc.ai_birth_year}</Text>
            </View>
          )}

          {doc.ai_issuing_city && (
            <View className="bg-secondary/10 flex-row items-center gap-1.5 rounded-xl px-3 py-2">
              <Ionicons name="location-outline" size={14} color={theme.iconColor} />
              <Text className="text-foreground text-xs font-semibold">{doc.ai_issuing_city}</Text>
            </View>
          )}

          {doc.ai_gender && (
            <View className="bg-secondary/10 flex-row items-center gap-1.5 rounded-xl px-3 py-2">
              <Ionicons
                name={doc.ai_gender === 'M' ? 'male-outline' : 'female-outline'}
                size={14}
                color={theme.iconColor}
              />
              <Text className="text-foreground text-xs font-semibold">
                {doc.ai_gender === 'M' ? 'Male' : 'Female'}
              </Text>
            </View>
          )}

          {doc.ai_has_face && (
            <View className="bg-secondary/10 flex-row items-center gap-1.5 rounded-xl px-3 py-2">
              <Ionicons name="image-outline" size={14} color={theme.iconColor} />
              <Text className="text-foreground text-xs font-semibold">Has photo</Text>
            </View>
          )}
        </View>

        {doc.location_lat && doc.location_lng && (
          <View className="mt-3 flex-row items-center gap-1.5">
            <Ionicons name="navigate-outline" size={13} color={theme.iconColor} />
            <Text className="text-foreground text-[11px] opacity-50">
              Found near {doc.location_lat.toFixed(4)}, {doc.location_lng.toFixed(4)}
            </Text>
          </View>
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
