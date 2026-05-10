import { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { successToast } from '../utils/toast';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { router } from 'expo-router';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';

        if ((status === 401 || status === 403) && !url.includes('/auth/login')) {
          await logout();
          // Return a permanently-pending promise so no downstream catch / errorToast fires.
          return new Promise(() => {});
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    async function checkToken() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const decoded = jwtDecode(token);
        const user_id = decoded.id;
        const role = decoded.role;
        if (token) {
          setUser({ token: token, user_id, role });
        }
      } catch (error) {
        console.log('Error reading token:', error);
      } finally {
        setAuthChecked(true);
      }
    }

    checkToken();
  }, []);

  async function login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.token;

      await SecureStore.setItemAsync('userToken', token);
      const decoded = jwtDecode(token);
      const user_id = decoded.id;
      const role = decoded.role;
      setUser({ token: token, user_id, role });
      successToast('Login successful');
    } catch (error) {
      const backendMessage = error.response?.data?.error?.message;
      throw new Error(backendMessage || error.message);
    }
  }

  async function register(email, firstName, lastName, password, latitude, longitude) {
    try {
      const response = await api.post('/auth/register', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        latitude,
        longitude,
      });
      if (response.status === 201) {
        successToast('Registration successful');
      }
    } catch (error) {
      const backendMessage = error.response?.data?.error?.message;
      throw new Error(backendMessage || error.message);
    }
  }

  async function logout() {
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace('/(auth)/login');
    
    await SecureStore.deleteItemAsync('userToken');
    setTimeout(() => {
      setUser(null);
    }, 150);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        authChecked,
      }}>
      {children}
    </UserContext.Provider>
  );
}
