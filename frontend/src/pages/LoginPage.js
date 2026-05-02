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
      
      {/* ── Graphite + Mint Theme Styles ── */}
      <style>
        {`
          .login-wrapper {
            --auth-bg: #121212;
            --auth-surface: #1E1E1E;
            --auth-surface-hover: #2A2A2A;
            --auth-accent: #10b981;
            --auth-accent-bright: #34d399;
            --auth-accent-10: rgba(16, 185, 129, 0.1);
            --auth-accent-15: rgba(16, 185, 129, 0.15);
            --auth-accent-30: rgba(16, 185, 129, 0.3);
            --auth-text: #E5E5E5;
            --auth-text-muted: #A3A3A3;
            --auth-text-dim: #737373;
            --auth-border: #2A2A2A;
            --auth-white: #F5F5F5;
            --auth-danger: #ef4444;
            --auth-danger-bg: rgba(239, 68, 68, 0.1);
            --auth-danger-border: rgba(239, 68, 68, 0.3);
            --auth-input-bg: #0A0A0A;
            
            background: var(--auth-bg);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: var(--auth-text);
            padding-top: 76px;
          }
          
          .auth-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 76px);
            padding: 1.5rem 1rem;
          }
          
          .auth-card {
            background: var(--auth-surface);
            border: 1px solid var(--auth-border);
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.08);
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
            background-color: var(--auth-input-bg);
            border-radius: 12px;
            border: 1px solid var(--auth-border);
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .auth-input-group:focus-within {
            border-color: var(--auth-accent);
            box-shadow: 0 0 0 4px var(--auth-accent-10);
          }

          .auth-input {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0.85rem 1rem;
            font-size: 0.95rem;
            color: var(--auth-text) !important;
          }
          
          .auth-input::placeholder {
            color: var(--auth-text-dim);
          }

          .auth-input:-webkit-autofill,
          .auth-input:-webkit-autofill:hover,
          .auth-input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 30px var(--auth-input-bg) inset !important;
            -webkit-text-fill-color: var(--auth-text) !important;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1.25rem;
            color: var(--auth-text-dim);
            transition: color 0.3s ease;
          }

          .auth-input-group:focus-within .auth-icon-wrapper {
            color: var(--auth-accent);
          }

          .btn-auth-primary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #121212;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.9rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
          }

          .btn-auth-primary:hover {
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(16, 185, 129, 0.45);
            color: #121212;
          }
          
          .btn-auth-primary:active {
            transform: scale(0.98) translateY(0);
          }
          
          .btn-auth-primary:disabled {
            opacity: 0.7;
            transform: none;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
          }
          
          .text-muted-custom { 
            color: var(--auth-text-muted); 
          }
          
          .brand-icon-wrapper {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            border: 1px solid var(--auth-border);
          }
          
          .link-gradient {
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            text-decoration: none;
          }
          
          .link-gradient:hover {
            background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .utility-link {
            color: var(--auth-accent-bright);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          .utility-link:hover {
            color: #6ee7b7;
            text-decoration: underline;
          }
          
          .alert-error {
            background-color: var(--auth-danger-bg) !important;
            color: #fca5a5 !important;
            border: 1px solid var(--auth-danger-border) !important;
            border-radius: 12px !important;
          }

          .heading-gradient {
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.8rem;
          }
        `}
      </style>

      <NavigationBar />

      <div className="auth-container">
        <div className="auth-card">
          
          <div className="text-center mb-4">
            <div className="brand-icon-wrapper mb-3">
              <FaTools size={28} color="#121212" />
            </div>
            <h3 className="fw-bold mb-2 heading-gradient">
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
              <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-semibold small mb-0" style={{ color: 'var(--auth-text)' }}>
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