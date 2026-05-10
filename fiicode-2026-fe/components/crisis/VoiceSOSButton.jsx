import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import api from '../../services/api';
import { errorToast, successToast } from '../../utils/toast';
import { useLocation } from '../../hooks/useLocation';

const VoiceSOSButton = ({ refetch }) => {
  const [recording, setRecording] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const { location } = useLocation();

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, [permissionResponse]);

  const startRecording = async () => {
    try {
      if (!permissionResponse?.granted) {
        errorToast('Microphone permission not granted');
        return;
      }
      if (!location?.coords) {
        errorToast('Location is required for SOS');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      errorToast('Failed to start recording');
    }
  };

  const stopRecordingAndSend = async () => {
    if (!recording) return;

    try {
      setIsProcessing(true);

      const status = await recording.getStatusAsync();
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (status.durationMillis < 1000) {
        errorToast('Hold the button to record your SOS');
        setIsProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'voice_sos.m4a',
        type: 'audio/m4a',
      });
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());

      await api.post('/crisis/voice-sos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      successToast('Voice SOS Sent!');
      refetch?.();
    } catch (error) {
      console.error('Voice SOS Error', error);
      errorToast('Failed to parse Voice SOS');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <View className="h-16 w-16 flex-row items-center justify-center rounded-full bg-red-800 p-4 shadow-lg">
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <Pressable
      onPressIn={startRecording}
      onPressOut={stopRecordingAndSend}
      className={`h-16 w-16 flex-row items-center justify-center rounded-full p-4 shadow-lg ${
        recording ? 'scale-110 bg-red-500' : 'bg-red-600'
      }`}>
      <Ionicons name="mic" size={28} color="#FFFFFF" />
    </Pressable>
  );
};

export default VoiceSOSButton;
