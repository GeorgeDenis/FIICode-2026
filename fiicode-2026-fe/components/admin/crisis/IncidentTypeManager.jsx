import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { getAllIncidentTypes, createIncidentType, updateIncidentType } from '../../../services/crisisService';
import { errorToast, successToast } from '../../../utils/toast';

const IncidentTypeManager = () => {
  const [types, setTypes] = useState([]);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');

  const fetchTypes = async () => {
    try {
      const data = await getAllIncidentTypes();
      setTypes(data);
    } catch (error) {
      console.error('Failed to fetch types:', error);
    }
  };

  useFocusEffect(useCallback(() => { fetchTypes(); }, []));

  const handleCreate = async () => {
    if (!newName.trim()) {
      errorToast('Name is required');
      return;
    }
    try {
      await createIncidentType({ name: newName.trim(), icon: newIcon.trim() || null });
      successToast('Type created');
      setNewName('');
      setNewIcon('');
      fetchTypes();
    } catch (error) {
      errorToast('Failed to create type');
    }
  };

  const handleToggle = async (typeId, currentActive) => {
    try {
      await updateIncidentType(typeId, { is_active: !currentActive });
      fetchTypes();
    } catch (error) {
      errorToast('Failed to update type');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <Text className="mb-2 font-bold text-gray-800 dark:text-gray-200">Add Incident Type</Text>
        <TextInput
          className="mb-2 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Type name (e.g. Power Outage)"
          placeholderTextColor="#999"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          className="mb-3 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Icon name (e.g. flash-off)"
          placeholderTextColor="#999"
          value={newIcon}
          onChangeText={setNewIcon}
        />
        <Pressable onPress={handleCreate} className="self-end rounded-full bg-blue-600 px-4 py-2 active:bg-blue-700">
          <Text className="font-semibold text-white">+ Add</Text>
        </Pressable>
      </View>

      {types.map((type) => (
        <View
          key={type.id}
          className="mb-2 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
          <View className="flex-row items-center gap-2">
            <Ionicons name={type.icon || 'alert-circle'} size={20} color="#F87171" />
            <Text className="font-semibold text-gray-800 dark:text-gray-200">{type.name}</Text>
          </View>
          <Switch
            value={type.is_active}
            onValueChange={() => handleToggle(type.id, type.is_active)}
            trackColor={{ false: '#767577', true: '#34D399' }}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default IncidentTypeManager;
