import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';
import { getCurrentUser, getToken, setUser as saveUser, setToken as saveToken, clearAuth } from '../utils/auth';

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
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser && token) {
      setUser(storedUser);
    }
    setLoading(false);
  }, [token]);

  // Register new user
  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      return { success: true, data };
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
      const data = await authService.login(email, password);

      if (!data) {
        throw new Error('No data in response');
      }

      let token, userData;

      if (data.token && data.user) {
        token = data.token;
        userData = data.user;
      } else if (data.token && data.email) {
        token = data.token;
        userData = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role
        };
      } else {
        throw new Error('Invalid response format');
      }

      saveToken(token);
      saveUser(userData);

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
    clearAuth();
    setToken(null);
    setUser(null);
  };

  // Update user profile locally
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  // Refresh user profile from backend
  const refreshUserProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      saveUser(profile);
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