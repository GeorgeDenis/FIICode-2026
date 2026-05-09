import MapView, { Marker, Polyline } from 'react-native-maps';
import { View } from 'react-native';

export const DocumentMap = ({ doc, userLocation, routeCoords }) => {
  const hasUserLocation = !!userLocation?.coords;
  return (
    <View className="mt-3 h-60 w-full overflow-hidden rounded-xl border">
      <MapView
        style={{ width: '100%', height: '100%' }}
        initialRegion={{
          latitude: doc.location_lat,
          longitude: doc.location_lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}>
        <Marker
          coordinate={{ latitude: doc.location_lat, longitude: doc.location_lng }}
          title="Document location"
          description="This is where the document was found"
        />
        {hasUserLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            pinColor="purple"
            title="Your location"
          />
        )}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#10b981" />
        )}
      </MapView>
    </View>
  );
};
