import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Tabs, Tab } from 'react-bootstrap';
import { 
  FaCheckCircle, FaTimesCircle, FaClock, FaTools, FaCalendarAlt, 
  FaUser, FaQrcode, FaRupeeSign, FaMapMarkerAlt, FaStar,
  FaArrowRight, FaExternalLinkAlt
} from 'react-icons/fa';
import ownerService from '../services/ownerService';
import toolService from '../services/toolService';
import { formatDate } from '../utils/formatters';
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
  const [stats, setStats] = useState({ totalEarnings: 0, totalRentals: 0, averageRating: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookings, tools, returns] = await Promise.all([
        ownerService.getPendingBookings(),
        ownerService.getMyTools(),
        ownerService.getReturnRequests()
      ]);
      setPendingBookings(bookings.filter(b => b.status === 'PENDING'));
      setRejectedBookings(bookings.filter(b => b.status === 'REJECTED'));
      setMyTools(tools);
      setReturnRequests(returns);
      const completed = bookings.filter(b => b.status === 'COMPLETED');
      setStats({
        totalEarnings: completed.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        totalRentals: completed.length,
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

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <style>{`.dashboard-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem' }} />
          <p className="mt-3" style={{ color: '#A3A3A3' }}>Loading your dashboard...</p>
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
            background: #121212;
            color: #E5E5E5;
            padding-top: 76px;
          }
          
          .dashboard-header {
            padding: 1rem 0 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            margin-bottom: 1.5rem;
          }

          .dashboard-header h1 { font-weight: 700; color: #F5F5F5; font-size: 2rem; }
          
          .stat-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            height: 100%;
          }
          
          .booking-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
            height: 100%;
          }
          
          .dashboard-tabs {
            border-bottom: 1px solid #2A2A2A;
            gap: 0.25rem;
          }
          
          .dashboard-tabs .nav-link {
            color: #A3A3A3 !important;
            border: none !important;
            padding: 0.6rem 1.25rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.9rem;
          }
          
          .dashboard-tabs .nav-link:hover { color: #34D399 !important; }
          
          .dashboard-tabs .nav-link.active {
            background: #10B981 !important;
            color: #121212 !important;
            font-weight: 600;
          }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 8px;
            font-weight: 600;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            transition: all 0.2s;
          }
          
          .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { opacity: 0.5; }
          
          .btn-outline-danger {
            background: transparent;
            color: #EF4444;
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 8px;
            font-weight: 500;
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
            transition: all 0.2s;
          }
          
          .btn-outline-danger:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.4); color: #F87171; }
          
          .empty-state {
            text-align: center;
            padding: 3rem 2rem;
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
          }
          
          .info-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: #A3A3A3;
            font-size: 0.85rem;
          }
          
          .info-row svg { color: #34D399; font-size: 0.8rem; }
          
          .price-tag {
            color: #34D399;
            font-weight: 700;
            font-size: 1.1rem;
          }
          
          .deposit-tag {
            color: #34D399;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .redirect-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 2.5rem 2rem;
            text-align: center;
          }
          
          .redirect-icon {
            width: 64px; height: 64px;
            border-radius: 12px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            border: 1px solid rgba(16,185,129,0.15);
            color: #34D399;
          }

          .rejected-header {
            background: rgba(239,68,68,0.06);
            padding: 0.5rem 1.25rem;
            border-bottom: 1px solid rgba(239,68,68,0.1);
            color: #EF4444;
            font-weight: 600;
            font-size: 0.8rem;
          }

          .return-header {
            background: rgba(16,185,129,0.06);
            padding: 0.5rem 1.25rem;
            border-bottom: 1px solid rgba(16,185,129,0.1);
            color: #34D399;
            font-weight: 600;
            font-size: 0.8rem;
          }

          .booking-footer {
            background: #0A0A0A;
            border-top: 1px solid #2A2A2A;
            color: #737373;
            font-size: 0.75rem;
            padding: 0.6rem 1.25rem;
          }

          .alert-mint {
            background: rgba(16,185,129,0.06);
            border: 1px solid rgba(16,185,129,0.15);
            border-radius: 8px;
            color: #34D399;
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }

          .alert-red {
            background: rgba(239,68,68,0.06);
            border: 1px solid rgba(239,68,68,0.15);
            border-radius: 8px;
            color: #FCA5A5;
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
        `}
      </style>

      <Container className="py-4">
        
        <div className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <p style={{ color: '#A3A3A3', fontSize: '0.95rem' }}>Manage your tools, bookings, and earnings</p>
        </div>

        <Row className="g-3 mb-4">
          {[
            { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, icon: <FaRupeeSign size={20} />, sub: '↑ 12% from last month' },
            { label: 'Total Rentals', value: stats.totalRentals, icon: <FaTools size={20} />, sub: `${myTools.length} active tools listed` },
            { label: 'Average Rating', value: `${stats.averageRating} ★`, icon: <FaStar size={20} />, sub: `Based on ${stats.totalRentals} reviews` },
          ].map((stat, i) => (
            <Col md={4} key={i}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span style={{ color: '#A3A3A3', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</span>
                  <span style={{ color: '#34D399' }}>{stat.icon}</span>
                </div>
                <h2 style={{ color: '#F5F5F5', fontWeight: 700, marginBottom: '0.25rem', fontSize: '1.5rem' }}>{stat.value}</h2>
                <p style={{ color: '#A3A3A3', marginBottom: 0, fontSize: '0.8rem' }}>{stat.sub}</p>
              </div>
            </Col>
          ))}
        </Row>

        <Tabs defaultActiveKey="pending" className="dashboard-tabs mb-4">
          <Tab eventKey="pending" title={<span><FaClock className="me-2" size={12} /> Pending ({pendingBookings.length})</span>}>
            {pendingBookings.length === 0 ? (
              <div className="empty-state">
                <FaClock size={36} style={{ color: '#737373', marginBottom: '1rem' }} />
                <h4 style={{ color: '#F5F5F5', marginBottom: '0.5rem' }}>No Pending Approvals</h4>
                <p style={{ color: '#A3A3A3', fontSize: '0.9rem' }}>When someone books your tools, requests will appear here.</p>
              </div>
            ) : (
              <Row className="g-3">
                {pendingBookings.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '1rem' }}>{booking.itemName}</h5>
                          <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 500 }}>Pending</span>
                        </div>
                        <div className="info-row"><FaUser size={12} /><span>{booking.borrowerName}</span></div>
                        <div className="info-row"><FaCalendarAlt size={12} /><span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span></div>
                        <div className="info-row"><FaTools size={12} /><span>Tool ID: #{booking.itemId}</span></div>
                        {booking.pickupLocation && <div className="info-row"><FaMapMarkerAlt size={12} /><span>{booking.pickupLocation}</span></div>}
                        <hr style={{ borderColor: '#2A2A2A', margin: '0.75rem 0' }} />
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Total:</span>
                          <span className="price-tag">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        {booking.depositAmount > 0 && (
                          <div className="d-flex justify-content-between mb-2">
                            <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Deposit:</span>
                            <span className="deposit-tag">₹{booking.depositAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="d-flex gap-2 mt-3">
                          <Button className="btn-mint flex-grow-1" onClick={() => handleApproveClick(booking)} disabled={processing === booking.id}>
                            {processing === booking.id ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-1" size={12} /> Approve</>}
                          </Button>
                          <Button className="btn-outline-danger flex-grow-1" onClick={() => handleReject(booking.id)} disabled={processing === booking.id}>
                            <FaTimesCircle className="me-1" size={12} /> Reject
                          </Button>
                        </div>
                      </Card.Body>
                      <div className="booking-footer">Requested on {formatDate(booking.createdAt)}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          <Tab eventKey="rejected" title={<span><FaTimesCircle className="me-2" size={12} /> Rejected ({rejectedBookings.length})</span>}>
            {rejectedBookings.length === 0 ? (
              <div className="empty-state">
                <FaTimesCircle size={36} style={{ color: '#737373', marginBottom: '1rem' }} />
                <h4 style={{ color: '#F5F5F5', marginBottom: '0.5rem' }}>No Rejected Bookings</h4>
                <p style={{ color: '#A3A3A3', fontSize: '0.9rem' }}>Rejected bookings will appear here.</p>
              </div>
            ) : (
              <Row className="g-3">
                {rejectedBookings.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card">
                      <div className="rejected-header">Rejected</div>
                      <Card.Body className="p-3">
                        <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>{booking.itemName}</h5>
                        <div className="info-row"><FaUser size={12} /><span>{booking.borrowerName}</span></div>
                        <div className="info-row"><FaCalendarAlt size={12} /><span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span></div>
                        <div className="alert-red mt-3">This booking has been rejected.</div>
                      </Card.Body>
                      <div className="booking-footer">Rejected on {formatDate(booking.updatedAt)}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          <Tab eventKey="returns" title={<span><FaQrcode className="me-2" size={12} /> Returns ({returnRequests.length})</span>}>
            {returnRequests.length === 0 ? (
              <div className="empty-state">
                <FaQrcode size={36} style={{ color: '#737373', marginBottom: '1rem' }} />
                <h4 style={{ color: '#F5F5F5', marginBottom: '0.5rem' }}>No Return Requests</h4>
                <p style={{ color: '#A3A3A3', fontSize: '0.9rem' }}>When borrowers request to return tools, they'll appear here.</p>
              </div>
            ) : (
              <Row className="g-3">
                {returnRequests.map((booking) => (
                  <Col key={booking.id} md={6} lg={4}>
                    <div className="booking-card">
                      <div className="return-header">Return Requested</div>
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '1rem' }}>{booking.itemName}</h5>
                          <span style={{ background: 'rgba(16,185,129,0.1)', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 500 }}>{booking.status?.replace('_',' ')}</span>
                        </div>
                        <div className="info-row"><FaUser size={12} /><span>{booking.borrowerName}</span></div>
                        <div className="info-row"><FaCalendarAlt size={12} /><span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span></div>
                        <div className="info-row"><FaTools size={12} /><span>Tool ID: #{booking.itemId}</span></div>
                        <hr style={{ borderColor: '#2A2A2A', margin: '0.75rem 0' }} />
                        <div className="d-flex justify-content-between mb-1">
                          <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Total:</span>
                          <span className="price-tag">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        {booking.depositAmount > 0 && (
                          <div className="d-flex justify-content-between mb-2">
                            <span style={{ color: '#A3A3A3', fontSize: '0.85rem' }}>Deposit:</span>
                            <span className="deposit-tag">₹{booking.depositAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="alert-mint">Borrower has requested to return this item. Please verify the item condition.</div>
                        <Button className="btn-mint w-100" onClick={() => handleConfirmReturn(booking.id)} disabled={processing === booking.id}>
                          {processing === booking.id ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle className="me-1" size={12} /> Confirm Return & Release Deposit</>}
                        </Button>
                      </Card.Body>
                      <div className="booking-footer">Return requested on {formatDate(booking.updatedAt)}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Tab>

          <Tab eventKey="tools" title={<span style={{ cursor: 'pointer' }} onClick={() => navigate('/my-tools')}><FaTools className="me-2" size={12} /> My Tools ({myTools.length}) <FaExternalLinkAlt className="ms-2" size={9} /></span>}>
            <div className="redirect-card">
              <div className="redirect-icon"><FaTools size={28} /></div>
              <h4 style={{ color: '#F5F5F5', marginBottom: '0.75rem' }}>Manage Your Tools</h4>
              <p style={{ color: '#A3A3A3', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                You have <strong style={{ color: '#34D399' }}>{myTools.length}</strong> tools listed.
              </p>
              <Button className="btn-mint" onClick={() => navigate('/my-tools')}>Go to My Tools <FaArrowRight className="ms-2" size={12} /></Button>
            </div>
          </Tab>
        </Tabs>
      </Container>

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