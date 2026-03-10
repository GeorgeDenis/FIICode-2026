import '../global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Stack } from 'expo-router';
import ToastManager from 'toastify-react-native';
import { UserProvider } from '../contexts/UserContext';

export default function Layout() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
      <ToastManager />
    </UserProvider>
  );
}
