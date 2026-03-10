import { Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

const ThemedButton = ({ className, style, ...props }) => {
  return (
    <Pressable
      className={`bg-primary my-2.5 rounded-md p-[18px] active:opacity-50 ${className || ''}`}
      style={(pressed) => [styles.btn, pressed && styles.pressed, style]}
      {...props}
    />
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 6,
    marginVertical: 10,
  },
  pressed: {
    opacity: 0.5,
  },
});
