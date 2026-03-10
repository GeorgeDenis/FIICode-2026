import { View } from 'react-native';

export const Container = ({ children }) => {
  return <View className={styles.container}>{children}</View>;
};

const styles = {
  container: 'flex flex-1 p-safe bg-white',
};
