import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...', size = 'border', variant = 'primary' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '200px' }}>
      <Spinner animation={size} variant={variant} style={{ color: '#34D399' }} />
      {message && <p className="mt-3" style={{ color: '#9CA3AF' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
