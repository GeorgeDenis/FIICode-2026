import api from './api';

export const safetyService = {
  getContacts: async () => {
    const res = await api.get('/safety/contacts');
    return res.data;
  },
  requestContact: async (email) => {
    const res = await api.post('/safety/contacts/request', { contact_email: email });
    return res.data;
  },
  acceptContact: async (contactId) => {
    const res = await api.put(`/safety/contacts/${contactId}/accept`);
    return res.data;
  },
  removeContact: async (contactId) => {
    const res = await api.delete(`/safety/contacts/${contactId}`);
    return res.data;
  },
  startTimer: async (durationMinutes, lat, lon) => {
    const res = await api.post('/safety/timer/start', {
      duration_minutes: durationMinutes,
      start_latitude: lat,
      start_longitude: lon,
    });
    return res.data;
  },
  cancelTimer: async () => {
    const res = await api.post('/safety/timer/cancel');
    return res.data;
  },
  getActiveTimer: async () => {
    const res = await api.get('/safety/timer/active');
    return res.data;
  },
};
