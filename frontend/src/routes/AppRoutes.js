import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import BrowseToolsPage from '../pages/BrowseToolsPage';
import ToolDetailsPage from '../pages/ToolDetailsPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import ReturnPage from '../pages/ReturnPage';
import OwnerDashboardPage from '../pages/OwnerDashboardPage';
import MyToolsPage from '../pages/MyToolsPage';
import AddToolPage from '../pages/AddToolPage';
import EditToolPage from '../pages/EditToolPage';
import CategoryManagementPage from '../pages/CategoryManagementPage';
import ProfilePage from '../pages/ProfilePage';
import LandingPage from '../pages/LandingPage';
import ToolViewPage from '../pages/ToolViewPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';

import OwnerProfile from '../pages/OwnerProfile'; 

const AppRoutes = () => {
  const isAuthenticated = !!localStorage.getItem("token"); // simple check

  return (
    <Routes>

      {/* ✅ ONLY PUBLIC ROUTE */}
      <Route path="/landing" element={<LandingPage />} />

      {/* 🔒 LOGIN & REGISTER (blocked if already logged in) */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />
        }
      />
      <Route
        path="/forgot-password"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />
        }
      />

      {/* 🔒 ALL PROTECTED ROUTES */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/browse" element={<ProtectedRoute><BrowseToolsPage /></ProtectedRoute>} />
      <Route path="/tools/:id" element={<ProtectedRoute><ToolDetailsPage /></ProtectedRoute>} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/return/:id" element={<ProtectedRoute><ReturnPage /></ProtectedRoute>} />
      <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboardPage /></ProtectedRoute>} />
      <Route path="/my-tools" element={<ProtectedRoute><MyToolsPage /></ProtectedRoute>} />
      <Route path="/add-tool" element={<ProtectedRoute><AddToolPage /></ProtectedRoute>} />
      <Route path="/edit-tool/:id" element={<ProtectedRoute><EditToolPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute><CategoryManagementPage /></ProtectedRoute>} />
      <Route path="/tools/view/:id" element={<ProtectedRoute><ToolViewPage /></ProtectedRoute>} />
  
      
      {/* FIX 2: Wrapped in ProtectedRoute so you keep your Navbar/Auth context! */}
      <Route path="/owner/:ownerId" element={<ProtectedRoute><OwnerProfile /></ProtectedRoute>} />

      {/* 🔁 ROOT LOGIC */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/landing" />
        }
      />

      {/* ❌ FALLBACK */}
      <Route path="*" element={<Navigate to="/landing" />} />

    </Routes>
  );
};

export default AppRoutes;