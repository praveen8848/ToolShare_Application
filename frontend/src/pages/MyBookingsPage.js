import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, FaQrcode } from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../components/bookings/QRCodeDisplay';

const MyBookingsPage = () => {
  const { bookings, loading, error, cancelBooking, returnItem } = useBookings();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'CONFIRMED': 'success',
      'REJECTED': 'danger',
      'CANCELLED': 'secondary',
      'COMPLETED': 'info',
    };
    const icons = {
      'PENDING': <FaClock className="me-1" />,
      'CONFIRMED': <FaCheckCircle className="me-1" />,
      'REJECTED': <FaTimesCircle className="me-1" />,
      'CANCELLED': <FaTimesCircle className="me-1" />,
      'COMPLETED': <FaCheckCircle className="me-1" />,
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="px-3 py-2">
        {icons[status]} {status}
      </Badge>
    );
  };

  const getActionButton = (booking) => {
    if (booking.status === 'CONFIRMED') {
      return (
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success" 
            size="sm"
            onClick={() => navigate(`/return/${booking.id}`)}
            className="flex-grow-1"
          >
            <FaQrcode className="me-1" />
            Return
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => {
              setSelectedBooking(booking);
              setShowQRCode(true);
            }}
          >
            <FaQrcode className="me-1" />
            QR
          </Button>
        </div>
      );
    }
    if (booking.status === 'PENDING') {
      return (
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => cancelBooking(booking.id)}
          className="w-100"
        >
          Cancel Request
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your bookings...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Bookings</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Card className="shadow-sm">
          <Card.Body className="py-5">
            <FaCalendarAlt size={50} className="text-muted mb-3" />
            <h4>No Bookings Yet</h4>
            <p className="text-muted">You haven't made any bookings yet.</p>
            <Button variant="primary" onClick={() => navigate('/browse')}>
              Browse Tools
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-4">
        <h2 className="mb-4">My Bookings</h2>
        
        <Row>
          {bookings.map((booking) => (
            <Col key={booking.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">{booking.itemName}</h5>
                    {getStatusBadge(booking.status)}
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-muted me-2" />
                      <small>
                        {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                      </small>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-muted me-2" />
                      <small>Owner: {booking.ownerName}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaTools className="text-muted me-2" />
                      <small>Tool ID: #{booking.itemId}</small>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Amount:</span>
                    <strong>{formatCurrency(booking.totalAmount)}</strong>
                  </div>
                  {booking.depositAmount && (
                    <div className="d-flex justify-content-between mb-3">
                      <span>Deposit:</span>
                      <span>{formatCurrency(booking.depositAmount)}</span>
                    </div>
                  )}
                  
                  {getActionButton(booking)}
                </Card.Body>
                <Card.Footer className="bg-white text-muted small">
                  Booked on {formatDate(booking.createdAt)}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* QR Code Display Modal */}
      <QRCodeDisplay
        show={showQRCode}
        onHide={() => setShowQRCode(false)}
        booking={selectedBooking}
      />
    </>
  );
};

export default MyBookingsPage;