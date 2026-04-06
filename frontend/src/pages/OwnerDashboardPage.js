import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaClock, FaTools, FaCalendarAlt, FaUser, FaQrcode } from 'react-icons/fa';
import ownerService from '../services/ownerService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 

const OwnerDashboardPage = () => {
  const navigate = useNavigate(); 
  const [pendingBookings, setPendingBookings] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [myTools, setMyTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookings, tools, returns] = await Promise.all([
        ownerService.getPendingBookings(),
        ownerService.getMyTools(),
        ownerService.getReturnRequests() // New method
      ]);
      setPendingBookings(bookings);
      setMyTools(tools);
      setReturnRequests(returns);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    setProcessing(bookingId);
    try {
      await ownerService.approveBooking(bookingId);
      toast.success('Booking approved successfully!');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    } finally {
      setProcessing(null);
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
      'PENDING': 'warning',
      'CONFIRMED': 'success',
      'REJECTED': 'danger',
      'RETURN_REQUESTED': 'info',
      'COMPLETED': 'success',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading dashboard...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Owner Dashboard</h2>

      <Tabs defaultActiveKey="pending" className="mb-4">
        <Tab eventKey="pending" title={`Pending Approvals (${pendingBookings.length})`}>
          {pendingBookings.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaClock size={50} className="text-muted mb-3" />
                <h5>No Pending Approvals</h5>
                <p className="text-muted">When someone books your tools, requests will appear here.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {pendingBookings.map((booking) => (
                <Col key={booking.id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="mb-0">{booking.itemName}</h5>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaUser className="text-muted me-2" />
                          <small>Borrower: {booking.borrowerName}</small>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt className="text-muted me-2" />
                          <small>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
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
                      
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleApprove(booking.id)}
                          disabled={processing === booking.id}
                        >
                          {processing === booking.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <><FaCheckCircle className="me-1" /> Approve</>
                          )}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="flex-grow-1"
                          onClick={() => handleReject(booking.id)}
                          disabled={processing === booking.id}
                        >
                          <FaTimesCircle className="me-1" /> Reject
                        </Button>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white text-muted small">
                      Requested on {formatDate(booking.createdAt)}
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

        {/* NEW: Return Requests Tab */}
        <Tab eventKey="returns" title={`Return Requests (${returnRequests.length})`}>
          {returnRequests.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaQrcode size={50} className="text-muted mb-3" />
                <h5>No Return Requests</h5>
                <p className="text-muted">When borrowers request to return tools, they'll appear here.</p>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {returnRequests.map((booking) => (
                <Col key={booking.id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm border-info">
                    <Card.Header className="bg-info text-white">
                      <small>Return Request</small>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="mb-0">{booking.itemName}</h5>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaUser className="text-muted me-2" />
                          <small>Borrower: {booking.borrowerName}</small>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaCalendarAlt className="text-muted me-2" />
                          <small>
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
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
                      
                      <Alert variant="info" className="mb-3">
                        <small>Borrower has requested to return this item. Please verify the item condition and confirm return.</small>
                      </Alert>
                      
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
                    </Card.Body>
                    <Card.Footer className="bg-white text-muted small">
                      Return requested on {formatDate(booking.updatedAt)}
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Tab>

       <Tab eventKey="tools" title={`My Tools (${myTools.length})`}>
          {myTools.length === 0 ? (
            <Card className="text-center py-5">
              <Card.Body>
                <FaTools size={50} className="text-muted mb-3" />
                <h5>No Tools Listed Yet</h5>
                <p className="text-muted">Start listing your tools to share with the community.</p>
                <Button variant="primary" href="/add-tool">
                  List Your First Tool
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {myTools.map((tool) => (
                <Col key={tool.id} md={6} lg={4} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    {tool.images && tool.images[0] && (
                      <Card.Img
                        variant="top"
                        src={tool.images[0]}
                        style={{ height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => navigate(`/tools/view/${tool.id}`)}
                      />
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 
                          className="mb-0 text-primary" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/tools/view/${tool.id}`)}
                        >
                          {tool.name}
                        </h5>
                        <Badge bg={tool.status === 'AVAILABLE' ? 'success' : 'warning'}>
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="text-muted small">{tool.description?.substring(0, 80)}...</p>
                      <div className="d-flex justify-content-between">
                        <span className="text-primary fw-bold">{formatCurrency(tool.dailyRate)}/day</span>
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => navigate(`/tools/view/${tool.id}`)}
                      >
                        Manage Tool
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          </Tab>
      </Tabs>
    </Container>
  );
};

export default OwnerDashboardPage;