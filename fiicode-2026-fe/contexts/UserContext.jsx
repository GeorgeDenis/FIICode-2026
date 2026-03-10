import { createContext, useEffect, useState } from 'react';
import api from '../services/api';
import { errorToast, successToast } from '../utils/toast';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 403) {
          // errorToast('Your session has expired. Please log in again.');
          await logout();
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

        if (token) {
          setUser({ token: token });
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
      const token = response.data.data.token;
      await SecureStore.setItemAsync('userToken', token);
      setUser({ token: token });
      successToast('Login successful');
    } catch (error) {
      const backendMessage = error.response?.data?.error?.message;
      throw new Error(backendMessage || error.message);
    }
  }

  async function register(email, firstName, lastName, password) {
    try {
      const response = await api.post('/auth/register', {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
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
    await SecureStore.deleteItemAsync('userToken');
    setUser(null);
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
