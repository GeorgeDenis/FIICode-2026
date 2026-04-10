import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput } from 'react-native';
import { useColorScheme } from 'nativewind';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';
import Toast from 'toastify-react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const EditReportModal = ({ visible, onClose, itemType = 'Message', report }) => {
  const { colorScheme } = useColorScheme();
  const [resolverNotes, setResolverNotes] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState(report.status);
  const [status, setStatus] = useState([
    { label: 'Pending', value: 'Pending' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Dismissed', value: 'Dismissed' },
    { label: 'Deleted', value: 'Deleted' },
  ]);
  const handleEditReport = async () => {
    if (resolverNotes.trim() === '') {
      errorToast('Please provide the resolver notes');
      return;
    }
    try {
      const response = await api.put('/report', {
        id: report.id,
        status: statusValue,
        resolver_notes: resolverNotes,
        target_type: report.target_type,
        target_id: report.target_id,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setResolverNotes('');
    }
    onClose();
  };

  const handleClose = () => {
    setResolverNotes('');
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-5">
        <View
          className="flex w-full gap-5 rounded-xl bg-surface px-5 py-6"
          style={{ backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF' }}>
          <Text className="text-center text-xl font-bold text-text-main">Edit report</Text>
          <Text>Select the status</Text>
          <DropDownPicker
            zIndex={2000}
            zIndexInverse={2000}
            items={status}
            open={statusOpen}
            setOpen={setStatusOpen}
            value={statusValue}
            setValue={setStatusValue}
            onChangeValue={(value) => setStatusValue(value)}
          />
          <TextInput
            className="h-28 rounded-lg border border-gray-300 p-3 text-base text-text-main"
            placeholder="Add resolver notes here..."
            placeholderTextColor="gray"
            multiline
            value={resolverNotes}
            onChangeText={setResolverNotes}
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
              onPress={handleEditReport}>
              <Text className="font-bold text-white">Report</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default EditReportModal;
