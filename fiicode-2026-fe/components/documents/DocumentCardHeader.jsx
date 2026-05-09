import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { formatMessageDateTime } from '../../utils/utils_functions';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const STATUS_CONFIG = {
  CLAIMED: { label: 'CLAIMED', color: '#059669' },
  ARCHIVED: { label: 'ARCHIVED', color: '#6b7280' },
  FOUND: { label: 'FOUND', color: '#e11d48' },
};

const withAlpha = (hex, alpha) => `${hex}${alpha}`;

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.FOUND;
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
export const DocumentCardHeader = ({
  doc,
  isMyDoc,
  isDeleting,
  onDelete,
  docConfig,
  handleChatNavigation,
}) => (
  <View className="flex-row items-center justify-between border-b border-primary px-4 py-3">
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
      {!isMyDoc && (
        <Pressable
          className="flex items-center justify-center rounded-lg bg-primary p-2"
          onPress={() => handleChatNavigation()}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#ffffff" />
        </Pressable>
      )}
    </View>
  </View>
);
