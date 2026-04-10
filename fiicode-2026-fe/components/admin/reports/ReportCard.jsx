import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReportCard = ({ report, openModal }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toUpperCase()) {
      case 'PULSE':
        return <Ionicons name="pulse" size={20} color="#EF4444" />;
      case 'USER':
      case 'HERO':
        return <Ionicons name="person" size={20} color="#3B82F6" />;
      default:
        return <Ionicons name="alert-circle" size={20} color="#6B7280" />;
    }
  };

  return (
    <View
      key={report.id}
      className="mb-4 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <View className="flex-row items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
        <View className="flex-row items-center gap-2">
          {getTypeIcon(report.target_type)}
          <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {report.target_type} Report
          </Text>
        </View>
        <View className={`rounded-full border px-3 py-1 ${getStatusColor(report.status)}`}>
          <Text className="text-[10px] font-bold">{report.status}</Text>
        </View>
      </View>

      <View className="p-4">
        <Text className="mb-4 text-base italic text-slate-700 dark:text-slate-200">
          {report.description || 'No description provided'}
        </Text>

        {report.content_snapshot && (
          <View className="mb-4 rounded-xl border-l-4 border-indigo-400 bg-slate-50 p-3 dark:bg-slate-800">
            <Text className="mb-1 text-xs font-bold uppercase text-slate-400">Snapshot</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-300" numberOfLines={3}>
              {report.content_snapshot}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
              <Ionicons name="shield-outline" size={16} color="#6366F1" />
            </View>
            <View>
              <Text className="text-[10px] text-slate-400">REPORTED ON</Text>
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {new Date(report.created_at).toLocaleDateString()} at{' '}
                {new Date(report.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <Pressable
            className="rounded-lg bg-indigo-50 px-4 py-2"
            onPress={() => {
              openModal();
            }}>
            <Text className="text-xs font-bold text-indigo-600">Action</Text>
          </Pressable>
        </View>
        {report.resolved_by_id && (
          <View className="mt-2 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <Ionicons name="refresh-outline" size={16} color="#6366F1" />
              </View>
              <View>
                <Text className="text-[10px] text-slate-400">UPDATED AT</Text>
                <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {new Date(report.resolved_at).toLocaleDateString()} at{' '}
                  {new Date(report.resolved_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}
        {report.resolver_notes && (
          <View className="mt-2 flex-row items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <Ionicons name="document-text-outline" size={16} color="#6366F1" />
              </View>
              <View>
                <Text className="text-[10px] text-slate-400">RESOLVER NOTES</Text>
                <Text className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {report.resolver_notes}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default ReportCard;
