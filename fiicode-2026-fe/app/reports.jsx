import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import AdminOnly from '../components/auth/AdminOnly';
import { errorToast } from '../utils/toast';
import { useColorScheme } from 'nativewind';
import { Colors } from '../constants/Colors';
import ReportCard from '../components/reports/ReportCard';
import EditReportModal from '../components/reports/EditReportModal';

const ReportsPage = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    try {
      const response = await api.get('/report');
      const reportData = response.data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
      setReports(reportData);
    } catch (error) {
      errorToast('Failed to fetch reports: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReports();
  }, []);

  return (
    <AdminOnly>
      <View className="flex-1 bg-gray-50 dark:bg-slate-950">
        <Stack.Screen
          options={{
            title: '',
            headerBackTitleVisible: false,
            headerTitleAlign: 'center',
            backgroundColor: backgroundColor,
            headerLeft: () => (
              <Pressable
                className="flex h-10 w-10 items-center justify-center rounded-full active:opacity-50"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={20} color={theme.iconColor} />
              </Pressable>
            ),
          }}
        />
        <View className="flex-row items-center justify-center rounded-b-[40px] bg-indigo-500 px-6 pb-4 pt-4 shadow-lg">
          <Text className="text-2xl font-bold text-white">Admin Reports</Text>
          <View className="w-10" />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <ScrollView
            className="mt-6 flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
            }>
            {reports.length === 0 ? (
              <View className="items-center justify-center pt-20">
                <Ionicons name="checkmark-done-circle-outline" size={80} color="#CBD5E1" />
                <Text className="mt-4 text-xl font-medium text-slate-400">No pending reports</Text>
              </View>
            ) : (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  openModal={() => {
                    setSelectedReport(report);
                    setIsReportModalVisible(true);
                  }}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
      {selectedReport && (
        <EditReportModal
          visible={isReportModalVisible}
          onClose={() => {
            setIsReportModalVisible(false);
            fetchReports();
          }}
          itemType="User"
          report={selectedReport}
        />
      )}
    </AdminOnly>
  );
};

export default ReportsPage;
