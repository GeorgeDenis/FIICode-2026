import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../services/api';
import { errorToast } from '../../../utils/toast';
import EditReportModal from './EditReportModal';
import ReportCard from './ReportCard';

const ReportsPage = () => {
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
    <>
      <View className="flex-1 bg-gray-50 dark:bg-slate-950">
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
    </>
  );
};

export default ReportsPage;
