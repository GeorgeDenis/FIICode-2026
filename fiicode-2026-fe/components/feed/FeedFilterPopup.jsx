import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FeedFilterPopup({ visible, onClose, onApply }) {
  const [type, setType] = useState('');
  const [urgency, setUrgency] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');

  const types = ['Emergency', 'Item', 'Skill'];
  const sortOptions1 = ['NEWEST', 'OLDEST'];
  // const sortOptions2 = ['LOCATION', 'KEYWORD', 'CATEGORY'];

  const urgencies = [
    { label: 'Low', icon: 'happy-outline', activeBg: 'bg-blue-500', activeText: 'text-white' },
    { label: 'Medium', icon: 'hammer-outline', activeBg: 'bg-orange-400', activeText: 'text-white', },
    { label: 'High', icon: 'alert-outline', activeBg: 'bg-red-600', activeText: 'text-white', },
  ];

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/30">
        <View className="mt-[50px] w-full rounded-b-3xl bg-surface px-5 pb-6 pt-12 shadow-2xl">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold tracking-widest text-text-main">FILTER</Text>
            <Pressable onPress={onClose} className="p-1 active:opacity-50">
              <Ionicons name="close" size={28} color="gray" />
            </Pressable>
          </View>

          <Text className="mb-2 text-sm font-bold text-text-main">TYPE</Text>
          <View className="mb-6 flex-row flex-wrap gap-2">
            {types.map((item) => {
              const isActive = type === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setType(item)}
                  className={`flex-row items-center justify-center rounded-full px-4 py-2 ${
                    isActive
                      ? 'border-2 border-green-600 bg-white'
                      : 'border-2 border-transparent bg-gray-200'
                  }`}>
                  <Text className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {item}
                  </Text>
                  {isActive && (
                    <View className="absolute -right-1 -top-1 rounded-full bg-green-600 p-0.5">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text className="mb-2 text-sm font-bold text-text-main">URGENCY</Text>
          <View className="mb-6 flex-row justify-between gap-2">
            {urgencies.map((item) => {
              const isActive = urgency === item.label;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => setUrgency(item.label)}
                  className={`flex-1 items-center justify-center rounded-xl py-3 ${
                    isActive ? item.activeBg : 'border-2 border-transparent bg-gray-200'
                  }`}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={isActive ? (item.label === 'HIGH' ? '#DC2626' : 'white') : 'gray'}
                  />
                  <Text
                    className={`mt-1 text-xs font-bold ${isActive ? item.activeText : 'text-gray-600'}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="mb-2 text-sm font-bold text-text-main">SORT BY</Text>
          <View className="mb-2 flex-row gap-2">
            {sortOptions1.map((item) => (
              <Pressable
                key={item}
                onPress={() => setSortBy(item)}
                className={`flex-1 items-center justify-center rounded-full py-2 ${
                  sortBy === item ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                <Text className={`font-bold ${sortBy === item ? 'text-white' : 'text-gray-600'}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          {/*<View className="mb-8 flex-row gap-2">*/}
          {/*  {sortOptions2.map((item) => (*/}
          {/*    <Pressable*/}
          {/*      key={item}*/}
          {/*      onPress={() => setSortBy(item)}*/}
          {/*      className={`flex-1 items-center justify-center rounded-full py-2 ${*/}
          {/*        sortBy === item ? 'bg-gray-600' : 'bg-gray-200'*/}
          {/*      }`}>*/}
          {/*      <Text*/}
          {/*        className={`text-xs font-bold ${sortBy === item ? 'text-white' : 'text-gray-600'}`}>*/}
          {/*        {item}*/}
          {/*      </Text>*/}
          {/*    </Pressable>*/}
          {/*  ))}*/}
          {/*</View>*/}

          <View className="flex-row items-center justify-between border-t border-gray-200 pt-4">
            <Pressable
              className="px-4 py-3 active:opacity-50"
              onPress={() => {
                setType('');
                setUrgency('');
                setSortBy('NEWEST');
              }}>
              <Text className="font-bold text-text-main">CLEAR ALL</Text>
            </Pressable>

            <Pressable
              className="rounded-full bg-black px-8 py-3 active:bg-gray-800 dark:bg-white"
              onPress={() => {
                onApply({ type, urgency, sortBy });
                onClose();
              }}>
              <Text className="font-bold text-white dark:text-black">APPLY FILTERS</Text>
            </Pressable>
          </View>
        </View>

        <Pressable className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
