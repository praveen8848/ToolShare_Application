import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaArrowRight, FaKey, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import NavigationBar from '../components/common/Navbar';
import api from '../config/axiosConfig';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Full name is required');
    if (!email.trim()) return setError('Email address is required');
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    
    const result = await register(name, email, password, phone);
    
    if (result.success) {
      toast.success('Account created! Please check your email for the verification code.');
      setStep(2);
    } else {
      setError(result.message);
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/api/users/verify-email', { email, otp });
      
      setSuccess('Email verified successfully! Redirecting to login...');
      toast.success('🎉 Welcome to ToolShare! Your account is ready.');
      
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      
      {/* ── Graphite + Mint Theme Styles ── */}
      <style>
        {`
          .register-wrapper {
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
            --auth-success-bg: rgba(16, 185, 129, 0.1);
            --auth-success-border: rgba(16, 185, 129, 0.3);
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
            max-width: 520px;
            padding: 2.5rem 2rem;
            animation: slideUp 0.5s ease-out;
            margin: 0 auto;
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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
            padding: 0.75rem 1rem;
            font-size: 0.95rem;
            color: var(--auth-text) !important;
          }
          
          .auth-input::placeholder { color: var(--auth-text-dim); }

          .auth-input:-webkit-autofill,
          .auth-input:-webkit-autofill:hover,
          .auth-input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 30px var(--auth-input-bg) inset !important;
            -webkit-text-fill-color: var(--auth-text) !important;
          }

          .auth-icon-wrapper {
            background-color: transparent;
            border: none;
            padding-left: 1rem;
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
          
          .text-muted-custom { color: var(--auth-text-muted); }
          
          .brand-icon-wrapper {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            border: 1px solid var(--auth-border);
          }

          .icon-mint {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
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
            cursor: pointer;
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

          .alert-success-custom {
            background-color: var(--auth-success-bg) !important;
            color: var(--auth-accent-bright) !important;
            border: 1px solid var(--auth-success-border) !important;
            border-radius: 12px !important;
          }
          
          .benefits-section {
            background: var(--auth-input-bg);
            border: 1px solid var(--auth-border);
            border-radius: 14px;
            padding: 1rem 1.25rem;
            margin-bottom: 1.5rem;
          }
          
          .benefit-item {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--auth-text-muted);
            font-size: 0.85rem;
            padding: 0.35rem 0;
          }
          
          .benefit-item svg {
            color: var(--auth-accent-bright);
            font-size: 14px;
            flex-shrink: 0;
          }

          .heading-gradient {
            background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.8rem;
          }

          @media (max-width: 576px) {
            .auth-card {
              padding: 1.5rem 1.25rem;
            }
          }
        `}
      </style>

      <NavigationBar />

      <div className="auth-container">
        <div className="auth-card">
          
          {error && (
            <Alert className="alert-error small d-flex align-items-center py-2 mb-4">
              <span>⚠️ {error}</span>
            </Alert>
          )}

          {success && (
            <Alert className="alert-success-custom small d-flex align-items-center py-2 mb-4">
              <FaCheckCircle className="me-2" />
              <span>{success}</span>
            </Alert>
          )}

          {step === 1 ? (
            <>
              <div className="text-center mb-4">
                <div className="brand-icon-wrapper icon-mint mb-3">
                  <FaUserPlus size={24} color="#121212" />
                </div>
                <h3 className="fw-bold mb-2 heading-gradient">
                  Join ToolShare
                </h3>
                <p className="text-muted-custom small mb-0">Start borrowing and lending tools in your community</p>
              </div>
              
              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>Full Name</Form.Label>
                  <InputGroup className="auth-input-group">
                    <InputGroup.Text className="auth-icon-wrapper"><FaUser /></InputGroup.Text>
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
                  <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>Email Address</Form.Label>
                  <InputGroup className="auth-input-group">
                    <InputGroup.Text className="auth-icon-wrapper"><FaEnvelope /></InputGroup.Text>
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
                      <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>Password</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text className="auth-icon-wrapper"><FaLock /></InputGroup.Text>
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
                      <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>Confirm</Form.Label>
                      <InputGroup className="auth-input-group">
                        <InputGroup.Text className="auth-icon-wrapper"><FaLock /></InputGroup.Text>
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

                <div className="benefits-section">
                  <div className="benefit-item">
                    <FaCheckCircle size={12} />
                    <span>Access tools across India</span>
                  </div>
                  <div className="benefit-item">
                    <FaCheckCircle size={12} />
                    <span>Earn by sharing your idle tools</span>
                  </div>
                  <div className="benefit-item">
                    <FaCheckCircle size={12} />
                    <span>Save capital by using verified community tools</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="btn-auth-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
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
                <Link to="/login" className="link-gradient">Sign In</Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <div className="brand-icon-wrapper icon-mint mb-3">
                  <FaEnvelope size={24} color="#121212" />
                </div>
                <h3 className="fw-bold mb-2 heading-gradient">
                  Verify Your Email
                </h3>
                <p className="text-muted-custom small mb-0">
                  We've sent a 6-digit verification code to <br/>
                  <strong style={{ color: 'var(--auth-white)' }}>{email}</strong>
                </p>
              </div>

              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold small mb-2" style={{ color: 'var(--auth-text)' }}>Verification Code</Form.Label>
                  <InputGroup className="auth-input-group">
                    <InputGroup.Text className="auth-icon-wrapper"><FaKey /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      className="auth-input"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  className="btn-auth-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><Spinner animation="border" size="sm" /> Verifying...</>
                  ) : (
                    <>Verify & Login <FaCheckCircle size={14} /></>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <span className="text-muted-custom small">Didn't receive the code? </span>
                <span className="utility-link">Check Spam Folder</span>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;