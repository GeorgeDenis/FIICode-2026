import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { errorToast } from '../utils/toast';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        errorToast('You need to grant location permissions to see the map centered on you!');
        setLoading(false);
        return;
      }

      let currentLoc = await Location.getCurrentPositionAsync({});
      setLocation(currentLoc);
      setLoading(false);
    })();
  }, []);

  return { location, loading };
}
