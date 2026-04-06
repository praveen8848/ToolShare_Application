import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, FaQrcode, FaTrash, FaEye } from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../components/bookings/QRCodeDisplay';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';

const MyBookingsPage = () => {
  const { bookings, loading, error, cancelBooking, refreshBookings } = useBookings();
  const navigate = useNavigate();
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Filter bookings by status
  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');
  const rejectedBookings = bookings.filter(b => b.status === 'REJECTED');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');

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
    const labels = {
      'PENDING': 'Pending Approval',
      'CONFIRMED': 'Confirmed',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed',
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="px-3 py-2">
        {icons[status]} {labels[status] || status}
      </Badge>
    );
  };

  const handleCancelBooking = async (bookingId) => {
    setProcessing(bookingId);
    const success = await cancelBooking(bookingId);
    if (success) {
      refreshBookings();
    }
    setProcessing(null);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    
    setProcessing(bookingToDelete.id);
    try {
      // Call delete API (you'll need to add this to bookingService)
      await bookingService.deleteBooking(bookingToDelete.id);
      toast.success('Booking deleted successfully');
      refreshBookings();
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    } finally {
      setProcessing(null);
    }
  };

  const canDelete = (booking) => {
    return booking.status === 'REJECTED' || booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
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
          onClick={() => handleCancelBooking(booking.id)}
          disabled={processing === booking.id}
          className="w-100"
        >
          {processing === booking.id ? <Spinner animation="border" size="sm" /> : 'Cancel Request'}
        </Button>
      );
    }
    return null;
  };

  const renderBookingCard = (booking) => (
    <Col key={booking.id} md={6} lg={4} className="mb-4">
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="mb-0">{booking.itemName || 'Unknown Tool'}</h5>
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
              <small>Owner: {booking.ownerName || 'Unknown'}</small>
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
          {booking.depositAmount > 0 && (
            <div className="d-flex justify-content-between mb-3">
              <span>Deposit:</span>
              <span>{formatCurrency(booking.depositAmount)}</span>
            </div>
          )}
          
          {getActionButton(booking)}
          
          {canDelete(booking) && (
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="w-100 mt-2"
              onClick={() => {
                setBookingToDelete(booking);
                setShowDeleteModal(true);
              }}
            >
              <FaTrash className="me-1" />
              Delete Booking
            </Button>
          )}
        </Card.Body>
        <Card.Footer className="bg-white text-muted small">
          Booked on {formatDate(booking.createdAt)}
        </Card.Footer>
      </Card>
    </Col>
  );

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

  const hasAnyBookings = bookings && bookings.length > 0;

  return (
    <>
      <Container className="py-4">
        <h2 className="mb-4">My Bookings</h2>
        
        {!hasAnyBookings ? (
          <Card className="text-center py-5">
            <Card.Body>
              <FaCalendarAlt size={50} className="text-muted mb-3" />
              <h4>No Bookings Yet</h4>
              <p className="text-muted">You haven't made any bookings yet.</p>
              <Button variant="primary" onClick={() => navigate('/browse')}>
                Browse Tools
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Tabs defaultActiveKey="pending" className="mb-4">
            <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
              {pendingBookings.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaClock size={40} className="text-muted mb-2" />
                    <p className="text-muted">No pending bookings</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row>{pendingBookings.map(renderBookingCard)}</Row>
              )}
            </Tab>

            <Tab eventKey="confirmed" title={`Confirmed (${confirmedBookings.length})`}>
              {confirmedBookings.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaCheckCircle size={40} className="text-muted mb-2" />
                    <p className="text-muted">No confirmed bookings</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row>{confirmedBookings.map(renderBookingCard)}</Row>
              )}
            </Tab>

            <Tab eventKey="rejected" title={`Rejected (${rejectedBookings.length})`}>
              {rejectedBookings.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaTimesCircle size={40} className="text-muted mb-2" />
                    <p className="text-muted">No rejected bookings</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row>{rejectedBookings.map(renderBookingCard)}</Row>
              )}
            </Tab>

            <Tab eventKey="cancelled" title={`Cancelled (${cancelledBookings.length})`}>
              {cancelledBookings.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaTimesCircle size={40} className="text-muted mb-2" />
                    <p className="text-muted">No cancelled bookings</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row>{cancelledBookings.map(renderBookingCard)}</Row>
              )}
            </Tab>

            <Tab eventKey="completed" title={`Completed (${completedBookings.length})`}>
              {completedBookings.length === 0 ? (
                <Card className="text-center py-5">
                  <Card.Body>
                    <FaCheckCircle size={40} className="text-muted mb-2" />
                    <p className="text-muted">No completed bookings</p>
                  </Card.Body>
                </Card>
              ) : (
                <Row>{completedBookings.map(renderBookingCard)}</Row>
              )}
            </Tab>
          </Tabs>
        )}
      </Container>

      {/* QR Code Display Modal */}
      <QRCodeDisplay
        show={showQRCode}
        onHide={() => setShowQRCode(false)}
        booking={selectedBooking}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this booking?</p>
          <p className="text-muted small">This action cannot be undone.</p>
          {bookingToDelete && (
            <div className="bg-light p-2 rounded">
              <small>
                <strong>{bookingToDelete.itemName}</strong><br />
                {formatDate(bookingToDelete.startDate)} - {formatDate(bookingToDelete.endDate)}
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteBooking} disabled={processing === bookingToDelete?.id}>
            {processing === bookingToDelete?.id ? <Spinner animation="border" size="sm" /> : 'Delete Booking'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyBookingsPage;