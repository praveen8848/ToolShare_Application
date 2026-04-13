import React, { useEffect, useState } from 'react';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaEnvelopeOpenText } from 'react-icons/fa';
import axios from 'axios'; // Make sure you have axios installed: npm install axios

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Extract the token from the URL (e.g., ?token=12345)
  const token = searchParams.get('token');
  
  // State to track the verification process
  const [status, setStatus] = useState('verifying'); // Options: 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // If someone visits the page without a token, show an error immediately
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided in the URL.');
      return;
    }

    const verifyToken = async () => {
  try {
    // 1. Create a completely isolated instance
    const cleanAxios = axios.create(); 

    // 2. Point to the Gateway (8080)
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    // 3. Send the request without any global interceptors interfering
    await cleanAxios.post(`${baseUrl}/api/users/verify-email`, null, {
      params: { token: token }
      // We don't define headers here, so it sends NONE.
    });
    
    setStatus('success');
  } catch (error) {
    console.error("Verification Error:", error);
    setStatus('error');
    setErrorMessage(error.response?.data?.error || 'Invalid or expired token');
  }
};

    verifyToken();
  }, [token]);

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow-lg border-0 text-center p-5" style={{ maxWidth: '550px', width: '100%', borderRadius: '15px' }}>
        <Card.Body>
          
          {/* STATE 1: LOADING */}
          {status === 'verifying' && (
            <div className="py-4">
              <Spinner animation="border" variant="primary" style={{ width: '4rem', height: '4rem', borderWidth: '0.25em' }} />
              <h3 className="mt-4 fw-bold">Verifying your email...</h3>
              <p className="text-muted mt-2">Please wait a moment while we securely verify your account.</p>
            </div>
          )}

          {/* STATE 2: SUCCESS */}
          {status === 'success' && (
            <div className="py-2">
              <FaCheckCircle className="text-success mb-3" size={80} />
              <h2 className="fw-bold mt-2">Email Verified!</h2>
              <p className="text-muted mt-3 fs-5">
                Thank you for verifying your email address. Your ToolShare account is now fully active.
              </p>
              <div className="mt-4 pt-2">
                <Button variant="primary" size="lg" className="px-5 rounded-pill shadow-sm" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: ERROR */}
          {status === 'error' && (
            <div className="py-2">
              <FaTimesCircle className="text-danger mb-3" size={80} />
              <h2 className="fw-bold mt-2">Verification Failed</h2>
              <p className="text-muted mt-3 fs-5">
                {errorMessage}
              </p>
              <div className="mt-4 pt-2 d-flex flex-column gap-3 align-items-center">
                <Link to="/profile" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button variant="outline-primary" size="lg" className="w-75 rounded-pill d-flex align-items-center justify-content-center mx-auto">
                    <FaEnvelopeOpenText className="me-2" /> Request New Link
                  </Button>
                </Link>
                <Button variant="link" className="text-muted" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </div>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifyEmailPage;