import api from './api';

const PetService = {
  async getPets() {
    try {
      const response = await api.get('/pets/pets');
      return response.data;
    } catch (error) {
      console.error('Error fetching pets:', error);
      throw error;
    }
  },

  async uploadPetPulse(imageUri, status) {
    try {
      const formData = new FormData();

      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });
      formData.append('status', status);

      const response = await api.post('/pets/pet-pulses/ai-match', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading pet pulse:', error);
      throw error;
    }
  },

  async getSimilarPetsById(petId) {
    try {
      const response = await api.get(`/pets/similar/by-id/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching similar pets by id:', error);
      throw error;
    }
  },

  async getSearchSimilarPetsByImage(imageUri) {
    try {
      const formData = new FormData();

      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: type,
      });

      const response = await api.post('/pets/similar/by-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching similar pets by image:', error);
      throw error;
    }
  },

  async getMyPets() {
    try {
      const response = await api.get('/pets/my-pulses');
      return response.data;
    } catch (error) {
      console.error('Error fetching my pets:', error);
      throw error;
    }
  },

  async updatePetStatus(petId, status) {
    try {
      const response = await api.patch(`/pets/pet-pulses/${petId}?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Error updating pet status:', error);
      throw error;
    }
  },

  async deletePet(petId) {
    try {
      const response = await api.delete(`/pets/pet-pulses/${petId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  },
};

export default PetService;
