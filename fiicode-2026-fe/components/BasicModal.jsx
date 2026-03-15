import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BasicModal = ({ children, setVisible, doAction, doActionText }) => {
  const closeModal = () => setVisible(false);

  return (
    <View className="absolute inset-0 z-10 bg-black/50">
      <View className="elevation-sm absolute bottom-1/3 z-10 w-[95%] self-center rounded-xl bg-[#fff] px-5 py-12">
        {children}
        <View className="mt-10 flex flex-row items-center justify-center gap-5">
          <Pressable
            className="h-[45px] w-[30%] items-center justify-center rounded-xl bg-primary"
            onPress={doAction}>
            <Ionicons name="checkmark" size={25} color="white" className="ml-1" />
          </Pressable>
          <Pressable
            className="h-[45px] w-[30%] items-center justify-center rounded-xl bg-red-600"
            onPress={closeModal}>
            <Ionicons name="close-circle" size={25} color="white" className="ml-1" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default BasicModal;
