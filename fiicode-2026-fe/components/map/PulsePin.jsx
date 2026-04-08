import React from 'react';
import { Callout, Marker } from 'react-native-maps';
import { Image,Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const getInitials = (firstName, lastName) => {
  return firstName || lastName
    ? `${firstName?.charAt(0)} ${lastName?.charAt(0)}`.toUpperCase()
    : 'Unknown';
};

const getMarkerColor = (pulse) => {
  switch (pulse.type) {
    case 'Emergency':
      return 'red';
    case 'Skill':
      return 'blue';
    case 'Item':
      return 'green';
    default:
      return 'gray';
  }
};

const PulsePin = ({ pulse }) => {
  const router = useRouter();

  const handleNavigation = () => {
    router.push({
      pathname: '/pulse-comments/' + pulse.id,
    });
  };

  return (
    <Marker
      pinColor={getMarkerColor(pulse)}
      key={pulse.id}
      coordinate={{
        latitude: pulse.latitude,
        longitude: pulse.longitude,
      }}>
      <Callout tooltip onPress={() => handleNavigation()}>
        <View className="min-w-[150px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-surface p-3">
          {pulse.author?.image ? (
            <Image
              source={{ uri: pulse.author.image }}
              className="mb-0 h-[48px] w-[48px] rounded-3xl"
              resizeMode="cover"
            />
          ) : (
            <View className="mb-2 h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Text className="font-bold text-white">
                {getInitials(pulse.author.first_name, pulse.author.last_name)}
              </Text>
            </View>
          )}

          <Text className="text-center text-base font-bold text-text-main">{pulse.type}</Text>

          <Text className="mt-1 text-center text-xs text-text-muted" numberOfLines={2}>
            {pulse.content}
          </Text>
          <Text className="mt-1 text-center text-xs text-text-muted" numberOfLines={2}>
            {pulse.urgency_level}
          </Text>
          <Text className="mt-2 text-center text-sm font-bold text-primary">View Details</Text>
        </View>
      </Callout>
    </Marker>
  );
};

export default PulsePin;
