import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { errorToast } from '../../utils/toast';

const ReactionBar = ({
  pulseId,
  initialLikes = 0,
  initialDislikes = 0,
  // initialUserReaction = null,
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);

  const handleReaction = async (isLiking) => {
    try {
      const response = await api.post('/pulse/react', {
        pulse_id: pulseId,
        is_like: isLiking,
      });
      setLikes(response.data.like_count);
      setDislikes(response.data.dislike_count);
    } catch (error) {
      errorToast('Failed to submit reaction. Please try again.');
    }
  };

  return (
    <View className="flex flex-row items-center justify-between gap-2">
      <Pressable onPress={() => handleReaction(true)} className="flex flex-row items-center gap-1">
        <Ionicons name="thumbs-up" color="#6495ED" size={20} />
        <Text className="text-sm font-semibold text-text-main">{likes}</Text>
      </Pressable>
      <Pressable onPress={() => handleReaction(false)} className="flex flex-row items-center gap-1">
        <Ionicons name="thumbs-down" color="red" size={20} />
        <Text className="text-sm font-semibold text-text-main">{dislikes}</Text>
      </Pressable>
    </View>
  );
};

export default ReactionBar;
