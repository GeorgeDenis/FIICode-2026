// import axios from 'axios';
// import { Platform } from 'react-native';
// import * as Device from 'expo-device';
// import * as SecureStore from 'expo-secure-store';
//
// export const IP_CONFIG = '172.24.65.189';
// export const wsUrl = `ws://${IP_CONFIG}:5000/ws`;
// export const RAILWAY_URL = 'urbanpulse-production-9bbb.up.railway.app';
// export const WS_BASE_URL = __DEV__
//   ? `ws://${IP_CONFIG}:5000/ws`
//   : `wss://${RAILWAY_URL}/ws`;
//
// let LOCAL_API_URL = `http://${IP_CONFIG}:5000/api/v1`;
// let PROD_API_URL =
//   'https://railway.com/project/6003d387-a48d-41f1-b14d-cf216f7149d9/service/1b39d106-723f-4d4d-bf88-4265ef45221a/variables?environmentId=68bc4da5-2019-49cb-9ddb-4bec39072776';
//
// // if (Platform.OS === 'android') {
// //   if (Device.isDevice) {
// //     LOCAL_API_URL = `http://${IP_CONFIG}:8000/api/v1`;
// //   } else {
// //     LOCAL_API_URL = 'http://172.24.65.189:8000/api/v1';
// //   }
// // }
//
// const API_BASE_URL = __DEV__ ? LOCAL_API_URL : PROD_API_URL;
//
// const instance = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });
//
// instance.interceptors.request.use(
//   async (config) => {
//     const token = await SecureStore.getItemAsync('userToken');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// export default instance;

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const IP_CONFIG = '172.24.65.189';

export const API_BASE_URL = __DEV__
  ? `http://${IP_CONFIG}:5000/api/v1`
  : 'https://urbanpulse-production-9bbb.up.railway.app/api/v1';

export const WS_BASE_URL = __DEV__
  ? `ws://${IP_CONFIG}:5000/ws`
  : 'wss://urbanpulse-production-9bbb.up.railway.app/ws';

const instance = axios.create({
  baseURL: API_BASE_URL,
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
  (error) => Promise.reject(error)
);

export default instance;

