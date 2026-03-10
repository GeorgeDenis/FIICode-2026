import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import UserOnly from '../../components/auth/UserOnly';

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';

  return (
    <UserOnly>
      <Tabs
        screenOptions={{
          // headerShown: false,
          tabBarStyle: { backgroundColor: backgroundColor, paddingTop: 10, height: 80 },
          tabBarActiveTintColor: theme.iconColorFocused,
          tabBarInactiveTintColor: theme.iconColor,
        }}>
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 85
            },
            headerShadowVisible: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={20}
                name={focused ? 'person' : 'person-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
      </Tabs>
    </UserOnly>
  );
}
