import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import MissionCard from './MissionCard';
import api from '../../services/api';

const MyMissionCard = ({ mission, onMissionUpdate }) => {
  const [status, setStatus] = useState(mission.status);
  const [feedbackText, setFeedbackText] = useState(mission.feedback_text || '');
  const [feedbackType, setFeedbackType] = useState(mission.feedback_type || '');

  const handleUpdateStatus = async (newStatus) => {
    try {
      if (newStatus === 'Completed' || newStatus === 'Declined') {
        await handleSubmitFeedback();
        return;
      }
      await api.put(`/mission/${mission.id}`, { status: newStatus });
      setStatus(newStatus);
      if (onMissionUpdate) onMissionUpdate();
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() && !feedbackType) {
      alert('Please provide feedback before updating status');
      return;
    }
    try {
      await api.put(`/mission/${mission.id}`, { status });
      alert('Feedback submitted!');
      if (onMissionUpdate) onMissionUpdate();
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback');
    }
  };

  return (
    <MissionCard mission={{ ...mission, status }}>
      <View className="flex flex-col gap-3">
        <View>
          <Text className="mb-2 text-sm font-semibold text-gray-700">Set Status:</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {['Pending', 'Accepted', 'Completed', 'Declined'].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => handleUpdateStatus(s)}
                className={`rounded-full border px-3 py-1 ${
                  status === s ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                }`}>
                <Text
                  className={`text-xs font-medium ${status === s ? 'text-white' : 'text-gray-600'}`}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
          <Text className="mb-2 text-sm font-semibold text-gray-700">Set Feedback Type:</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {['Positive', 'Neutral', 'Negative'].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setFeedbackType(s)}
                className={`rounded-full border px-3 py-1 ${
                  feedbackType === s ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                }`}>
                <Text
                  className={`text-xs font-medium ${feedbackType === s ? 'text-white' : 'text-gray-600'}`}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-gray-700">Provide Feedback:</Text>
          <TextInput
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Write your feedback..."
            className="h-20 rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-800"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            className="mt-2 items-center rounded-lg bg-green-500 py-2"
            onPress={handleSubmitFeedback}>
            <Text className="font-semibold text-white">Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MissionCard>
  );
};

export default MyMissionCard;
