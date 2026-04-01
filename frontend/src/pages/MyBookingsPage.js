import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, FaQrcode } from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QRCodeDisplay from '../components/bookings/QRCodeDisplay';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  // Get all functions from useBookings hook
  const { bookings, loading, error, cancelBooking, requestReturn, confirmReturn, refreshBookings } = useBookings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': 'warning',
      'CONFIRMED': 'success',
      'REJECTED': 'danger',
      'CANCELLED': 'secondary',
      'RETURN_REQUESTED': 'info',
      'COMPLETED': 'success',
    };
    const icons = {
      'PENDING': <FaClock className="me-1" />,
      'CONFIRMED': <FaCheckCircle className="me-1" />,
      'REJECTED': <FaTimesCircle className="me-1" />,
      'CANCELLED': <FaTimesCircle className="me-1" />,
      'RETURN_REQUESTED': <FaClock className="me-1" />,
      'COMPLETED': <FaCheckCircle className="me-1" />,
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="px-3 py-2">
        {icons[status]} {status}
      </Badge>
    );
  };

  // Determine if current user is the borrower or owner
  const isBorrower = (booking) => booking.borrowerId === user?.id;
  const isOwner = (booking) => booking.ownerId === user?.id;

  // Borrower requests return - using hook function
  const handleRequestReturn = async (bookingId) => {
    setProcessing(bookingId);
    const success = await requestReturn(bookingId);
    if (success) {
      refreshBookings();
    }
    setProcessing(null);
  };

  // Owner confirms return - using hook function
  const handleConfirmReturn = async (bookingId) => {
    setProcessing(bookingId);
    const success = await confirmReturn(bookingId);
    if (success) {
      refreshBookings();
    }
    setProcessing(null);
  };

  const getActionButton = (booking) => {
    // BORROWER ACTIONS
    if (isBorrower(booking)) {
      // Confirmed booking - can request return
      if (booking.status === 'CONFIRMED') {
        return (
          <div className="d-flex gap-2">
            <Button 
              variant="outline-warning" 
              size="sm"
              className="flex-grow-1"
              onClick={() => handleRequestReturn(booking.id)}
              disabled={processing === booking.id}
            >
              {processing === booking.id ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <><FaQrcode className="me-1" /> Request Return</>
              )}
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
              Show QR
            </Button>
          </div>
        );
      }
      
      // Return requested - waiting for owner
      if (booking.status === 'RETURN_REQUESTED') {
        return (
          <Alert variant="info" className="mb-0 text-center py-2">
            <FaClock className="me-1" />
            Return requested. Waiting for owner confirmation.
          </Alert>
        );
      }
      
      // Pending booking - can cancel
      if (booking.status === 'PENDING') {
        return (
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => cancelBooking(booking.id)}
            className="w-100"
            disabled={processing === booking.id}
          >
            {processing === booking.id ? <Spinner animation="border" size="sm" /> : 'Cancel Request'}
          </Button>
        );
      }
    }
    
    // OWNER ACTIONS
    if (isOwner(booking)) {
      // Return requested by borrower - owner can confirm
      if (booking.status === 'RETURN_REQUESTED') {
        return (
          <Button 
            variant="success" 
            size="sm"
            className="w-100"
            onClick={() => handleConfirmReturn(booking.id)}
            disabled={processing === booking.id}
          >
            {processing === booking.id ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <><FaCheckCircle className="me-1" /> Confirm Return</>
            )}
          </Button>
        );
      }
      
      // Confirmed booking - show QR for owner to scan (if needed)
      if (booking.status === 'CONFIRMED') {
        return (
          <Button 
            variant="outline-info" 
            size="sm"
            className="w-100"
            onClick={() => navigate(`/owner-return/${booking.id}`)}
          >
            <FaQrcode className="me-1" />
            View Return Details
          </Button>
        );
      }
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
                      <small>
                        {isBorrower(booking) ? `Owner: ${booking.ownerName}` : `Borrower: ${booking.borrowerName}`}
                      </small>
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

      {/* QR Code Display Modal - For Borrower to show QR */}
      <QRCodeDisplay
        show={showQRCode}
        onHide={() => setShowQRCode(false)}
        booking={selectedBooking}
      />
    </>
  );
};

export default MyBookingsPage;