import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { 
  FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, 
  FaTrash, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaRupeeSign,
  FaArrowRight, FaSearch, FaBoxOpen
} from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const { bookings, loading, error, cancelBooking, deleteBooking, requestReturn } = useBookings();
  const navigate = useNavigate();
  
  const [processing, setProcessing] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);

  const pendingBookings = bookings?.filter(b => b.status === 'PENDING') || [];
  const confirmedBookings = bookings?.filter(b => b.status === 'CONFIRMED') || [];
  const rejectedBookings = bookings?.filter(b => b.status === 'REJECTED') || [];
  const cancelledBookings = bookings?.filter(b => b.status === 'CANCELLED') || [];
  const completedBookings = bookings?.filter(b => b.status === 'COMPLETED') || [];

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': { bg: '#fbbf24', color: '#0f172a', icon: <FaClock /> },
      'CONFIRMED': { bg: '#10b981', color: '#ffffff', icon: <FaCheckCircle /> },
      'REJECTED': { bg: '#ef4444', color: '#ffffff', icon: <FaTimesCircle /> },
      'CANCELLED': { bg: '#64748b', color: '#ffffff', icon: <FaTimesCircle /> },
      'COMPLETED': { bg: '#3b82f6', color: '#ffffff', icon: <FaCheckCircle /> },
    };
    
    const labels = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed',
    };
    
    const style = variants[status] || { bg: '#64748b', color: '#ffffff', icon: <FaInfoCircle /> };
    
    return (
      <Badge style={{ 
        backgroundColor: style.bg, 
        color: style.color,
        padding: '6px 12px',
        borderRadius: '10px',
        fontWeight: 500,
        fontSize: '0.8rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {style.icon} {labels[status] || status}
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
          className="btn-return w-100"
          onClick={() => handleRequestReturn(booking.id)}
          disabled={processing === booking.id}
        >
          {processing === booking.id ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <><FaCheckCircle className="me-2" /> Request Return</>
          )}
        </Button>
      );
    }
    if (booking.status === 'PENDING') {
      return (
        <Button 
          className="btn-cancel w-100"
          onClick={() => handleCancelBooking(booking.id)}
          disabled={processing === booking.id}
        >
          {processing === booking.id ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <><FaTimesCircle className="me-2" /> Cancel Request</>
          )}
        </Button>
      );
    }
    return null;
  };

  const renderPickupDetails = (booking) => {
    if (!booking.pickupLocation && !booking.pickupDateTime) return null;
    
    return (
      <div className="pickup-details">
        <div className="pickup-header" onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}>
          <span>
            <FaMapMarkerAlt className="me-2" />
            Pickup Information
          </span>
          <Button variant="link" className="expand-btn">
            {expandedBooking === booking.id ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>
        
        {(expandedBooking === booking.id || !booking.pickupDateTime) && (
          <div className="pickup-content">
            {booking.pickupDateTime && (
              <div className="detail-row">
                <span className="detail-label">
                  <FaClock className="me-2" />
                  Date & Time
                </span>
                <span className="detail-value">{formatDateTime(booking.pickupDateTime)}</span>
              </div>
            )}
            
            {booking.pickupLocation && (
              <div className="detail-row">
                <span className="detail-label">
                  <FaMapMarkerAlt className="me-2" />
                  Location
                </span>
                <span className="detail-value">{booking.pickupLocation}</span>
              </div>
            )}
            
            {booking.pickupInstructions && (
              <div className="detail-row">
                <span className="detail-label">Instructions</span>
                <span className="detail-value">{booking.pickupInstructions}</span>
              </div>
            )}
            
            {booking.ownerContact && (
              <div className="detail-row">
                <span className="detail-label">
                  <FaPhone className="me-2" />
                  Contact
                </span>
                <span className="detail-value">
                  {booking.ownerContact} 
                  <Badge className="contact-method">{booking.contactMethod || 'Call/Text'}</Badge>
                </span>
              </div>
            )}
          </div>
        )}
        
        {!booking.pickupDateTime && (
          <div className="pickup-pending">
            <FaInfoCircle className="me-2" />
            Pickup details will be shared by the owner after approval.
          </div>
        )}
      </div>
    );
  };

  const renderBookingCard = (booking) => (
    <Col key={booking.id} md={6} lg={4} className="mb-4">
      <div className="booking-card">
        <div className="booking-header">
          <h5 className="booking-title">{booking.itemName || 'Unknown Tool'}</h5>
          {getStatusBadge(booking.status)}
        </div>
        
        <div className="booking-info">
          <div className="info-row">
            <FaCalendarAlt />
            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
          </div>
          <div className="info-row">
            <FaUser />
            <span>Owner: {booking.ownerName || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <FaTools />
            <span>Tool ID: #{booking.itemId}</span>
          </div>
        </div>
        
        <div className="booking-pricing">
          <div className="price-row">
            <span>Total Amount:</span>
            <span className="price-value">
              <FaRupeeSign size={14} />
              {booking.totalAmount?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          
          {booking.depositAmount > 0 && (
            <div className="price-row deposit">
              <span>Deposit:</span>
              <span>
                <FaRupeeSign size={12} />
                {booking.depositAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
        
        {booking.status === 'CONFIRMED' && renderPickupDetails(booking)}
        
        <div className="booking-actions">
          {getActionButton(booking)}
          
          {canDelete(booking) && (
            <Button 
              className="btn-delete w-100 mt-2"
              onClick={() => {
                setBookingToDelete(booking);
                setShowDeleteModal(true);
              }}
            >
              <FaTrash className="me-2" />
              Delete Record
            </Button>
          )}
        </div>
        
        <div className="booking-footer">
          Requested on {formatDate(booking.createdAt)}
        </div>
      </div>
    </Col>
  );

  const renderEmptyState = (icon, title, message) => (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h5>{title}</h5>
      <p>{message}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="bookings-wrapper">
        <Container className="py-5 text-center">
          <div className="loading-state">
            <Spinner animation="border" />
            <p>Loading your bookings...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-wrapper">
        <Container className="py-5">
          <Alert className="error-alert">
            <Alert.Heading>Error Loading Bookings</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  const hasAnyBookings = bookings && bookings.length > 0;

  return (
    <>
      <div className="bookings-wrapper">
        <style>
          {`
            .bookings-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #e2e8f0;
              padding-bottom: 3rem;
            }
            
            .page-header {
              padding: 2rem 0 1.5rem;
              border-bottom: 1px solid #334155;
              margin-bottom: 2rem;
            }
            
            .gradient-text {
              background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            
            .booking-card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 20px;
              overflow: hidden;
              transition: all 0.3s ease;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .booking-card:hover {
              border-color: #60a5fa;
              box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
              transform: translateY(-2px);
            }
            
            .booking-header {
              padding: 1.25rem 1.5rem;
              border-bottom: 1px solid #334155;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 0.75rem;
            }
            
            .booking-title {
              color: #f1f5f9;
              font-weight: 700;
              margin: 0;
              font-size: 1.1rem;
              line-height: 1.4;
            }
            
            .booking-info {
              padding: 1.25rem 1.5rem;
              background: #0f172a;
              border-bottom: 1px solid #334155;
            }
            
            .info-row {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              color: #94a3b8;
              font-size: 0.9rem;
              margin-bottom: 0.75rem;
            }
            
            .info-row:last-child {
              margin-bottom: 0;
            }
            
            .info-row svg {
              color: #60a5fa;
              width: 16px;
            }
            
            .booking-pricing {
              padding: 1.25rem 1.5rem;
              border-bottom: 1px solid #334155;
            }
            
            .price-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #94a3b8;
              font-size: 0.95rem;
              margin-bottom: 0.5rem;
            }
            
            .price-row:last-child {
              margin-bottom: 0;
            }
            
            .price-value {
              color: #60a5fa;
              font-weight: 700;
              font-size: 1.25rem;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            
            .price-row.deposit span:last-child {
              color: #34d399;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            
            .pickup-details {
              padding: 1.25rem 1.5rem;
              background: #0f172a;
              border-bottom: 1px solid #334155;
            }
            
            .pickup-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #60a5fa;
              font-weight: 600;
              font-size: 0.9rem;
              cursor: pointer;
              margin-bottom: 0.75rem;
            }
            
            .expand-btn {
              color: #94a3b8;
              padding: 0;
              font-size: 0.85rem;
              text-decoration: none;
            }
            
            .expand-btn:hover {
              color: #60a5fa;
            }
            
            .pickup-content {
              margin-top: 1rem;
              padding-top: 1rem;
              border-top: 1px solid #334155;
            }
            
            .detail-row {
              display: flex;
              margin-bottom: 0.75rem;
              font-size: 0.9rem;
            }
            
            .detail-row:last-child {
              margin-bottom: 0;
            }
            
            .detail-label {
              width: 100px;
              color: #64748b;
              display: flex;
              align-items: center;
            }
            
            .detail-value {
              flex: 1;
              color: #cbd5e1;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            
            .contact-method {
              background: #334155;
              color: #94a3b8;
              font-weight: 400;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 0.75rem;
            }
            
            .pickup-pending {
              background: rgba(245, 158, 11, 0.1);
              border: 1px solid rgba(245, 158, 11, 0.3);
              border-radius: 10px;
              padding: 0.75rem 1rem;
              color: #fbbf24;
              font-size: 0.85rem;
              display: flex;
              align-items: center;
              margin-top: 0.5rem;
            }
            
            .booking-actions {
              padding: 1.25rem 1.5rem;
              flex: 1;
            }
            
            .btn-return {
              background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
              color: white;
              border: none;
              border-radius: 10px;
              padding: 0.7rem 1rem;
              font-weight: 600;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            
            .btn-return:hover {
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
              transform: translateY(-1px);
              box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }
            
            .btn-cancel {
              background: transparent;
              color: #ef4444;
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 10px;
              padding: 0.7rem 1rem;
              font-weight: 600;
              transition: all 0.3s ease;
            }
            
            .btn-cancel:hover {
              background: rgba(239, 68, 68, 0.1);
              border-color: #ef4444;
              color: #f87171;
            }
            
            .btn-delete {
              background: transparent;
              color: #64748b;
              border: 1px solid #334155;
              border-radius: 10px;
              padding: 0.6rem 1rem;
              font-weight: 500;
              font-size: 0.85rem;
              transition: all 0.3s ease;
            }
            
            .btn-delete:hover {
              background: rgba(239, 68, 68, 0.1);
              border-color: #ef4444;
              color: #ef4444;
            }
            
            .booking-footer {
              padding: 0.75rem 1.5rem;
              background: #0f172a;
              color: #64748b;
              font-size: 0.8rem;
              text-align: center;
              border-top: 1px solid #334155;
            }
            
            .empty-state {
              text-align: center;
              padding: 4rem 2rem;
              background: #1e293b;
              border: 2px dashed #334155;
              border-radius: 20px;
            }
            
            .empty-icon {
              width: 80px;
              height: 80px;
              border-radius: 20px;
              background: #0f172a;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1.5rem;
              border: 1px solid #334155;
              color: #60a5fa;
              font-size: 2rem;
            }
            
            .empty-state h5 {
              color: #f1f5f9;
              font-weight: 700;
              margin-bottom: 0.5rem;
            }
            
            .empty-state p {
              color: #94a3b8;
              margin-bottom: 0;
            }
            
            .nav-tabs-custom {
              border-bottom: 1px solid #334155;
              gap: 0.5rem;
            }
            
            .nav-tabs-custom .nav-link {
              color: #94a3b8 !important;
              background: transparent;
              border: none !important;
              padding: 0.75rem 1.5rem;
              border-radius: 12px;
              font-weight: 500;
              transition: all 0.2s ease;
            }
            
            .nav-tabs-custom .nav-link:hover {
              color: #60a5fa !important;
              background: rgba(59, 130, 246, 0.1);
            }
            
            .nav-tabs-custom .nav-link.active {
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
              color: white !important;
            }
            
            .loading-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              color: #94a3b8;
            }
            
            .loading-state .spinner-border {
              color: #60a5fa !important;
              width: 3rem;
              height: 3rem;
              margin-bottom: 1rem;
            }
            
            .error-alert {
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 16px;
              color: #fca5a5;
              padding: 2rem;
            }
            
            .modal-dark .modal-content {
              background: #1e293b;
              color: #e2e8f0;
              border: 1px solid #334155;
              border-radius: 20px;
            }
            
            .modal-dark .modal-header {
              border-bottom: 1px solid #334155;
            }
            
            .modal-dark .modal-footer {
              border-top: 1px solid #334155;
            }
            
            .modal-dark .btn-close {
              filter: invert(1);
            }
            
            .browse-btn {
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
              color: white;
              border: none;
              border-radius: 12px;
              padding: 0.75rem 2rem;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
              transition: all 0.3s ease;
            }
            
            .browse-btn:hover {
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            }
          `}
        </style>

        <Container className="py-4">
          
          {/* Page Header */}
          <div className="page-header">
            <h1 className="fw-extrabold mb-2" style={{ fontSize: '2.5rem' }}>
              <span className="gradient-text">My Bookings</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              Track and manage all your tool rentals in one place
            </p>
          </div>
          
          {!hasAnyBookings ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBoxOpen size={40} />
              </div>
              <h4>No Bookings Yet</h4>
              <p style={{ marginBottom: '1.5rem' }}>
                You haven't rented any tools yet. Ready to start building?
              </p>
              <Button className="browse-btn" onClick={() => navigate('/browse')}>
                <FaSearch className="me-2" />
                Browse Available Tools
                <FaArrowRight className="ms-2" />
              </Button>
            </div>
          ) : (
            <Tabs defaultActiveKey="pending" className="nav-tabs-custom mb-4">
              <Tab eventKey="pending" title={`Pending (${pendingBookings.length})`}>
                {pendingBookings.length === 0 
                  ? renderEmptyState(<FaClock size={40} />, "No Pending Requests", "You have no bookings awaiting approval.")
                  : <Row className="mt-3 g-4">{pendingBookings.map(renderBookingCard)}</Row>}
              </Tab>

              <Tab eventKey="confirmed" title={`Confirmed (${confirmedBookings.length})`}>
                {confirmedBookings.length === 0 
                  ? renderEmptyState(<FaCheckCircle size={40} />, "No Confirmed Bookings", "You have no upcoming confirmed rentals.")
                  : <Row className="mt-3 g-4">{confirmedBookings.map(renderBookingCard)}</Row>}
              </Tab>

              <Tab eventKey="rejected" title={`Rejected (${rejectedBookings.length})`}>
                {rejectedBookings.length === 0 
                  ? renderEmptyState(<FaTimesCircle size={40} />, "No Rejected Requests", "None of your booking requests have been rejected.")
                  : <Row className="mt-3 g-4">{rejectedBookings.map(renderBookingCard)}</Row>}
              </Tab>

              <Tab eventKey="cancelled" title={`Cancelled (${cancelledBookings.length})`}>
                {cancelledBookings.length === 0 
                  ? renderEmptyState(<FaTimesCircle size={40} />, "No Cancelled Bookings", "You haven't cancelled any of your requests.")
                  : <Row className="mt-3 g-4">{cancelledBookings.map(renderBookingCard)}</Row>}
              </Tab>

              <Tab eventKey="completed" title={`Completed (${completedBookings.length})`}>
                {completedBookings.length === 0 
                  ? renderEmptyState(<FaCheckCircle size={40} />, "No Completed Bookings", "Your history of successfully returned tools will appear here.")
                  : <Row className="mt-3 g-4">{completedBookings.map(renderBookingCard)}</Row>}
              </Tab>
            </Tabs>
          )}
        </Container>

        {/* Delete Confirmation Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered 
          className="modal-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#ef4444', fontWeight: 700 }}>
              Delete Record
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: '#e2e8f0', marginBottom: '1rem' }}>
              Are you sure you want to delete this booking record? This action cannot be undone.
            </p>
            {bookingToDelete && (
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <strong style={{ color: '#f1f5f9', display: 'block', marginBottom: '0.5rem' }}>
                  {bookingToDelete.itemName}
                </strong>
                <small style={{ color: '#94a3b8' }}>
                  <FaCalendarAlt className="me-2" size={12} />
                  {formatDate(bookingToDelete.startDate)} - {formatDate(bookingToDelete.endDate)}
                </small>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              style={{
                background: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '0.6rem 1.5rem',
                fontWeight: 600
              }}
              onClick={() => setShowDeleteModal(false)}
            >
              Keep Record
            </Button>
            <Button 
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                padding: '0.6rem 1.5rem',
                fontWeight: 600
              }}
              onClick={handleDeleteBooking} 
              disabled={processing === bookingToDelete?.id}
            >
              {processing === bookingToDelete?.id ? (
                <Spinner animation="border" size="sm" />
              ) : (
                'Delete'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default MyBookingsPage;