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
import ProfilePage from '../pages/ProfilePage';
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <BrowseToolsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tools/:id"
        element={
          <ProtectedRoute>
            <ToolDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/return/:id"
        element={
          <ProtectedRoute>
            <ReturnPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner-dashboard"
        element={
          <ProtectedRoute>
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
      path="/my-tools"
      element={
        <ProtectedRoute>
          <MyToolsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add-tool"
      element={
        <ProtectedRoute>
          <AddToolPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-tool/:id"
      element={
        <ProtectedRoute>
          <EditToolPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;