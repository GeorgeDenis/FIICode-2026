import { TextInput, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

export default function ThemedTextInput({ style, className, ...props }) {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light

  return (
    <TextInput
      className={className}
      style={[
        {
          backgroundColor: theme.uiBackground,
          color: theme.text,
          padding: 20,
          borderRadius: 6,
        },
        style
      ]}
      {...props}
    />
  )
}