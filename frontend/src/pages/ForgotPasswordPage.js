import React, { useState } from 'react';
import { Container, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle, FaTools } from 'react-icons/fa';
import userService from '../services/userService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await userService.forgotPassword(email);
      setStep(2);
      setSuccess('Reset code sent! Please check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await userService.resetPassword(email, otp, newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <style>{`
        .forgot-wrapper {
          background: #121212;
          min-height: 100vh;
          display: flex;
          align-items: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-top: 76px;
        }

        .auth-card {
          background: #1E1E1E;
          border: 1px solid #2A2A2A;
          border-radius: 14px;
          padding: 2.5rem 2rem;
        }

        .auth-card h4 {
          color: #F5F5F5;
          font-weight: 700;
        }

        .form-control-custom {
          background: #0A0A0A;
          border: 1px solid #2A2A2A;
          color: #E5E5E5;
          border-radius: 10px;
          padding: 0.7rem 1rem 0.7rem 2.5rem;
          font-size: 0.9rem;
        }

        .form-control-custom:focus {
          border-color: #10B981;
          box-shadow: none;
          background: #0A0A0A;
          color: #E5E5E5;
        }

        .form-control-custom::placeholder {
          color: #737373;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 0.9rem;
          transform: translateY(-50%);
          color: #737373;
          z-index: 10;
          font-size: 0.85rem;
        }

        .btn-mint {
          background: #10B981;
          color: #121212;
          border: 1px solid #10B981;
          border-radius: 10px;
          padding: 0.7rem;
          font-weight: 600;
          width: 100%;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .btn-mint:hover:not(:disabled) {
          background: #059669;
          border-color: #059669;
          color: #121212;
        }

        .btn-mint:disabled {
          opacity: 0.6;
        }

        .back-link {
          color: #A3A3A3;
          background: none;
          border: none;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #34D399;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.08) !important;
          border: 1px solid rgba(239, 68, 68, 0.2) !important;
          color: #FCA5A5 !important;
          border-radius: 10px !important;
          font-size: 0.85rem !important;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.08) !important;
          border: 1px solid rgba(16, 185, 129, 0.2) !important;
          color: #34D399 !important;
          border-radius: 10px !important;
          font-size: 0.85rem !important;
        }
      `}</style>

      <Container style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4 d-flex align-items-center justify-content-center">
          <div style={{
            backgroundColor: '#10B981',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'inline-flex',
            marginRight: '12px'
          }}>
            <FaTools style={{ color: '#121212', fontSize: '1.6rem' }} />
          </div>
          <h2 style={{ color: '#F5F5F5', fontWeight: 700, margin: 0 }}>ToolShare</h2>
        </div>

        <div className="auth-card">
          <h4 className="mb-1">
            {step === 1 ? 'Reset Password' : 'Enter Reset Code'}
          </h4>
          <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {step === 1 
              ? "Enter your email and we'll send you a 6-digit code."
              : `We sent a code to ${email}`
            }
          </p>

          {error && (
            <Alert className="alert-error d-flex align-items-center py-2 mb-3">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert className="alert-success d-flex align-items-center py-2 mb-3">
              <FaCheckCircle className="me-2" size={14} />
              {success}
            </Alert>
          )}

          {step === 1 ? (
            <Form onSubmit={handleRequestOtp}>
              <Form.Group className="mb-4 position-relative">
                <FaEnvelope className="input-icon" />
                <Form.Control 
                  type="email" 
                  placeholder="name@example.com"
                  className="form-control-custom"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <button type="submit" className="btn-mint" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Send Reset Code'}
              </button>
            </Form>
          ) : (
            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3 position-relative">
                <FaKey className="input-icon" />
                <Form.Control 
                  type="text" 
                  placeholder="6-Digit OTP"
                  className="form-control-custom"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-4 position-relative">
                <FaLock className="input-icon" />
                <Form.Control 
                  type="password" 
                  placeholder="New Password"
                  className="form-control-custom"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>
              
              <button type="submit" className="btn-mint" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : 'Set New Password'}
              </button>
            </Form>
          )}

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #2A2A2A' }}>
            <button className="back-link" onClick={() => navigate('/login')}>
              <FaArrowLeft size={12} /> Back to Login
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;