import { Text, useColorScheme } from 'react-native'

const ThemedText = ({ className, title = false, ...props }) => {

  return (
    <Text
      className={`text-text ${className}`}
      {...props}
    />
  )
}

export default ThemedText