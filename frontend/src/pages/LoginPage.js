import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaTools, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavigationBar from '../components/common/Navbar';

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

    const result = await login(email, password);

    if (result.success) {
      toast.success('Login successful! Welcome back to ToolShare.');
      setTimeout(() => navigate('/dashboard'), 100);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      
      {/* Dark Theme Styles */}
      <style>
        {`
          .login-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-top: 76px; /* Fixed: Prevent navbar overlap */
          }
          
          .auth-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 76px);
            padding: 1.5rem 1rem;
          }
          
          .auth-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1);
            width: 100%;
            max-width: 440px;
            padding: 2.5rem 2rem;
            animation: slideUp 0.5s ease-out;
            margin: 0 auto;
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .auth-input-group {
            background-color: #0f172a;
            border-radius: 12px;
            border: 1px solid #334155;
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .auth-input-group:focus-within {
            border-color: #60a5fa;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
          }

          .auth-input {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.85rem 1rem;
            font-size: 0.95rem;
            color: #e2e8f0 !important;
          }
          
          .auth-input::placeholder {
            color: #64748b;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1.25rem;
            color: #64748b;
            transition: color 0.3s ease;
          }

          .auth-input-group:focus-within .auth-icon-wrapper {
            color: #60a5fa;
          }

          .btn-auth-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .btn-auth-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-auth-primary:disabled {
            opacity: 0.7;
            transform: none;
          }
          
          .text-muted-custom { 
            color: #94a3b8; 
          }
          
          .brand-icon-wrapper {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            border: 1px solid #334155;
          }
          
          .link-gradient {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            text-decoration: none;
          }
          
          .link-gradient:hover {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .utility-link {
            color: #60a5fa;
            text-decoration: none;
            transition: color 0.2s ease;
          }
          .utility-link:hover {
            color: #93c5fd;
            text-decoration: underline;
          }
          
          .alert-error {
            background-color: rgba(239, 68, 68, 0.1) !important;
            color: #fca5a5 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            border-radius: 12px !important;
          }
        `}
      </style>

      {/* Navigation Bar */}
      <NavigationBar />

      <div className="auth-container">
        <div className="auth-card">
          
          {/* Brand Header */}
          <div className="text-center mb-4">
            <div className="brand-icon-wrapper mb-3">
              <FaTools size={28} color="white" />
            </div>
            <h3 className="fw-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.8rem'
            }}>
              Welcome Back
            </h3>
            <p className="text-muted-custom small mb-0">Sign in to access your ToolShare account</p>
          </div>
          
          {error && (
            <Alert className="alert-error small d-flex align-items-center py-2 mb-4">
              <span>⚠️ {error}</span>
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold small mb-2" style={{ color: '#cbd5e1' }}>
                Email Address
              </Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="auth-icon-wrapper">
                  <FaEnvelope />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  className="auth-input"
                  placeholder="pankaj@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              {/* ADDED: Flex container to push "Forgot Password" to the right */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-semibold small mb-0" style={{ color: '#cbd5e1' }}>
                  Password
                </Form.Label>
                <Link to="/forgot-password" className="utility-link small fw-medium">
                  Forgot Password?
                </Link>
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
              type="submit"
              className="btn-auth-primary w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ fontSize: '1rem' }}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" /> Signing in...</>
              ) : (
                <>Sign In <FaArrowRight size={14} /></>
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <span className="text-muted-custom small">New to ToolShare? </span>
            <Link to="/register" className="link-gradient">
              Create Free Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;