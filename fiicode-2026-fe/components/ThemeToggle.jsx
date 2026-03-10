import { Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Palette } from 'lucide-react-native';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const iconColor = colorScheme === 'dark' ? '#F8FAFC' : '#0F172A';
  return (
    <Pressable
      onPress={toggleColorScheme}
      className="rounded-full border-2 border-primary p-2 active:opacity-50">
      <Palette color={iconColor} size={20} />
    </Pressable>
  );
}
