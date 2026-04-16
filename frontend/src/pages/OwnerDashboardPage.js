import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaTools, 
  FaCalendarAlt, 
  FaUser, 
  FaQrcode,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaExternalLinkAlt
} from 'react-icons/fa';
import ownerService from '../services/ownerService';
import toolService from '../services/toolService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import PickupDetailsModal from '../components/bookings/PickupDetailsModal';

const OwnerDashboardPage = () => {
  const navigate = useNavigate(); 
  const [pendingBookings, setPendingBookings] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [myTools, setMyTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toolPickupDetails, setToolPickupDetails] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalRentals: 0,
    averageRating: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookings, tools, returns] = await Promise.all([
        ownerService.getPendingBookings(),
        ownerService.getMyTools(),
        ownerService.getReturnRequests()
      ]);
      
      // Filter bookings by status
      const pending = bookings.filter(b => b.status === 'PENDING');
      const rejected = bookings.filter(b => b.status === 'REJECTED');
      
      setPendingBookings(pending);
      setRejectedBookings(rejected);
      setMyTools(tools);
      setReturnRequests(returns);
      
      // Calculate stats
      const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
      const earnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      setStats({
        totalEarnings: earnings,
        totalRentals: completedBookings.length,
        averageRating: 4.8
      });
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (bookingId) => {
    setProcessing(bookingId);
    try {
      await ownerService.rejectBooking(bookingId);
      toast.success('Booking rejected');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmReturn = async (bookingId) => {
    setProcessing(bookingId);
    try {
      await ownerService.confirmReturn(bookingId);
      toast.success('Return confirmed! Deposit will be refunded.');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm return');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'PENDING': { bg: '#fbbf24', color: '#0f172a' },
      'CONFIRMED': { bg: '#10b981', color: '#ffffff' },
      'REJECTED': { bg: '#ef4444', color: '#ffffff' },
      'RETURN_REQUESTED': { bg: '#3b82f6', color: '#ffffff' },
      'COMPLETED': { bg: '#059669', color: '#ffffff' },
    };
    const style = variants[status] || { bg: '#64748b', color: '#ffffff' };
    return (
      <Badge style={{ 
        backgroundColor: style.bg, 
        color: style.color,
        padding: '6px 12px',
        borderRadius: '8px',
        fontWeight: 500,
        fontSize: '0.75rem'
      }}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleApproveClick = async (booking) => {
    setSelectedBooking(booking);
    setProcessing(booking.id);
    try {
      const tool = await toolService.getToolById(booking.itemId);
      setToolPickupDetails({
        pickupLocation: tool.pickupLocation || '',
        pickupInstructions: tool.pickupInstructions || '',
        ownerContact: tool.ownerContact || '',
        contactMethod: tool.contactMethod || 'BOTH'
      });
      setShowPickupModal(true);
    } catch (error) {
      toast.error('Failed to load pickup details');
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmApproval = async (pickupDetails) => {
    setProcessing(selectedBooking?.id);
    try {
      await ownerService.approveBooking(selectedBooking.id, pickupDetails);
      toast.success('Booking approved! Pickup details sent to borrower.');
      loadData();
      setShowPickupModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(null);
    }
  };

  // Handle My Tools tab click - navigate to My Tools page
  const handleMyToolsTab = () => {
    navigate('/my-tools');
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Container className="py-5 text-center">
          <div className="loading-spinner-wrapper">
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <p className="mt-3" style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <style>
        {`
          .dashboard-wrapper {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            min-height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            padding-top: 76px; /* Fixed: Prevent navbar overlap */
          }
          
          .dashboard-header {
            padding: 1rem 0 1.5rem;
            border-bottom: 1px solid #334155;
            margin-bottom: 2rem;
          }
          
          .stat-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
          }
          
          .booking-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            transition: all 0.3s ease;
            height: 100%;
          }
          
          .booking-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.1);
            transform: translateY(-2px);
          }
          
          .dashboard-tabs .nav-link {
            color: #94a3b8 !important;
            border: none !important;
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            margin-right: 0.5rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .dashboard-tabs .nav-link:hover {
            color: #60a5fa !important;
            background: rgba(59, 130, 246, 0.1);
          }
          
          .dashboard-tabs .nav-link.active {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%) !important;
            color: white !important;
          }
          
          /* Custom tab for My Tools that acts as a link */
          .dashboard-tabs .nav-link.my-tools-tab {
            cursor: pointer;
          }
          
          .dashboard-tabs .nav-link.my-tools-tab:hover {
            background: rgba(59, 130, 246, 0.1) !important;
            color: #60a5fa !important;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          
          .btn-gradient-success {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.2rem;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
          }
          
          .btn-gradient-success:hover {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          
          .btn-outline-danger {
            background: transparent;
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.2rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-danger:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #f87171;
          }
          
          .empty-state-card {
            background: #1e293b;
            border: 2px dashed #334155;
            border-radius: 20px;
            padding: 4rem 2rem;
            text-align: center;
          }
          
          .info-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            color: #94a3b8;
            font-size: 0.9rem;
          }
          
          .price-tag {
            color: #60a5fa;
            font-weight: 700;
            font-size: 1.25rem;
          }
          
          .deposit-tag {
            color: #34d399;
            font-weight: 600;
            font-size: 0.95rem;
          }
          
          .loading-spinner-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding-top: 76px;
          }
          
          .my-tools-redirect-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 3rem 2rem;
            text-align: center;
          }
          
          .redirect-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            border: 1px solid #334155;
          }
        `}
      </style>

      <Container className="py-4">
        {/* Header */}
        <div className="dashboard-header">
          <h1 style={{ 
            background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.5rem',
            fontWeight: 800,
            marginBottom: '0.5rem'
          }}>
            Owner Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Manage your tools, bookings, and earnings
          </p>
        </div>

        {/* Stats Cards */}
        <Row className="g-4 mb-5">
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Earnings
                </span>
                <FaRupeeSign style={{ color: '#10b981', fontSize: '1.5rem' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                ₹{stats.totalEarnings.toLocaleString('en-IN')}
              </h2>
              <p style={{ color: '#10b981', marginBottom: 0, fontSize: '0.9rem' }}>
                ↑ 12% from last month
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Rentals
                </span>
                <FaTools style={{ color: '#60a5fa', fontSize: '1.5rem' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                {stats.totalRentals}
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
                {myTools.length} active tools listed
              </p>
            </div>
          </Col>
          <Col md={4}>
            <div className="stat-card">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Average Rating
                </span>
                <FaStar style={{ color: '#fbbf24', fontSize: '1.5rem' }} />
              </div>
              <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                {stats.averageRating} ★
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
                Based on {stats.totalRentals} reviews
              </p>
            </div>
          </Col>
        </Row>

        {/* Tabs */}
        <Tabs defaultActiveKey="pending" className="dashboard-tabs mb-4">
          <Tab eventKey="pending" title={
            <span>
              <FaClock className="me-2" />
              Pending ({pendingBookings.length})
            </span>
          }>
            {pendingBookings.length === 0 ? (
              <div className="empty-state-card">
                <FaClock size={48} style={{ color: '#334155', marginBottom: '1.5rem' }} />
                <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No Pending Approvals</h4>
                <p style={{ color: '#94a3b8' }}>When someone books your tools, requests will appear here.</p>
              </div>
            ) : (
              <Row className="g-4">
                {pendingBookings.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card">
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 style={{ color: '#f1f5f9', fontWeight: 600 }}>{booking.itemName}</h5>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="mb-3">
                          <div className="info-row">
                            <FaUser size={14} />
                            <span>{booking.borrowerName}</span>
                          </div>
                          <div className="info-row">
                            <FaCalendarAlt size={14} />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          <div className="info-row">
                            <FaTools size={14} />
                            <span>Tool ID: #{booking.itemId}</span>
                          </div>
                          {booking.pickupLocation && (
                            <div className="info-row">
                              <FaMapMarkerAlt size={14} />
                              <span>{booking.pickupLocation}</span>
                            </div>
                          )}
                        </div>
                        
                        <hr style={{ borderColor: '#334155' }} />
                        
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ color: '#94a3b8' }}>Total Amount:</span>
                          <span className="price-tag">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        {booking.depositAmount && (
                          <div className="d-flex justify-content-between mb-3">
                            <span style={{ color: '#94a3b8' }}>Deposit:</span>
                            <span className="deposit-tag">₹{booking.depositAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        
                        <div className="d-flex gap-2 mt-3">
                          <Button
                            className="btn-gradient-success flex-grow-1"
                            onClick={() => handleApproveClick(booking)}
                            disabled={processing === booking.id}
                          >
                            {processing === booking.id ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <><FaCheckCircle className="me-1" /> Approve</>
                            )}
                          </Button>
                          <Button
                            className="btn-outline-danger flex-grow-1"
                            onClick={() => handleReject(booking.id)}
                            disabled={processing === booking.id}
                          >
                            <FaTimesCircle className="me-1" /> Reject
                          </Button>
                        </div>
                      </Card.Body>
                      <Card.Footer style={{ 
                        background: '#0f172a', 
                        borderTop: '1px solid #334155',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        padding: '0.75rem 1.5rem'
                      }}>
                        Requested on {formatDate(booking.createdAt)}
                      </Card.Footer>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* Rejected Bookings Tab */}
          <Tab eventKey="rejected" title={
            <span>
              <FaTimesCircle className="me-2" />
              Rejected ({rejectedBookings.length})
            </span>
          }>
            {rejectedBookings.length === 0 ? (
              <div className="empty-state-card">
                <FaTimesCircle size={48} style={{ color: '#334155', marginBottom: '1.5rem' }} />
                <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No Rejected Bookings</h4>
                <p style={{ color: '#94a3b8' }}>Rejected bookings will appear here.</p>
              </div>
            ) : (
              <Row className="g-4">
                {rejectedBookings.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card" style={{ borderColor: '#ef4444' }}>
                      <div style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        padding: '0.75rem 1.5rem',
                        borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
                      }}>
                        <small style={{ color: '#ef4444', fontWeight: 600 }}>Rejected</small>
                      </div>
                      <Card.Body className="p-4">
                        <h5 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '1rem' }}>
                          {booking.itemName}
                        </h5>
                        <div className="mb-3">
                          <div className="info-row">
                            <FaUser size={14} />
                            <span>{booking.borrowerName}</span>
                          </div>
                          <div className="info-row">
                            <FaCalendarAlt size={14} />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                        </div>
                        <Alert style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', 
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '10px',
                          marginBottom: 0
                        }}>
                          <small>This booking has been rejected.</small>
                        </Alert>
                      </Card.Body>
                      <Card.Footer style={{ 
                        background: '#0f172a', 
                        borderTop: '1px solid #334155',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        padding: '0.75rem 1.5rem'
                      }}>
                        Rejected on {formatDate(booking.updatedAt)}
                      </Card.Footer>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* Return Requests Tab */}
          <Tab eventKey="returns" title={
            <span>
              <FaQrcode className="me-2" />
              Returns ({returnRequests.length})
            </span>
          }>
            {returnRequests.length === 0 ? (
              <div className="empty-state-card">
                <FaQrcode size={48} style={{ color: '#334155', marginBottom: '1.5rem' }} />
                <h4 style={{ color: '#f1f5f9', marginBottom: '0.5rem' }}>No Return Requests</h4>
                <p style={{ color: '#94a3b8' }}>When borrowers request to return tools, they'll appear here.</p>
              </div>
            ) : (
              <Row className="g-4">
                {returnRequests.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card" style={{ borderColor: '#3b82f6' }}>
                      <div style={{ 
                        background: 'rgba(59, 130, 246, 0.1)', 
                        padding: '0.75rem 1.5rem',
                        borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <small style={{ color: '#60a5fa', fontWeight: 600 }}>Return Requested</small>
                      </div>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 style={{ color: '#f1f5f9', fontWeight: 600 }}>{booking.itemName}</h5>
                          {getStatusBadge(booking.status)}
                        </div>
                        
                        <div className="mb-3">
                          <div className="info-row">
                            <FaUser size={14} />
                            <span>{booking.borrowerName}</span>
                          </div>
                          <div className="info-row">
                            <FaCalendarAlt size={14} />
                            <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                          </div>
                          <div className="info-row">
                            <FaTools size={14} />
                            <span>Tool ID: #{booking.itemId}</span>
                          </div>
                        </div>
                        
                        <hr style={{ borderColor: '#334155' }} />
                        
                        <div className="d-flex justify-content-between mb-2">
                          <span style={{ color: '#94a3b8' }}>Total Amount:</span>
                          <span className="price-tag">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        {booking.depositAmount && (
                          <div className="d-flex justify-content-between mb-3">
                            <span style={{ color: '#94a3b8' }}>Deposit:</span>
                            <span className="deposit-tag">₹{booking.depositAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        
                        <Alert style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', 
                          color: '#93c5fd',
                          border: '1px solid rgba(59, 130, 246, 0.2)',
                          borderRadius: '10px',
                          marginBottom: '1rem'
                        }}>
                          <small>Borrower has requested to return this item. Please verify the item condition.</small>
                        </Alert>
                        
                        <Button
                          className="btn-gradient-success w-100"
                          onClick={() => handleConfirmReturn(booking.id)}
                          disabled={processing === booking.id}
                        >
                          {processing === booking.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <><FaCheckCircle className="me-1" /> Confirm Return & Release Deposit</>
                          )}
                        </Button>
                      </Card.Body>
                      <Card.Footer style={{ 
                        background: '#0f172a', 
                        borderTop: '1px solid #334155',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        padding: '0.75rem 1.5rem'
                      }}>
                        Return requested on {formatDate(booking.updatedAt)}
                      </Card.Footer>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          {/* My Tools Tab - Now redirects to My Tools page */}
          <Tab 
            eventKey="tools" 
            title={
              <span onClick={handleMyToolsTab} style={{ cursor: 'pointer' }}>
                <FaTools className="me-2" />
                My Tools ({myTools.length})
                <FaExternalLinkAlt className="ms-2" size={10} />
              </span>
            }
          >
            <div className="my-tools-redirect-card">
              <div className="redirect-icon">
                <FaTools size={32} style={{ color: '#60a5fa' }} />
              </div>
              <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>
                Manage Your Tools
              </h4>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                You have <strong style={{ color: '#60a5fa' }}>{myTools.length}</strong> tools listed.
                Go to My Tools page to manage, edit, or add new tools.
              </p>
              <Button 
                className="btn-gradient-primary"
                onClick={handleMyToolsTab}
              >
                Go to My Tools <FaArrowRight className="ms-2" />
              </Button>
            </div>
          </Tab>
        </Tabs>
      </Container>

      {/* Pickup Details Modal */}
      <PickupDetailsModal
        show={showPickupModal}
        onHide={() => setShowPickupModal(false)}
        booking={selectedBooking}
        onConfirm={handleConfirmApproval}
        toolPickupDetails={toolPickupDetails}
      />
    </div>
  );
};

export default OwnerDashboardPage;