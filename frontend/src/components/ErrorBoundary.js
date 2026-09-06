import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '100vh', color: '#E5E5E5' }}>
          <FaExclamationTriangle size={48} color="#EF4444" className="mb-4" />
          <h2 className="mb-3">Something went wrong</h2>
          <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
            We're sorry, an unexpected error occurred. Please try refreshing the page or navigating back to safety.
          </p>
          <Button 
            variant="success" 
            onClick={() => window.location.href = '/'}
            style={{ background: '#10B981', border: 'none', color: '#121212', fontWeight: 600 }}
          >
            Return to Home
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
