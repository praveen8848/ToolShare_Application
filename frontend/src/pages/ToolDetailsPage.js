import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaArrowLeft, FaBookmark } from 'react-icons/fa';
import { useTool } from '../hooks/useTools';
import { formatCurrency, formatDate } from '../utils/formatters';
import BookingModal from '../components/bookings/BookingModal';

const ToolDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, loading, error } = useTool(id);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'} className="ms-2">{status}</Badge>;
  };

  const getRatingStars = (rating) => {
    if (!rating) return '⭐ New';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalf ? '½' : '') + ` (${rating})`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  if (error || !tool) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Tool</Alert.Heading>
          <p>{error || 'Tool not found'}</p>
          <Button variant="outline-danger" onClick={() => navigate('/browse')}>
            Back to Browse
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-4">
        <Button 
          variant="link" 
          className="mb-3 text-decoration-none"
          onClick={() => navigate('/browse')}
        >
          <FaArrowLeft className="me-1" /> Back to Browse
        </Button>
        
        <Row>
          <Col lg={6} className="mb-4">
            {tool.images && tool.images.length > 0 ? (
              <Card className="border-0 shadow-sm">
                <Image
                  src={tool.images[0]}
                  fluid
                  className="rounded"
                  style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                />
                {tool.images.length > 1 && (
                  <div className="d-flex mt-2 gap-2">
                    {tool.images.slice(1, 4).map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        thumbnail
                        style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="border-0 shadow-sm bg-light text-center py-5">
                <p className="text-muted">No image available</p>
              </Card>
            )}
          </Col>
          
          <Col lg={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h2 className="mb-0">{tool.name}</h2>
                  {getStatusBadge(tool.status)}
                </div>
                
                <div className="mb-3">
                  <span className="text-warning me-2">
                    {getRatingStars(tool.ownerRating)}
                  </span>
                  <span className="text-muted">by {tool.ownerName}</span>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-primary">{formatCurrency(tool.dailyRate)}<small className="text-muted fs-6">/day</small></h5>
                  {tool.weeklyRate && (
                    <small className="text-muted">{formatCurrency(tool.weeklyRate)}/week | {formatCurrency(tool.monthlyRate)}/month</small>
                  )}
                </div>
                
                <div className="mb-3">
                  <p><FaMapMarkerAlt className="me-2 text-muted" /> {tool.location || 'Location not specified'}</p>
                  <p><FaCalendarAlt className="me-2 text-muted" /> Listed on {formatDate(tool.createdAt)}</p>
                  <p><FaUser className="me-2 text-muted" /> Owner since {formatDate(tool.createdAt)}</p>
                </div>
                
                <div className="mb-4">
                  <h5>Description</h5>
                  <p className="text-muted">{tool.description || 'No description provided.'}</p>
                </div>
                
                {tool.depositAmount && (
                  <Alert variant="info" className="mb-3">
                    <strong>Deposit:</strong> {formatCurrency(tool.depositAmount)} (refundable upon return)
                  </Alert>
                )}
                
                <Button
                  variant="success"
                  size="lg"
                  className="w-100"
                  onClick={() => setShowBookingModal(true)}
                  disabled={tool.status !== 'AVAILABLE'}
                >
                  <FaBookmark className="me-2" />
                  {tool.status === 'AVAILABLE' ? 'Book Now' : 'Currently Unavailable'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tool={tool}
      />
    </>
  );
};

export default ToolDetailsPage;