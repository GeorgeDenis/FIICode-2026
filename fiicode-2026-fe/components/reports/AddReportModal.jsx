import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { useColorScheme } from 'nativewind';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import Toast from 'toastify-react-native';

const AddReportModal = ({ visible, onClose, itemType = 'Message', item }) => {
  const { colorScheme } = useColorScheme();
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    if (reportReason.trim() === '') {
      errorToast('Please provide a reason for reporting.');
      return;
    }
    try {
      const response = await api.post('/report', {
        target_type: itemType,
        target_id: item.id,
        description: reportReason,
        content_snapshot: item[getSnapshotType(itemType)] || '',
      });
    } catch (error) {
      console.log(error);
    } finally {
      setReportReason('');
    }
    onClose();
  };

  const getSnapshotType = (type) => {
    switch (type) {
      case 'Message':
        return 'text';
      case 'Pulse':
        return 'content';
      default:
        return '';
    }
  };

  const handleClose = () => {
    setReportReason('');
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View
          className="w-full rounded-xl bg-surface px-5 py-6"
          style={{ backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF' }}>
          <Text className="mb-4 text-center text-xl font-bold text-text-main">
            Report {itemType}
          </Text>
          <Text className="mb-4 text-center text-base text-gray-500">
            Are you sure you want to report this {itemType.toLowerCase()}?
          </Text>
          <TextInput
            className="mb-6 h-28 rounded-lg border border-gray-300 p-3 text-base text-text-main"
            placeholder="Reason for reporting (optional)"
            placeholderTextColor="gray"
            multiline
            value={reportReason}
            onChangeText={setReportReason}
            style={{ color: colorScheme === 'dark' ? '#F8FAFC' : '#0F172A' }}
          />
          <View className="flex-row justify-between">
            <Pressable
              className="w-[45%] items-center justify-center rounded-lg bg-gray-500 py-3"
              onPress={handleClose}>
              <Text className="font-bold text-white">Cancel</Text>
            </Pressable>
            <Pressable
              className="w-[45%] items-center justify-center rounded-lg bg-red-600 py-3"
              onPress={handleReport}>
              <Text className="font-bold text-white">Report</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default AddReportModal;
