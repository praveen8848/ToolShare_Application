import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Alert, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    
    if (result.success) {
      toast.success('Account created! Welcome to the community.');
      setTimeout(() => {
        navigate('/login');
      }, 100);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-content d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      
      {/* Scoped styles for the premium inputs (Consistent with Login) */}
      <style>
        {`
          .auth-card {
            background: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 24px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.03);
            width: 100%;
            max-width: 480px;
            padding: 3rem 2.5rem;
          }
          
          .auth-input-group {
            background-color: #f4f4f5;
            border-radius: 12px;
            border: 1px solid transparent;
            transition: all 0.2s ease;
            overflow: hidden;
          }

          .auth-input-group:focus-within {
            background-color: #ffffff;
            border-color: #09090b;
            box-shadow: 0 0 0 4px rgba(9, 9, 11, 0.05);
          }

          .auth-input {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.85rem 1rem;
            font-size: 0.95rem;
            color: #09090b;
          }
          
          .auth-input::placeholder {
            color: #a1a1aa;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1.25rem;
            color: #a1a1aa;
          }

          .auth-input-group:focus-within .auth-icon-wrapper {
            color: #09090b;
          }
        `}
      </style>

      <Container className="d-flex justify-content-center animate-1">
        <div className="auth-card">
          
          {/* Brand Header */}
          <div className="text-center mb-5">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '64px', height: '64px', background: '#f4f4f5', color: '#09090b' }}
            >
              <FaUserPlus size={28} />
            </div>
            <h3 className="fw-extrabold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Create an account</h3>
            <p className="text-muted-modern small">Join ToolShare to start borrowing and lending.</p>
          </div>
          
          {error && (
            <Alert variant="danger" className="rounded-3 border-0 small bg-danger bg-opacity-10 text-danger fw-medium mb-4">
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold text-dark small mb-2">Full Name</Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="auth-icon-wrapper">
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

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
                />
              </InputGroup>
            </Form.Group>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark small mb-2">Password</Form.Label>
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
              </Col>
              <Col md={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-dark small mb-2">Confirm Password</Form.Label>
                  <InputGroup className="auth-input-group">
                    <InputGroup.Text className="auth-icon-wrapper">
                      <FaLock />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      className="auth-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="btn-primary-modern w-100 py-3 mt-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ fontSize: '1rem' }}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" /> Creating account...</>
              ) : (
                <>Register <FaArrowRight size={14} /></>
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-5">
            <span className="text-muted-modern small">Already have an account? </span>
            <Link to="/login" className="text-decoration-none fw-bold" style={{ color: '#09090b' }}>
              Sign in here
            </Link>
          </div>

        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;