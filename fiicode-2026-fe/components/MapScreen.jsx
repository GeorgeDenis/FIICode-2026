import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('You need to grant location permissions to see the map centered on you!');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      console.log(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={{ flex: 1, width: '100%', height: '50%' }}>
      {!region ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{errorMsg || 'Searching...'}</Text>
        </View>
      ) : (
        <MapView style={{ flex: 1 }} region={region} showsUserLocation={true}>
          <Circle
            center={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            radius={500}
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor="rgba(59, 130, 246, 0.8)"
            strokeWidth={2}
          />

          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="Locația ta"
          />
        </MapView>
      )}
    </View>
  );
}
