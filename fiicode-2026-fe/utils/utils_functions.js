import * as Location from 'expo-location';
import { errorToast } from './toast';

export const formatMessageDateTime = (dateString) => {
  if (!dateString) return 'now';

  const messageDate = new Date(dateString);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const time = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (messageDate.toDateString() === today.toDateString()) {
    return time;
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${time}`;
  }

  const dateOptions = { day: '2-digit', month: 'short' };
  const shortDate = messageDate.toLocaleDateString('ro-RO', dateOptions);

  return `${shortDate}, ${time}`;
};

export const getBorderColorByType = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'border-red-500';
    case 'Skill':
      return 'border-blue-500';
    case 'Item':
      return 'border-green-500';
    default:
      return 'border-gray-500';
  }
};

export const getTypeBadgeColor = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'bg-red-500';
    case 'Skill':
      return 'bg-blue-500';
    case 'Item':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const getIconName = (item) => {
  switch (item.type) {
    case 'Emergency':
      return 'flame-outline';
    case 'Skill':
      return 'construct';
    case 'Item':
      return 'cube';
    default:
      return 'help-circle';
  }
};

export async function getCurrentUserLocation() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    errorToast('You need to grant location permissions to see the map centered on you!');
    return null;
  }

  return await Location.getCurrentPositionAsync({});
}

export const parseTimeStringToDate = (timeString) => {
  if (!timeString) return new Date();

  const [hours, minutes] = timeString.split(':');

  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

  return date;
};

export const computeHaversineDistance = (lat1, lon1, lat2, lon2) => {
  function toRad(degree) {
    return (degree * Math.PI) / 180;
  }
  const R = 6371.0;

  const x1 = lat2 - lat1;
  const dLat = toRad(x1);
  const x2 = lon2 - lon1;
  const dLon = toRad(x2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getInitials = (first, last) => {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase() || 'H';
};

export const formatTimeForBackend = (date) => {
  if (typeof date === 'string') {
    return date.split(':').slice(0, 2).join(':');
  }
  console.log(date);

  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};
