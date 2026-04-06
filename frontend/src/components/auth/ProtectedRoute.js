import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // TEMPORARY: Set to true to bypass login while backend is down
  // Set back to false when backend is restored
  const BYPASS_AUTH = false;

  if (loading && !BYPASS_AUTH) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // If bypass is enabled, always allow access to all protected routes
  if (BYPASS_AUTH) {
    return children;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;