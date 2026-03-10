import { forwardRef } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export const Button = forwardRef(({ title, ...touchableProps }, ref) => {
  return (
    <TouchableOpacity
      ref={ref}
      {...touchableProps}
      className={`${styles.button} ${touchableProps.className}`}>
      <Text className={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = {
  button: 'items-center bg-primary rounded-[28px] shadow-md p-4',
  buttonText: 'text-white text-lg font-semibold text-center',
};
