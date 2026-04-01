import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFocusEffect } from 'expo-router';
import { errorToast } from '../../utils/toast'; // Folosim api-ul tău intern către backend!

const WeatherWidget = ({ latitude, longitude }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!latitude || !longitude) return;

      let isActive = true;

      const fetchWeather = async () => {
        try {
          setLoading(true);
          const response = await api.get(
            `/pulse/weather?latitude=${latitude}&longitude=${longitude}`
          );

          if (isActive) {
            setWeatherData(response.data);
          }
        } catch (error) {
          errorToast('Error fetching weather data. Please try again later.');
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      fetchWeather();

      return () => {
        isActive = false;
      };
    }, [latitude, longitude])
  );

  if (loading) {
    return (
      <View className="mx-4 mb-4 h-32 items-center justify-center rounded-3xl bg-surface shadow-sm">
        <ActivityIndicator color="#10b981" size="large" />
      </View>
    );
  }

  if (!weatherData) return null;

  const weather = weatherData.weather[0];
  const main = weatherData.main;

  const getWeatherTheme = (condition) => {
    switch (condition) {
      case 'Clear':
        return { bg: 'bg-sky-400', icon: 'sunny', text: 'text-white' };
      case 'Clouds':
        return { bg: 'bg-slate-500', icon: 'cloudy', text: 'text-white' };
      case 'Rain':
      case 'Drizzle':
        return { bg: 'bg-blue-600', icon: 'rainy', text: 'text-white' };
      case 'Thunderstorm':
      case 'Tornado':
      case 'Squall':
        return { bg: 'bg-red-600', icon: 'thunderstorm', text: 'text-white' };
      case 'Snow':
        return { bg: 'bg-indigo-300', icon: 'snow', text: 'text-indigo-900' };
      default:
        return { bg: 'bg-gray-600', icon: 'partly-sunny', text: 'text-white' };
    }
  };

  const theme = getWeatherTheme(weather.main);

  return (
    <View className={`mx-4 mb-4 overflow-hidden rounded-3xl ${theme.bg} mt-4 p-5 shadow-md`}>
      <View className="flex-row items-start justify-between">
        <View>
          <Text className={`text-sm font-bold uppercase tracking-wider ${theme.text} opacity-90`}>
            Local weather
          </Text>
          <Text className={`mt-1 text-2xl font-bold capitalize ${theme.text}`}>
            {weather.description}
          </Text>
        </View>
        <Ionicons
          name={theme.icon}
          size={48}
          color={theme.text === 'text-white' ? '#ffffff' : '#312e81'}
        />
      </View>

      <View className="my-2 flex-row items-end">
        <Text className={`text-6xl font-extrabold ${theme.text}`}>{Math.round(main.temp)}°</Text>
        <Text className={`mb-2 ml-2 text-lg font-bold ${theme.text} opacity-80`}>
          Feels like {Math.round(main.feels_like)}°
        </Text>
      </View>

      <View className="mt-2 flex-row items-center justify-between border-t border-white/20 pt-3">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="thermometer-outline"
            size={16}
            color={theme.text === 'text-white' ? '#ffffff' : '#312e81'}
          />
          <Text className={`font-semibold ${theme.text}`}>
            H:{Math.round(main.temp_max)}° L:{Math.round(main.temp_min)}°
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons
            name="water-outline"
            size={16}
            color={theme.text === 'text-white' ? '#ffffff' : '#312e81'}
          />
          <Text className={`font-semibold ${theme.text}`}>{main.humidity}%</Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons
            name="speedometer-outline"
            size={16}
            color={theme.text === 'text-white' ? '#ffffff' : '#312e81'}
          />
          <Text className={`font-semibold ${theme.text}`}>{main.pressure} hPa</Text>
        </View>
      </View>
    </View>
  );
};

export default WeatherWidget;
