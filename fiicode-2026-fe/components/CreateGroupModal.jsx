import { Text, TextInput } from 'react-native';
import React, { useState } from 'react';
import api from '../services/api';
import { errorToast } from '../utils/toast';
import BasicModal from './BasicModal';

const CreateGroupModal = ({ setVisible, handleFetchConversations }) => {
  const [groupName, setGroupName] = useState('');

  const closeModal = () => setVisible(false);

  const handleCreateRoom = async () => {
    try {
      const response = await api.post('/chat/group', {
        name: groupName,
        is_group: true,
        is_private: true,
      });
      if (response.status === 201) {
        handleFetchConversations();
        closeModal();
      }
    } catch (error) {
      errorToast(error.message);
    }
  };
  return (
    <BasicModal setVisible={setVisible} doAction={handleCreateRoom} doActionText="CREATE">
      <Text className="mb-4 text-center text-xl font-bold">Enter your Group name</Text>
      <TextInput
        className="b-0.5 border p-3.5"
        placeholder="Group name"
        onChangeText={(value) => setGroupName(value)}
      />
    </BasicModal>
  );
};

export default CreateGroupModal;
