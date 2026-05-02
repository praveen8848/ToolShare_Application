import React, { useState } from 'react';
import { Container, Row, Col, Badge, Button, Spinner, Alert, Tabs, Tab, Modal } from 'react-bootstrap';
import { 
  FaCalendarAlt, FaTools, FaUser, FaCheckCircle, FaTimesCircle, FaClock, 
  FaTrash, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaRupeeSign,
  FaArrowRight, FaSearch, FaBoxOpen
} from 'react-icons/fa';
import { useBookings } from '../hooks/useBookings';
import { formatDate, formatDateTime } from '../utils/formatters';
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
    const config = {
      'PENDING':   { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)', icon: <FaClock size={10} />, label: 'Pending' },
      'CONFIRMED': { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)', icon: <FaCheckCircle size={10} />, label: 'Confirmed' },
      'REJECTED':  { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)', icon: <FaTimesCircle size={10} />, label: 'Rejected' },
      'CANCELLED': { bg: 'rgba(115,115,115,0.1)', color: '#737373', border: 'rgba(115,115,115,0.2)', icon: <FaTimesCircle size={10} />, label: 'Cancelled' },
      'COMPLETED': { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)', icon: <FaCheckCircle size={10} />, label: 'Completed' },
    };
    const { bg, color, border, icon, label } = config[status] || config['PENDING'];
    return (
      <span style={{ background: bg, color, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '6px', fontWeight: 500, fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
        {icon} {label}
      </span>
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
    if (success) { setShowDeleteModal(false); setBookingToDelete(null); }
    setProcessing(null);
  };

  const handleRequestReturn = async (bookingId) => {
    setProcessing(bookingId);
    await requestReturn(bookingId);
    setProcessing(null);
  };

  const canDelete = (booking) => ['REJECTED', 'COMPLETED', 'CANCELLED'].includes(booking.status);

  const renderBookingCard = (booking) => (
    <Col key={booking.id} md={6} lg={4} className="mb-4">
      <div className="booking-card">
        <div className="booking-header">
          <h5 className="booking-title">{booking.itemName || 'Unknown Tool'}</h5>
          {getStatusBadge(booking.status)}
        </div>
        
        <div className="booking-info">
          <div className="info-row"><FaCalendarAlt size={13} /><span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span></div>
          <div className="info-row"><FaUser size={13} /><span>Owner: {booking.ownerName || 'Unknown'}</span></div>
          <div className="info-row"><FaTools size={13} /><span>Tool ID: #{booking.itemId}</span></div>
        </div>
        
        <div className="booking-pricing">
          <div className="price-row">
            <span>Total</span>
            <span className="price-value"><FaRupeeSign size={12} />{booking.totalAmount?.toLocaleString('en-IN') || '0'}</span>
          </div>
          {booking.depositAmount > 0 && (
            <div className="price-row">
              <span>Deposit</span>
              <span style={{ color: '#34D399', fontWeight: 600 }}><FaRupeeSign size={10} />{booking.depositAmount?.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>
        
        {booking.status === 'CONFIRMED' && (
          <div className="pickup-section">
            <div className="pickup-header" onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}>
              <FaMapMarkerAlt size={12} /> Pickup Info
              <span className="expand-link">{expandedBooking === booking.id ? 'Hide' : 'Show'}</span>
            </div>
            {(expandedBooking === booking.id || !booking.pickupDateTime) && (
              <div className="pickup-content">
                {booking.pickupDateTime ? (
                  <>
                    <div className="detail-row"><FaClock size={11} /><span>{formatDateTime(booking.pickupDateTime)}</span></div>
                    {booking.pickupLocation && <div className="detail-row"><FaMapMarkerAlt size={11} /><span>{booking.pickupLocation}</span></div>}
                    {booking.ownerContact && <div className="detail-row"><FaPhone size={11} /><span>{booking.ownerContact}</span></div>}
                  </>
                ) : (
                  <div className="pickup-pending"><FaInfoCircle size={12} /> Details shared after approval</div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="booking-actions">
          {booking.status === 'CONFIRMED' && (
            <Button className="btn-mint w-100" onClick={() => handleRequestReturn(booking.id)} disabled={processing === booking.id}>
              {processing === booking.id ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-2" size={12} /> Request Return</>}
            </Button>
          )}
          {booking.status === 'PENDING' && (
            <Button className="btn-outline-danger w-100" onClick={() => handleCancelBooking(booking.id)} disabled={processing === booking.id}>
              {processing === booking.id ? <Spinner animation="border" size="sm" /> : <><FaTimesCircle className="me-2" size={12} /> Cancel Request</>}
            </Button>
          )}
          {canDelete(booking) && (
            <Button className="btn-delete w-100 mt-2" onClick={() => { setBookingToDelete(booking); setShowDeleteModal(true); }}>
              <FaTrash className="me-2" size={11} /> Delete
            </Button>
          )}
        </div>
        
        <div className="booking-footer">Requested on {formatDate(booking.createdAt)}</div>
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
        <style>{`.bookings-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399' }} />
          <p style={{ color: '#A3A3A3', marginTop: '1rem' }}>Loading your bookings...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-wrapper">
        <style>{`.bookings-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; }`}</style>
        <Container className="py-5">
          <Alert style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#FCA5A5', borderRadius: '14px' }}>
            {error}
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
              background: #121212;
              min-height: 100vh;
              padding-top: 76px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #E5E5E5;
              padding-bottom: 3rem;
            }
            
            .page-header {
              padding: 1.5rem 0 1rem;
              border-bottom: 1px solid #2A2A2A;
              margin-bottom: 1.5rem;
            }

            .page-header h1 { font-weight: 700; color: #F5F5F5; font-size: 2rem; }
            
            .booking-card {
              background: #1E1E1E;
              border: 1px solid #2A2A2A;
              border-radius: 14px;
              overflow: hidden;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            
            .booking-header {
              padding: 1rem 1.25rem;
              border-bottom: 1px solid #2A2A2A;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 0.5rem;
            }
            
            .booking-title {
              color: #F5F5F5;
              font-weight: 600;
              margin: 0;
              font-size: 1rem;
            }
            
            .booking-info {
              padding: 1rem 1.25rem;
              background: #0A0A0A;
              border-bottom: 1px solid #2A2A2A;
            }
            
            .info-row {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: #A3A3A3;
              font-size: 0.85rem;
              margin-bottom: 0.5rem;
            }
            
            .info-row:last-child { margin-bottom: 0; }
            .info-row svg { color: #34D399; }
            
            .booking-pricing {
              padding: 1rem 1.25rem;
              border-bottom: 1px solid #2A2A2A;
            }
            
            .price-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #A3A3A3;
              font-size: 0.9rem;
              margin-bottom: 0.35rem;
            }
            
            .price-row:last-child { margin-bottom: 0; }
            
            .price-value {
              color: #34D399;
              font-weight: 700;
              font-size: 1.15rem;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            
            .pickup-section {
              padding: 1rem 1.25rem;
              background: #0A0A0A;
              border-bottom: 1px solid #2A2A2A;
            }
            
            .pickup-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #34D399;
              font-weight: 600;
              font-size: 0.85rem;
              cursor: pointer;
            }
            
            .expand-link { color: #A3A3A3; font-size: 0.8rem; font-weight: 400; }
            
            .pickup-content { margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #2A2A2A; }
            
            .detail-row {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              color: #A3A3A3;
              font-size: 0.85rem;
              margin-bottom: 0.4rem;
            }
            
            .detail-row svg { color: #737373; }
            
            .pickup-pending {
              background: rgba(245,158,11,0.06);
              border: 1px solid rgba(245,158,11,0.15);
              border-radius: 8px;
              padding: 0.5rem 0.75rem;
              color: #F59E0B;
              font-size: 0.8rem;
              display: flex;
              align-items: center;
              gap: 0.4rem;
            }
            
            .booking-actions { padding: 1rem 1.25rem; flex: 1; }
            
            .btn-mint {
              background: #10B981;
              color: #121212;
              border: 1px solid #10B981;
              border-radius: 8px;
              padding: 0.55rem 1rem;
              font-weight: 600;
              font-size: 0.85rem;
            }
            
            .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
            .btn-mint:disabled { opacity: 0.5; }
            
            .btn-outline-danger {
              background: transparent;
              color: #EF4444;
              border: 1px solid rgba(239,68,68,0.2);
              border-radius: 8px;
              padding: 0.55rem 1rem;
              font-weight: 500;
              font-size: 0.85rem;
            }
            
            .btn-outline-danger:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.4); color: #F87171; }
            
            .btn-delete {
              background: transparent;
              color: #737373;
              border: 1px solid #2A2A2A;
              border-radius: 8px;
              padding: 0.45rem 0.75rem;
              font-weight: 500;
              font-size: 0.8rem;
            }
            
            .btn-delete:hover { border-color: #3A3A3A; color: #EF4444; }
            
            .booking-footer {
              padding: 0.6rem 1.25rem;
              background: #0A0A0A;
              color: #737373;
              font-size: 0.75rem;
              text-align: center;
              border-top: 1px solid #2A2A2A;
            }
            
            .empty-state {
              text-align: center;
              padding: 3rem 2rem;
              background: #1E1E1E;
              border: 1px solid #2A2A2A;
              border-radius: 14px;
            }
            
            .empty-icon {
              width: 64px; height: 64px;
              border-radius: 12px;
              background: #0A0A0A;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              border: 1px solid #2A2A2A;
              color: #34D399;
              font-size: 1.5rem;
            }
            
            .empty-state h5 { color: #F5F5F5; font-weight: 600; }
            .empty-state p { color: #A3A3A3; font-size: 0.9rem; }
            
            .nav-tabs-custom {
              border-bottom: 1px solid #2A2A2A;
              gap: 0.25rem;
            }
            
            .nav-tabs-custom .nav-link {
              color: #A3A3A3 !important;
              background: transparent;
              border: none !important;
              padding: 0.6rem 1.25rem;
              border-radius: 8px;
              font-weight: 500;
              font-size: 0.9rem;
            }
            
            .nav-tabs-custom .nav-link:hover { color: #34D399 !important; }
            
            .nav-tabs-custom .nav-link.active {
              background: #10B981 !important;
              color: #121212 !important;
              font-weight: 600;
            }
            
            .btn-browse {
              background: #10B981;
              color: #121212;
              border: 1px solid #10B981;
              border-radius: 10px;
              padding: 0.65rem 1.5rem;
              font-weight: 600;
            }
            
            .btn-browse:hover { background: #059669; border-color: #059669; color: #121212; }
            
            .modal-dark .modal-content {
              background: #1E1E1E;
              color: #E5E5E5;
              border: 1px solid #2A2A2A;
              border-radius: 14px;
            }
            
            .modal-dark .modal-header { border-bottom: 1px solid #2A2A2A; padding: 1.25rem 1.25rem 0.75rem; }
            .modal-dark .modal-footer { border-top: 1px solid #2A2A2A; padding: 0.75rem 1.25rem 1.25rem; }
            .modal-dark .btn-close { filter: invert(1); }
          `}
        </style>

        <Container className="py-4">
          
          <div className="page-header">
            <h1>My Bookings</h1>
            <p style={{ color: '#A3A3A3', fontSize: '0.95rem' }}>Track and manage all your tool rentals</p>
          </div>
          
          {!hasAnyBookings ? (
            <div className="empty-state">
              <div className="empty-icon"><FaBoxOpen size={28} /></div>
              <h4>No Bookings Yet</h4>
              <p>You haven't rented any tools yet. Ready to start building?</p>
              <Button className="btn-browse" onClick={() => navigate('/browse')}>
                <FaSearch className="me-2" size={14} /> Browse Tools <FaArrowRight className="ms-2" size={12} />
              </Button>
            </div>
          ) : (
            <Tabs defaultActiveKey="pending" className="nav-tabs-custom mb-4">
              {[
                { key: 'pending', data: pendingBookings, icon: <FaClock size={28} />, emptyTitle: 'No Pending Requests', emptyMsg: 'No bookings awaiting approval.' },
                { key: 'confirmed', data: confirmedBookings, icon: <FaCheckCircle size={28} />, emptyTitle: 'No Confirmed Bookings', emptyMsg: 'No upcoming confirmed rentals.' },
                { key: 'rejected', data: rejectedBookings, icon: <FaTimesCircle size={28} />, emptyTitle: 'No Rejected Requests', emptyMsg: 'None of your requests have been rejected.' },
                { key: 'cancelled', data: cancelledBookings, icon: <FaTimesCircle size={28} />, emptyTitle: 'No Cancelled Bookings', emptyMsg: 'You haven\'t cancelled any requests.' },
                { key: 'completed', data: completedBookings, icon: <FaCheckCircle size={28} />, emptyTitle: 'No Completed Bookings', emptyMsg: 'Your history of returned tools will appear here.' },
              ].map(tab => (
                <Tab key={tab.key} eventKey={tab.key} title={`${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)} (${tab.data.length})`}>
                  {tab.data.length === 0 
                    ? renderEmptyState(tab.icon, tab.emptyTitle, tab.emptyMsg)
                    : <Row className="mt-3 g-4">{tab.data.map(renderBookingCard)}</Row>}
                </Tab>
              ))}
            </Tabs>
          )}
        </Container>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-dark">
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#EF4444', fontWeight: 600, fontSize: '1.1rem' }}>Delete Record</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: '#E5E5E5', marginBottom: '0.75rem', fontSize: '0.9rem' }}>Delete this booking record? This cannot be undone.</p>
            {bookingToDelete && (
              <div style={{ background: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '10px', padding: '0.75rem 1rem' }}>
                <strong style={{ color: '#F5F5F5', display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{bookingToDelete.itemName}</strong>
                <small style={{ color: '#A3A3A3' }}><FaCalendarAlt className="me-1" size={11} />{formatDate(bookingToDelete.startDate)} - {formatDate(bookingToDelete.endDate)}</small>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-delete" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setShowDeleteModal(false)}>Keep</Button>
            <Button style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.85rem' }} onClick={handleDeleteBooking} disabled={processing === bookingToDelete?.id}>
              {processing === bookingToDelete?.id ? <Spinner animation="border" size="sm" /> : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default MyBookingsPage;