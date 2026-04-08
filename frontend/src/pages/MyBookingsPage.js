import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, FaTrash, FaMapMarkerAlt, FaPhone, FaInfoCircle } from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  // FIXED: Added requestReturn to the destructured hook
  const { bookings, loading, error, cancelBooking, deleteBooking, requestReturn } = useBookings();
  const navigate = useNavigate();
  
  const [processing, setProcessing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Filter bookings by status
  const pendingBookings = bookings?.filter(b => b.status === 'PENDING') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const rejectedBookings = bookings?.filter(b => b.status === 'REJECTED') || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'CANCELLED') || [];
  const completedBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];

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
      <Badge bg={variants[status] || 'secondary'} className="px-3 py-2 fw-medium rounded-pill">
        {icons[status]} {labels[status] || status}
      </Badge>
    );
  };

  const handleCancelBooking = async (bookingId) => {
    setProcessing(bookingId);
    await cancelBooking(bookingId);
    setProcessing(null);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;

    setProcessing(bookingToDelete.id);
    const success = await deleteBooking(bookingToDelete.id);

    if (success) {
      setShowDeleteModal(false);
      setBookingToDelete(null);
    }
    setProcessing(null);
  };

  // FIXED: Added handleRequestReturn function
  const handleRequestReturn = async (bookingId) => {
    setProcessing(bookingId);
    await requestReturn(bookingId);
    setProcessing(null);
  };

  const canDelete = (booking) => {
    return ['REJECTED', 'COMPLETED', 'CANCELLED'].includes(booking.status);
  };

  const getActionButton = (booking) => {
    if (booking.status === 'CONFIRMED') {
      return (
        <Button 
          variant="outline-success" 
          size="sm"
          // FIXED: Use the new handler instead of navigate()
          onClick={() => handleRequestReturn(booking.id)}
          disabled={processing === booking.id}
          className="w-100 fw-medium"
        >
          {processing === booking.id ? <Spinner animation="border" size="sm" /> : 'Request Return'}
        </Button>
      );
    }
    if (booking.status === 'PENDING') {
      return (
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => handleCancelBooking(booking.id)}
          disabled={processing === booking.id}
          className="w-100 fw-medium"
        >
          {processing === booking.id ? <Spinner animation="border" size="sm" /> : 'Cancel Request'}
        </Button>
      );
    }
    return null;
  };

  const renderPickupDetails = (booking) => {
    if (!booking.pickupLocation && !booking.pickupDateTime) return null;
    
    return (
      <div className="mt-3 p-3 bg-light rounded border border-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary fw-bold">
            <FaMapMarkerAlt className="me-1" />
            Pickup Information
          </h6>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-decoration-none"
            onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
          >
            {expandedBooking === booking.id ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
        
        {(expandedBooking === booking.id || !booking.pickupDateTime) && (
          <div className="mt-3 pt-2 border-top">
            {booking.pickupDateTime && (
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-semibold" style={{fontSize: '0.75rem'}}>Date & Time</small>
                <div className="fw-medium">
                  <FaClock className="me-1 text-muted" size={12} />
                  {formatDateTime(booking.pickupDateTime)}
                </div>
              </div>
            )}
            
            {booking.pickupLocation && (
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-semibold" style={{fontSize: '0.75rem'}}>Location</small>
                <div className="fw-medium">{booking.pickupLocation}</div>
              </div>
            )}
            
            {booking.pickupInstructions && (
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-semibold" style={{fontSize: '0.75rem'}}>Instructions</small>
                <div className="text-secondary small">{booking.pickupInstructions}</div>
              </div>
            )}
            
            {booking.ownerContact && (
              <div className="mb-2">
                <small className="text-muted d-block text-uppercase fw-semibold" style={{fontSize: '0.75rem'}}>Contact</small>
                <div className="fw-medium">
                  <FaPhone className="me-1 text-muted" size={12} />
                  {booking.ownerContact} <span className="text-muted small">({booking.contactMethod || 'Call/Text'})</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!booking.pickupDateTime && (
          <div className="mt-2">
            <Alert variant="warning" className="mb-0 py-2 border-0">
              <small className="fw-medium">
                <FaInfoCircle className="me-1" />
                Pickup details will be shared by the owner after approval.
              </small>
            </Alert>
          </div>
        )}
      </div>
    );
  };

  const renderBookingCard = (booking) => (
    <Col key={booking.id} md={6} lg={4} className="mb-4">
      <Card className="h-100 shadow-sm border-0 bg-white">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5 className="mb-0 fw-bold text-truncate pe-2">{booking.itemName || 'Unknown Tool'}</h5>
            <div>{getStatusBadge(booking.status)}</div>
          </div>
          
          <div className="mb-3 bg-light p-2 rounded">
            <div className="d-flex align-items-center mb-2">
              <FaCalendarAlt className="text-muted me-2" />
              <small className="fw-medium">
                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
              </small>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FaUser className="text-muted me-2" />
              <small className="fw-medium">Owner: {booking.ownerName || 'Unknown'}</small>
            </div>
            <div className="d-flex align-items-center">
              <FaTools className="text-muted me-2" />
              <small className="fw-medium">Tool ID: #{booking.itemId}</small>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Total Amount:</span>
            <strong className="fs-5">{formatCurrency(booking.totalAmount)}</strong>
          </div>
          
          {booking.depositAmount > 0 && (
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Deposit:</span>
              <span className="fw-medium">{formatCurrency(booking.depositAmount)}</span>
            </div>
          )}
          
          {booking.status === 'CONFIRMED' && renderPickupDetails(booking)}
          
          <div className="mt-auto pt-3">
            {getActionButton(booking)}
            
            {canDelete(booking) && (
              <Button 
                variant="light" 
                size="sm"
                className="w-100 mt-2 text-danger border-0 hover-danger"
                onClick={() => {
                  setBookingToDelete(booking);
                  setShowDeleteModal(true);
                }}
              >
                <FaTrash className="me-1" />
                Delete Record
              </Button>
            )}
          </div>
        </Card.Body>
        <Card.Footer className="bg-light border-0 text-muted text-center" style={{ fontSize: '0.8rem' }}>
          Requested on {formatDate(booking.createdAt)}
        </Card.Footer>
      </Card>
    </Col>
  );

  const renderEmptyState = (icon, title, message) => (
    <Card className="text-center py-5 border-0 shadow-sm bg-light">
      <Card.Body>
        {icon}
        <h5 className="fw-bold mt-3">{title}</h5>
        <p className="text-muted">{message}</p>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 fw-medium text-muted">Loading your bookings...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="border-0 shadow-sm">
          <Alert.Heading>Error Loading Bookings</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  const hasAnyBookings = bookings && bookings.length > 0;

  return (
    <>
      <Container className="py-4">
        <h2 className="mb-4 fw-bold">My Bookings</h2>
        
        {!hasAnyBookings ? (
          <Card className="text-center py-5 border-0 shadow-sm">
            <Card.Body>
              <FaCalendarAlt size={50} className="text-muted mb-3 opacity-50" />
              <h4 className="fw-bold">No Bookings Yet</h4>
              <p className="text-muted mb-4">You haven't rented any tools yet. Ready to start building?</p>
              <Button variant="primary" size="lg" className="px-4 fw-medium" onClick={() => navigate('/browse')}>
                Browse Available Tools
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Tabs defaultActiveKey="pending" className="mb-4 custom-tabs">
            <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
              {pendingBookings.length === 0 
                ? renderEmptyState(<FaClock size={40} className="text-muted opacity-50" />, "No Pending Requests", "You have no bookings awaiting approval.")
                : <Row className="mt-3">{pendingBookings.map(renderBookingCard)}</Row>}
            </Tab>

            <Tab eventKey="confirmed" title={`Confirmed (${confirmedBookings.length})`}>
              {confirmedBookings.length === 0 
                ? renderEmptyState(<FaCheckCircle size={40} className="text-muted opacity-50" />, "No Confirmed Bookings", "You have no upcoming confirmed rentals.")
                : <Row className="mt-3">{confirmedBookings.map(renderBookingCard)}</Row>}
            </Tab>

            <Tab eventKey="rejected" title={`Rejected (${rejectedBookings.length})`}>
              {rejectedBookings.length === 0 
                ? renderEmptyState(<FaTimesCircle size={40} className="text-muted opacity-50" />, "No Rejected Requests", "None of your booking requests have been rejected.")
                : <Row className="mt-3">{rejectedBookings.map(renderBookingCard)}</Row>}
            </Tab>

            <Tab eventKey="cancelled" title={`Cancelled (${cancelledBookings.length})`}>
              {cancelledBookings.length === 0 
                ? renderEmptyState(<FaTimesCircle size={40} className="text-muted opacity-50" />, "No Cancelled Bookings", "You haven't cancelled any of your requests.")
                : <Row className="mt-3">{cancelledBookings.map(renderBookingCard)}</Row>}
            </Tab>

            <Tab eventKey="completed" title={`Completed (${completedBookings.length})`}>
              {completedBookings.length === 0 
                ? renderEmptyState(<FaCheckCircle size={40} className="text-muted opacity-50" />, "No Completed Bookings", "Your history of successfully returned tools will appear here.")
                : <Row className="mt-3">{completedBookings.map(renderBookingCard)}</Row>}
            </Tab>
          </Tabs>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Delete Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this booking record? This action cannot be undone.</p>
          {bookingToDelete && (
            <div className="bg-light p-3 rounded border border-light mt-3">
              <strong className="d-block mb-1">{bookingToDelete.itemName}</strong>
              <small className="text-muted">
                {formatDate(bookingToDelete.startDate)} - {formatDate(bookingToDelete.endDate)}
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="fw-medium" onClick={() => setShowDeleteModal(false)}>
            Keep Record
          </Button>
          <Button variant="danger" className="fw-medium px-4" onClick={handleDeleteBooking} disabled={processing === bookingToDelete?.id}>
            {processing === bookingToDelete?.id ? <Spinner animation="border" size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MyBookingsPage;