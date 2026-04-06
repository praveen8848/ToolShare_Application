import api from '../config/axiosConfig';

const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      // Ensure profileImageUrl is a full URL if it exists
      if (response.data.profileImageUrl && !response.data.profileImageUrl.startsWith('http')) {
        response.data.profileImageUrl = `http://localhost:8080${response.data.profileImageUrl}`;
      }
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Return full URL for the uploaded image
      const imageUrl = response.data.imageUrl;
      const fullImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `http://localhost:8080${imageUrl}`;
      
      return {
        ...response.data,
        imageUrl: fullImageUrl
      };
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      // Ensure profileImageUrl is a full URL if it exists
      if (response.data.profileImageUrl && !response.data.profileImageUrl.startsWith('http')) {
        response.data.profileImageUrl = `http://localhost:8080${response.data.profileImageUrl}`;
      }
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },
};

export default userService;