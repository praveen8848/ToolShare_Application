import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaArrowRight, FaPhoneAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavigationBar from '../components/common/Navbar';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Full name is required');
    if (!email.trim()) return setError('Email address is required');
    if (!phone.trim()) return setError('Phone number is required');
    if (phone.length !== 10) return setError('Please enter a valid 10-digit mobile number');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    const result = await register(name, email, password, phone);
    
    if (result.success) {
      toast.success('🎉 Welcome to ToolShare! Your account has been created.');
      setTimeout(() => navigate('/login'), 100);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="register-wrapper">
      
      {/* Dark Theme Styles */}
      <style>
        {`
          .register-wrapper {
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
            max-width: 520px;
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
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: #e2e8f0 !important;
          }
          
          .auth-input::placeholder {
            color: #64748b;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1rem;
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
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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
          
          .alert-error {
            background-color: rgba(239, 68, 68, 0.1) !important;
            color: #fca5a5 !important;
            border: 1px solid rgba(239, 68, 68, 0.3) !important;
            border-radius: 12px !important;
          }
          
          .benefits-section {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
          }
          
          .benefit-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #cbd5e1;
            font-size: 0.85rem;
            padding: 0.35rem 0;
          }
          
          .benefit-item svg {
            color: #34d399;
            font-size: 14px;
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
              <FaUserPlus size={24} color="white" />
            </div>
            <h3 className="fw-bold mb-2" style={{ 
              background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '1.8rem'
            }}>
              Join ToolShare
            </h3>
            <p className="text-muted-custom small mb-0">Start borrowing and lending tools in your community</p>
          </div>
          
          {error && (
            <Alert className="alert-error small d-flex align-items-center py-2 mb-4">
              <span>⚠️ {error}</span>
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small mb-2" style={{ color: '#cbd5e1' }}>
                Full Name
              </Form.Label>
              <InputGroup className="auth-input-group">
                <InputGroup.Text className="auth-icon-wrapper">
                  <FaUser />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  className="auth-input"
                  placeholder="Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
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
                  placeholder="rajesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Row className="g-2">
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small mb-2" style={{ color: '#cbd5e1' }}>
                    Password
                  </Form.Label>
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
              <Col sm={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small mb-2" style={{ color: '#cbd5e1' }}>
                    Confirm Password
                  </Form.Label>
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

            {/* Benefits Section */}
            <div className="benefits-section">
              <div className="benefit-item">
                <FaUserPlus size={12} />
                <span>Access tools across India</span>
              </div>
              <div className="benefit-item">
                <FaUserPlus size={12} />
                <span>Earn by sharing your idle tools</span>
              </div>
              <div className="benefit-item">
                <FaUserPlus size={12} />
                <span> Save capital by using tools from verified community</span>
              </div>
            </div>

            <Button
              type="submit"
              className="btn-auth-primary w-100 d-flex align-items-center justify-content-center gap-2"
              disabled={loading}
              style={{ fontSize: '1rem' }}
            >
              {loading ? (
                <><Spinner animation="border" size="sm" /> Creating Account...</>
              ) : (
                <>Create Free Account <FaArrowRight size={14} /></>
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-4">
            <span className="text-muted-custom small">Already a member? </span>
            <Link to="/login" className="link-gradient">
              Sign In
            </Link>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;