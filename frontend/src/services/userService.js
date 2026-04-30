import api from '../config/axiosConfig';

const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      // Ensure profileImageUrl is a full URL if it exists
      if (response.data.profileImageUrl && !response.data.profileImageUrl.startsWith('http')) {
        response.data.profileImageUrl = `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080'}${response.data.profileImageUrl}`;
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
        : `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080'}${imageUrl}`;
      
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
      if (response.data.profileImageUrl && !response.data.profileImageUrl.startsWith('http')) {
        response.data.profileImageUrl = `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080'}${response.data.profileImageUrl}`;
      }
      return response.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      const response = await api.post('/api/users/resend-verification');
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },

  // NEW: Forgot Password (Request OTP)
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // NEW: Reset Password (Verify OTP and save new password)
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await api.post('/api/users/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

export default userService;