import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/axiosConfig';
import userService from '../services/userService'; // Add this import

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // Register new user
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
      });
      
      console.log('Register response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      
      let errorMessage = 'Registration failed';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      
      if (!response.data) {
        throw new Error('No data in response');
      }
      
      let token, userData;
      
      if (response.data.token && response.data.user) {
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.token && response.data.email) {
        token = response.data.token;
        userData = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role
        };
      } else {
        throw new Error('Invalid response format');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = 'Login failed';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update user profile locally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // NEW: Refresh user profile from backend
  const refreshUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    token,
    register,
    login,
    logout,
    updateUser,
    refreshUserProfile, // Add this to the value object
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};