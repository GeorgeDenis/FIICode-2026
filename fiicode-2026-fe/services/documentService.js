import api from './api';

const DocumentService = {
  async getAllFoundDocuments() {
    const response = await api.get('/documents');
    return response.data;
  },

  async getMyFoundDocuments() {
    const response = await api.get('/documents/mine/found');
    return response.data;
  },

  async getDocumentsMatchedToMe() {
    const response = await api.get('/documents/mine/matches');
    return response.data;
  },

  async scanDocument(imageUri, locationLat, locationLng) {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', { uri: imageUri, name: filename, type });
    if (locationLat != null) formData.append('location_lat', String(locationLat));
    if (locationLng != null) formData.append('location_lng', String(locationLng));

    const response = await api.post('/documents/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async claimDocument(docId) {
    const response = await api.post(`/documents/${docId}/claim`);
    return response.data;
  },

  async deleteDocument(docId) {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
  },
};

export default DocumentService;
