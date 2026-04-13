import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaTools, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login for:', email);

    const result = await login(email, password);
    
    console.log('Login result:', result);

    if (result.success) {
      toast.success('Login successful! Welcome back!');
      // Small delay to ensure state updates
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-content d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Scoped styles for the premium inputs */}
      <style>
        {`
          .auth-card {
            background: #ffffff;
            border: 1px solid rgba(226, 232, 240, 0.8);
            border-radius: 24px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
            width: 100%;
            max-width: 440px;
            padding: 3rem 2.5rem;
          }
          
          .auth-input-group {
            background-color: #f1f5f9;
            border-radius: 12px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            overflow: hidden;
          }

          .auth-input-group:focus-within {
            background-color: #ffffff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          }

          .auth-input {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.85rem 1rem;
            font-size: 0.95rem;
            color: #0f172a;
          }
          
          .auth-input::placeholder {
            color: #94a3b8;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1.25rem;
            color: #94a3b8;
          }

          .auth-input-group:focus-within .auth-icon-wrapper {
            color: #3b82f6;
          }
        `}
      </style>

      <Container className="d-flex justify-content-center animate-1">
        <div className="auth-card">
          
          {/* Brand Header */}
          <div className="text-center mb-5">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', color: '#2563eb' }}
            >
              <FaTools size={28} />
            </div>
            <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Welcome back</h3>
            <p className="text-muted-modern small">Enter your credentials to access your account.</p>
          </div>
          
          {error && (
            <Alert variant="danger" className="rounded-3 border-0 small bg-danger bg-opacity-10 text-danger fw-medium d-flex align-items-center">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark small mb-2">Email address</Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="auth-icon-wrapper">
                  <FaEnvelope />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-semibold text-dark small mb-0">Password</Form.Label>
                {/* Optional: You can add a 'Forgot Password?' link here later */}
              </div>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="auth-icon-wrapper">
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="btn-primary-modern w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ fontSize: '1rem' }}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" /> Signing in...</>
              ) : (
                <>Sign in <FaArrowRight size={14} /></>
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-5">
            <span className="text-muted-modern small">Don't have an account? </span>
            <Link to="/register" className="text-decoration-none fw-bold" style={{ color: '#2563eb' }}>
              Create an account
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default LoginPage;