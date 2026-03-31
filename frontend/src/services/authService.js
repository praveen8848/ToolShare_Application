import api from '../config/axiosConfig';

const authService = {
  // Register new user
  register: async (name, email, password) => {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  // Validate token
  validateToken: async () => {
    const response = await api.post('/api/auth/validate');
    return response.data;
  },
};

export default authService;