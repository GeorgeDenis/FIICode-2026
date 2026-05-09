import api from './api';

export const getIncidentTypes = async () => {
  const response = await api.get('/incident/type');
  return response.data;
};

export const getAllIncidentTypes = async () => {
  const response = await api.get('/incident/type/all');
  return response.data;
};

export const createIncidentType = async (data) => {
  const response = await api.post('/incident/type', data);
  return response.data;
};

export const updateIncidentType = async (typeId, data) => {
  const response = await api.put(`/incident/type/${typeId}`, data);
  return response.data;
};


export const submitIncidentReport = async (data) => {
  const response = await api.post('/incident/report', data);
  return response.data;
};

export const getNearbyReports = async (typeId, lat, lon, radius = 500) => {
  const response = await api.get('/incident/report/nearby', {
    params: { incident_type_id: typeId, latitude: lat, longitude: lon, radius },
  });
  return response.data;
};

export const activateCrisis = async (data) => {
  const response = await api.post('/crisis/activate', data);
  return response.data;
};

export const resolveCrisis = async (crisisId) => {
  const response = await api.post(`/crisis/resolve/${crisisId}`);
  return response.data;
};

export const getActiveCrises = async () => {
  const response = await api.get('/crisis/active', {
    params: { _t: Date.now() },
  });
  return response.data;
};

export const getCrisisStatus = async (latitude, longitude) => {
  const response = await api.get('/crisis/status', {
    params: { latitude, longitude, _t: Date.now() },
  });
  return response.data;
};

export const submitCheckIn = async (data) => {
  const response = await api.post('/crisis/checkin', data);
  return response.data;
};

export const adminUpdateCheckIn = async (checkinId, data) => {
  const response = await api.put(`/crisis/checkin/${checkinId}`, data);
  return response.data;
};

export const getMyCheckIn = async (crisisId) => {
  const response = await api.get('/crisis/checkin/me', {
    params: { crisis_id: crisisId },
  });
  return response.data;
};

export const getCheckInsForCrisis = async (crisisId) => {
  const response = await api.get(`/crisis/checkin/${crisisId}`);
  return response.data;
};
