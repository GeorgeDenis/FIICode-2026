import { Tabs, useRouter } from 'expo-router';
import { Pressable, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

import UserOnly from '../../components/auth/UserOnly';
import NotificationBell from '../../components/NotificationBell';

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;
  const backgroundColor = colorScheme === 'dark' ? '#0F172A' : '#E5E7EB';
  const titleColor = colorScheme === 'dark' ? '#E5E7EB' : '#0F172A';
  const router = useRouter();
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
          name="home"
          options={{
            title: 'Home',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 120,
            },
            headerTintColor: titleColor,
            headerLeft: () => (
              <>
                <Pressable
                  className="ml-4 flex flex-row items-center active:opacity-50"
                  onPress={() => router.push('/pets/pets-dashboard')}>
                  <Ionicons name="paw" size={28} color={theme.iconColor} />
                </Pressable>
                <Pressable
                  className="ml-4 flex flex-row items-center active:opacity-50"
                  onPress={() => router.push('/documents/documents-dashboard')}>
                  <Ionicons
                    name="id-card-outline"
                    size={28}
                    color={theme.iconColor}
                  />
                </Pressable>
              </>
            ),
            headerRight: () => (
              <Pressable
                className="mr-4 flex flex-row items-center active:opacity-50"
                onPress={() => router.push('/search')}>
                <Ionicons name="search" size={28} color={theme.iconColor} />
                <NotificationBell />
              </Pressable>
            ),
            headerShadowVisible: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={20}
                name={focused ? 'home' : 'home-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 120,
            },
            headerTintColor: titleColor,
            headerLeft: () => (
              <Pressable
                className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white active:h-16 active:w-16 active:opacity-60"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={24} color={theme.iconColor} />
              </Pressable>
            ),
            headerShadowVisible: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={20}
                name={focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 120,
            },
            headerTintColor: titleColor,
            headerLeft: () => (
              <Pressable
                className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white active:h-16 active:w-16 active:opacity-60"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={24} color={theme.iconColor} />
              </Pressable>
            ),
            headerShadowVisible: false,
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={20}
                name={focused ? 'map' : 'map-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: 'Feed',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 120,
            },
            headerTintColor: titleColor,
            headerLeft: () => (
              <Pressable
                className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white active:h-16 active:w-16 active:opacity-60"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={24} color={theme.iconColor} />
              </Pressable>
            ),
            tabBarIcon: ({ focused }) => (
              <Ionicons
                size={20}
                name={focused ? 'pulse' : 'pulse-outline'}
                color={focused ? theme.iconColorFocused : theme.iconColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerStyle: {
              backgroundColor: backgroundColor,
              height: 120,
            },
            headerTintColor: titleColor,
            headerLeft: () => (
              <Pressable
                className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-white active:h-16 active:w-16 active:opacity-60"
                onPress={() => router.back()}>
                <Ionicons name="return-up-back-outline" size={24} color={theme.iconColor} />
              </Pressable>
            ),
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
        <Tabs.Screen
          name="safety"
          options={{ href: null, headerShown: false }}
        />
      </Tabs>
    </UserOnly>
  );
}
