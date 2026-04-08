import { Pressable, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { setColorScheme } from 'react-native/Libraries/Utilities/Appearance';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
  return (
    <View className="shadow-smborders flex w-full flex-row items-center justify-center gap-5 rounded-lg bg-surface p-5">
      <View className="bg-primary-50 flex items-center gap-5">
        <Pressable
          onPress={() => setColorScheme('light')}
          className={`flex flex-col rounded-xl border ${colorScheme === 'light' ? 'border-primary' : 'border-border'} px-5 py-10`}>
          <View className="rounded-xl p-5">
            <Ionicons name="sunny-outline" size={20} color={iconColor} />
          </View>
        </Pressable>
        <Text className="text-text-main">Light</Text>
      </View>
      <View className="flex items-center gap-5">
        <Pressable
          onPress={() => setColorScheme('dark')}
          className={`flex flex-col rounded-xl border ${colorScheme === 'dark' ? 'border-primary' : 'border-border'} px-5 py-10`}>
          <View className="rounded-xl p-5">
            <Ionicons name="moon-outline" size={20} color={iconColor} />
          </View>
        </Pressable>
        <Text className="text-text-main">Dark</Text>
      </View>
    </View>
  );
}
