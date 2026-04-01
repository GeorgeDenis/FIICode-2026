import axios from 'axios';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

export const IP_CONFIG = '192.168.1.36';

let API_URL = `http://${IP_CONFIG}:8000/api/v1`;

if (Platform.OS === 'android') {
  if (Device.isDevice) {
    API_URL = `http://${IP_CONFIG}:8000/api/v1`;
  } else {
    API_URL = 'http://10.0.2.2:8000/api/v1';
  }
}

const instance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;