import { Pressable, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';

const Modal = ({ setVisible }) => {
  const [groupName, setGroupName] = useState('');

  //👇🏻 Function that closes the Modal component
  const closeModal = () => setVisible(false);

  //👇🏻 Logs the group name to the console
  const handleCreateRoom = () => {
    closeModal();
  };
  return (
    <View className="elevation-sm height-[400px] absolute bottom-0 z-10 ml-auto w-full bg-[#fff] px-5 py-12">
      <Text className="mb-4 text-center text-xl font-bold">Enter your Group name</Text>
      <TextInput
        className="b-0.5 border p-3.5"
        placeholder="Group name"
        onChangeText={(value) => setGroupName(value)}
      />

      <View className="mt-2.5 flex flex-row justify-between">
        <Pressable
          className="h-[45px] w-[40%] items-center justify-center rounded-md bg-green-500"
          onPress={handleCreateRoom}>
          <Text className="text-white">CREATE</Text>
        </Pressable>
        <Pressable
          className="h-[45px] w-[40%] items-center justify-center rounded-md bg-red-500"
          onPress={closeModal}>
          <Text className="text-white">CANCEL</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Modal;
