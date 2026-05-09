import React, { useContext, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { UserContext } from '../../contexts/UserContext';
import AdminOnly from '../../components/auth/AdminOnly';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/Colors';
import Reports from '../../components/admin/reports/reports';
import UserDashboard from '../../components/admin/users/UserDashboard';
import PulseDashboard from '../../components/admin/pulses/PulseDashboard';
import BroadcastNotificationPanel from '../../components/admin/notifications/BroadcastNotificationPanel';
import DocumentsDashboard from '../../components/admin/documents/DocumentsDashboard'
import CrisisDashboard from '../../components/admin/crisis/CrisisDashboard'
const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';
  const [activeTab, setActiveTab] = useState('reports');

  const renderTab = (key, label) => (
    <Pressable
      className={`mx-1 rounded-full px-4 py-2 ${activeTab === key ? 'bg-blue-600' : 'bg-gray-200'}`}
      onPress={() => setActiveTab(key)}>
      <Text className={`font-semibold ${activeTab === key ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </Text>
    </Pressable>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserDashboard />;
      case 'pulses':
        return <PulseDashboard />;
      case 'broadcast':
        return <BroadcastNotificationPanel />;
      case 'documents':
        return <DocumentsDashboard/>
      case 'crisis':
        return <CrisisDashboard />
      default:
        return null;
    }
  };

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
          <Text className="text-2xl font-bold text-white">Admin Dashboard</Text>
          <View className="w-10" />
        </View>
        <View className="mt-4 flex-row items-center justify-center p-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {renderTab('reports', 'Reports')}
            {renderTab('pulses', 'Pulses')}
            {renderTab('users', 'Users')}
            {renderTab('documents', 'Documents')}
            {renderTab('broadcast', 'Broadcast')}
            {renderTab('crisis', 'Crisis')}
          </ScrollView>
        </View>
        <View className="w-full flex-1">{renderContent()}</View>
      </View>
    </AdminOnly>
  );
};

export default AdminDashboard;
