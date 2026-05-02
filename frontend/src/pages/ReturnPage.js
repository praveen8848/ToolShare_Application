import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/formatters';

const ReturnPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err) {
        toast.error('Failed to load booking details');
        navigate('/my-bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  const handleScanSuccess = async (bookingId, qrData) => {
    if (bookingId.toString() !== id) {
      toast.error('This QR code is for a different booking');
      setShowScanner(false);
      return;
    }
    setReturning(true);
    try {
      await bookingService.returnItem(bookingId);
      setReturnSuccess(true);
      toast.success('Item returned successfully! Deposit will be refunded.');
      const updatedBooking = await bookingService.getBookingById(bookingId);
      setBooking(updatedBooking);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return item');
    } finally {
      setReturning(false);
      setShowScanner(false);
    }
  };

  if (loading) {
    return (
      <div className="return-wrapper">
        <style>{`.return-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399' }} />
          <p style={{ color: '#A3A3A3', marginTop: '1rem' }}>Loading booking details...</p>
        </Container>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="return-wrapper">
        <style>{`.return-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5">
          <Alert style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: '10px' }}>
            Booking not found
          </Alert>
        </Container>
      </div>
    );
  }

  if (returnSuccess) {
    return (
      <div className="return-wrapper">
        <style>{`.return-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5">
          <div style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: '14px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <FaCheckCircle size={48} style={{ color: '#34D399', marginBottom: '1rem' }} />
            <h3 style={{ color: '#F5F5F5', fontWeight: 700, marginBottom: '0.75rem' }}>Return Successful!</h3>
            <p style={{ color: '#A3A3A3', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {booking.itemName} has been returned successfully.<br />
              Your deposit of ₹{booking.depositAmount?.toLocaleString('en-IN') || '0'} will be refunded within 3-5 business days.
            </p>
            <Button style={{ background: '#10B981', color: '#121212', border: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600 }} onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="return-wrapper">
      <style>
        {`
          .return-wrapper {
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-top: 76px;
          }
          
          .back-btn {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            padding: 0.4rem 0.9rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            cursor: pointer;
            margin-bottom: 1.5rem;
            transition: all 0.2s;
          }
          
          .back-btn:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .return-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
            max-width: 500px;
            margin: 0 auto;
          }
          
          .card-header-custom {
            padding: 1.25rem;
            border-bottom: 1px solid #2A2A2A;
          }
          
          .card-header-custom h4 { color: #F5F5F5; font-weight: 600; margin: 0; font-size: 1.1rem; }
          
          .card-body-custom { padding: 1.5rem; }
          
          .booking-info h5 { color: #F5F5F5; font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem; }
          
          .info-row { color: #A3A3A3; font-size: 0.85rem; margin-bottom: 0.25rem; }
          
          .alert-mint {
            background: rgba(16,185,129,0.06);
            border: 1px solid rgba(16,185,129,0.15);
            border-radius: 10px;
            padding: 1rem;
            color: #34D399;
            margin-bottom: 1.5rem;
          }
          
          .alert-mint strong { color: #34D399; }
          .alert-mint ol { padding-left: 1.25rem; }
          .alert-mint li { margin-bottom: 0.25rem; font-size: 0.85rem; }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            font-size: 1rem;
            width: 100%;
            transition: all 0.2s;
          }
          
          .btn-mint:hover:not(:disabled) { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { opacity: 0.5; }
        `}
      </style>

      <Container className="py-4">
        <button className="back-btn" onClick={() => navigate('/my-bookings')}>
          <FaArrowLeft size={14} /> Back to My Bookings
        </button>

        <Row>
          <Col md={8} lg={6} className="mx-auto">
            <div className="return-card">
              <div className="card-header-custom">
                <h4>Return Item</h4>
              </div>
              <div className="card-body-custom">
                <div className="booking-info mb-4">
                  <h5>{booking.itemName}</h5>
                  <div className="info-row">Booking ID: #{booking.id}</div>
                  <div className="info-row">Dates: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}</div>
                  <div className="info-row">Owner: {booking.ownerName}</div>
                </div>

                <div className="alert-mint">
                  <strong>How to return:</strong>
                  <ol className="mb-0 mt-2">
                    <li>Meet with the owner</li>
                    <li>Open the scanner below</li>
                    <li>Scan the owner's QR code</li>
                    <li>Confirm return</li>
                  </ol>
                </div>

                <Button className="btn-mint" onClick={() => setShowScanner(true)} disabled={returning}>
                  {returning ? (
                    <><Spinner animation="border" size="sm" className="me-2" /> Processing...</>
                  ) : (
                    <><FaQrcode className="me-2" size={16} /> Scan QR Code to Return</>
                  )}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReturnPage;