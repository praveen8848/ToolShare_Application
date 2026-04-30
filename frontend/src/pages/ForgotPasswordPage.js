import React, { useState } from 'react';
import { Container, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import userService from '../services/userService'; // Using your updated service!

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP & New Password
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Request the OTP
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

  // Step 2: Verify OTP and Reset
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
    <div className="auth-wrapper">
      <style>{`
        .auth-wrapper {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          font-family: 'Inter', sans-serif;
        }
        .auth-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 24px;
          padding: 3rem 2rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
        }
        .form-control-custom {
          background: #0f172a;
          border: 1px solid #334155;
          color: #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
        }
        .form-control-custom:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          background: #0f172a;
          color: white;
        }
        .input-icon {
          position: absolute;
          top: 50%;
          left: 1rem;
          transform: translateY(-50%);
          color: #64748b;
          z-index: 10;
        }
        .btn-primary-custom {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          border: none;
          border-radius: 12px;
          padding: 0.8rem;
          font-weight: 600;
          width: 100%;
          color: white;
          transition: all 0.3s ease;
        }
        .btn-primary-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        .back-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s ease;
          cursor: pointer;
        }
        .back-link:hover {
          color: #60a5fa;
        }
      `}</style>

      <Container className="max-w-md" style={{ maxWidth: '450px' }}>
        <div className="mb-4 text-center">
          <h2 className="fw-bolder text-white">ToolShare</h2>
        </div>

        <Card className="auth-card">
          <h4 className="text-white fw-bold mb-2">
            {step === 1 ? 'Reset Password' : 'Enter Reset Code'}
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {step === 1 
              ? "Enter your email and we'll send you a 6-digit code to reset your password."
              : `We sent a code to ${email}`
            }
          </p>

          {error && <Alert variant="danger" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#f87171' }}>{error}</Alert>}
          {success && <Alert variant="success" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#34d399' }}><FaCheckCircle className="me-2"/>{success}</Alert>}

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
              <button type="submit" className="btn-primary-custom" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Send Reset Code'}
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
              
              <button type="submit" className="btn-primary-custom" disabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Set New Password'}
              </button>
            </Form>
          )}

          <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid #334155' }}>
            <span className="back-link" onClick={() => navigate('/login')}>
              <FaArrowLeft /> Back to Login
            </span>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;