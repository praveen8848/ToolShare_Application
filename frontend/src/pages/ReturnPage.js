import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaQrcode, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/formatters';

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
      
      // Refresh booking data
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
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Booking not found</Alert>
      </Container>
    );
  }

  if (returnSuccess) {
    return (
      <Container className="py-5">
        <Card className="text-center shadow-sm">
          <Card.Body className="py-5">
            <FaCheckCircle size={60} className="text-success mb-3" />
            <h3>Return Successful!</h3>
            <p className="text-muted">
              {booking.itemName} has been returned successfully.
              <br />
              Your deposit of {formatCurrency(booking.depositAmount)} will be refunded within 3-5 business days.
            </p>
            <Button variant="primary" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button 
        variant="link" 
        className="mb-3 text-decoration-none"
        onClick={() => navigate('/my-bookings')}
      >
        <FaArrowLeft className="me-1" /> Back to My Bookings
      </Button>

      <Row>
        <Col md={6} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Return Item</h4>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h5>{booking.itemName}</h5>
                <p className="text-muted">
                  Booking ID: #{booking.id}<br />
                  Dates: {formatDate(booking.startDate)} - {formatDate(booking.endDate)}<br />
                  Owner: {booking.ownerName}
                </p>
              </div>

              <Alert variant="info" className="mb-4">
                <strong>How to return:</strong>
                <ol className="mb-0 mt-2">
                  <li>Meet with the owner</li>
                  <li>Open the scanner below</li>
                  <li>Scan the owner's QR code</li>
                  <li>Confirm return</li>
                </ol>
              </Alert>

              <Button
                variant="success"
                size="lg"
                className="w-100"
                onClick={() => setShowScanner(true)}
                disabled={returning}
              >
                {returning ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaQrcode className="me-2" />
                    Scan QR Code to Return
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* <QRScannerComponent
        show={showScanner}
        onHide={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
       /> */}
    </Container>
  );
};

export default ReturnPage;