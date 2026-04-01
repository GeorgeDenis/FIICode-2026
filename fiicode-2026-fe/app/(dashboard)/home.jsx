import React, { useEffect } from 'react';
import { ScrollView, Text } from 'react-native';
import WeatherWidget from '../../components/home/WeatherWidget';
import { useLocation } from '../../hooks/useLocation';

const Home = () => {
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {}, []);
  return (
    <ScrollView className="flex-1 bg-background">
      {!locationLoading && location ? (
        <WeatherWidget latitude={location.coords.latitude} longitude={location.coords.longitude} />
      ) : (
        <Text>Searching your location...</Text>
      )}
    </ScrollView>
  );
};

export default Home;
