import React, { useEffect } from 'react';
import { ScrollView, Text } from 'react-native';
import WeatherWidget from '../../components/home/WeatherWidget';
import { useLocation } from '../../hooks/useLocation';
import HeroWidget from '../../components/home/HeroWidget';
import PulsesCarousel from '../../components/home/PulsesCarousel';
import ActionZone from '../../components/home/ActionZone';
import api from '../../services/api';
import { useCrisis } from '../../hooks/useCrisis';
import CrisisHomeScreen from '../../components/crisis/CrisisHomeScreen';

const Home = () => {
  const { location, loading: locationLoading } = useLocation();
  const { isCrisisActive } = useCrisis();

  useEffect(() => {
    const syncLocationWithDatabase = async () => {
      if (!location || !location.coords) {
        return;
      }
      try {
        await api.put('/user/location', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error sync position', error);
      }
    };

    syncLocationWithDatabase();
  }, [location]);

  if (isCrisisActive) {
    return <CrisisHomeScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {!locationLoading && location ? (
        <WeatherWidget latitude={location.coords.latitude} longitude={location.coords.longitude} />
      ) : (
        <Text>Searching your location...</Text>
      )}
      <HeroWidget />
      <ActionZone />
      <PulsesCarousel />
    </ScrollView>
  );
};

export default Home;
