import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaArrowLeft, FaBookmark, FaStar, FaTags, FaInfoCircle, FaShieldAlt } from 'react-icons/fa';
import { useTool } from '../hooks/useTools';
import { formatCurrency, formatDate } from '../utils/formatters';
import BookingModal from '../components/bookings/BookingModal';
import { FaRupeeSign } from "react-icons/fa";

const ToolDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, loading, error } = useTool(id);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    return (
      <Badge bg={variants[status] || 'secondary'} className="px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.85rem' }}>
        {status === 'AVAILABLE' ? '🟢 Available' : status === 'BORROWED' ? '🟡 Borrowed' : '🔴 Maintenance'}
      </Badge>
    );
  };

  const getRatingDisplay = (rating) => {
    if (!rating) return <><FaStar className="text-warning mb-1 me-1" /> <span className="fw-semibold">New</span></>;
    return (
      <>
        <FaStar className="text-warning mb-1 me-1" />
        <span className="fw-bold">{parseFloat(rating).toFixed(1)}</span>
      </>
    );
  };

  if (loading) {
    return (
      <Container className="py-5 text-center mt-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h5 className="mt-3 text-muted">Loading tool details...</h5>
      </Container>
    );
  }

  if (error || !tool) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4 text-center">
          <Alert.Heading className="fw-bold">Tool Not Found</Alert.Heading>
          <p>{error || 'The tool you are looking for does not exist or has been removed.'}</p>
          <Button variant="outline-danger" className="mt-2 px-4" onClick={() => navigate('/browse')}>
            Back to Browse
          </Button>
        </Alert>
      </Container>
    );
  }

  // Format the new location string
  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') + (tool.pincode ? ` - ${tool.pincode}` : '');

  return (
    <>
      <Container className="py-4">
        <Button 
          variant="link" 
          className="mb-4 text-decoration-none p-0 text-secondary hover-primary d-flex align-items-center"
          onClick={() => navigate('/browse')}
        >
          <FaArrowLeft className="me-2" /> Back to Search Results
        </Button>
        
        <Row className="g-4">
          {/* LEFT COLUMN: IMAGES */}
          <Col lg={7}>
            {tool.images && tool.images.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                <div 
                  className="position-relative overflow-hidden rounded-4 shadow-sm"
                  style={{ cursor: 'pointer', height: '400px' }}
                  onClick={() => {
                    setSelectedImage(tool.images[0]);
                    setShowImageModal(true);
                  }}
                >
                  <Image
                    src={tool.images[0]}
                    className="w-100 h-100 object-fit-cover transition-transform hover-zoom"
                    alt={tool.name}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-3 bg-gradient-dark-bottom text-white text-end">
                    <small><FaSearchPlus className="me-1"/> Click to expand</small>
                  </div>
                </div>

                {tool.images.length > 1 && (
                  <Row className="g-2 mt-1">
                    {tool.images.slice(1, 4).map((img, idx) => (
                      <Col key={idx} xs={4}>
                        <div 
                          className="rounded-3 overflow-hidden shadow-sm"
                          style={{ height: '100px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedImage(img);
                            setShowImageModal(true);
                          }}
                        >
                          <Image
                            src={img}
                            className="w-100 h-100 object-fit-cover hover-opacity"
                            alt={`${tool.name} ${idx + 1}`}
                          />
                        </div>
                      </Col>
                    ))}
                    {tool.images.length > 4 && (
                      <Col xs={4}>
                        <div 
                          className="rounded-3 overflow-hidden shadow-sm position-relative bg-dark text-white d-flex align-items-center justify-content-center"
                          style={{ height: '100px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedImage(tool.images[4]);
                            setShowImageModal(true);
                          }}
                        >
                          <Image src={tool.images[4]} className="w-100 h-100 object-fit-cover opacity-50" />
                          <div className="position-absolute fw-bold fs-5">+{tool.images.length - 4}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                )}
              </div>
            ) : (
              <Card className="border-0 shadow-sm rounded-4 bg-light text-center d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
                <div className="text-muted">
                  <FaImage size={50} className="mb-3 opacity-50" />
                  <h5>No photos available</h5>
                </div>
              </Card>
            )}
          </Col>
          
          {/* RIGHT COLUMN: DETAILS & BOOKING */}
          <Col lg={5}>
            <div className="d-flex flex-column h-100">
              {/* Header Info */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <Badge bg="light" text="primary" className="mb-2 border border-primary-subtle px-2 py-1">
                      {tool.categoryName || 'General'}
                    </Badge>
                    <h1 className="fw-bold mb-1">{tool.name}</h1>
                  </div>
                </div>
                
                <div className="d-flex align-items-center text-muted gap-3 mt-2">
                  <span className="d-flex align-items-center bg-light px-2 py-1 rounded">
                    {getRatingDisplay(tool.ownerRating)}
                  </span>
                  <span><FaUser className="me-1 mb-1" /> {tool.ownerName}</span>
                </div>
              </div>

              <hr className="my-2 border-secondary-subtle" />

              {/* Description & Specs */}
              <div className="my-3 flex-grow-1">
                <h5 className="fw-bold mb-3">About this tool</h5>
                <p className="text-secondary lh-lg" style={{ whiteSpace: 'pre-line' }}>
                  {tool.description || 'The owner hasn\'t provided a detailed description yet.'}
                </p>

                <div className="mt-4 bg-light p-3 rounded-4 border">
                  <div className="d-flex align-items-start mb-3">
                    <FaMapMarkerAlt className="text-primary mt-1 me-3 fs-5" />
                    <div>
                      <h6 className="fw-bold mb-1">Pickup Location</h6>
                      <p className="mb-0 text-muted small">
                        {locationString || 'Location not specified'}
                      </p>
                      {tool.latitude && tool.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${tool.latitude},${tool.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="small text-decoration-none mt-1 d-inline-block"
                        >
                          View approximate area on map
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start">
                    <FaShieldAlt className="text-primary mt-1 me-3 fs-5" />
                    <div>
                      <h6 className="fw-bold mb-1">Privacy Protected</h6>
                      <p className="mb-0 text-muted small">
                        Exact pickup address is hidden. It will be shared with you only after {tool.ownerName} approves your booking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action / Pricing Card */}
              <Card className="border-0 shadow rounded-4 mt-3 border-top border-4 border-primary">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="text-primary fw-bold mb-0 d-flex align-items-center">
                        <FaRupeeSign size={24} className="mt-1" />
                        {tool.dailyRate === 0 ? 'Free' : tool.dailyRate}
                        <span className="fs-6 text-muted fw-normal ms-1 mt-2">/ day</span>
                      </h2>
                      {(tool.weeklyRate || tool.monthlyRate) && (
                        <div className="text-muted small mt-1 fw-medium">
                          {tool.weeklyRate && <span>₹{tool.weeklyRate}/wk </span>}
                          {tool.monthlyRate && <span> • ₹{tool.monthlyRate}/mo</span>}
                        </div>
                      )}
                    </div>
                    <div>{getStatusBadge(tool.status)}</div>
                  </div>

                  {tool.depositAmount > 0 && (
                    <Alert variant="info" className="py-2 px-3 mb-4 rounded-3 border-0 d-flex align-items-center">
                      <FaInfoCircle className="me-2" />
                      <span className="small">Requires a refundable deposit of <strong>₹{tool.depositAmount}</strong></span>
                    </Alert>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold py-3 shadow-sm rounded-3"
                    onClick={() => setShowBookingModal(true)}
                    disabled={tool.status !== 'AVAILABLE'}
                  >
                    {tool.status === 'AVAILABLE' ? (
                      <><FaBookmark className="me-2 mb-1" /> Request to Book</>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </Button>
                  <p className="text-center text-muted small mt-3 mb-0">
                    You won't be charged yet.
                  </p>
                </Card.Body>
              </Card>

            </div>
          </Col>
        </Row>
      </Container>

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="xl">
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="p-0 text-center bg-dark">
          <Image 
            src={selectedImage} 
            fluid 
            style={{ maxHeight: '85vh', objectFit: 'contain' }}
          />
        </Modal.Body>
      </Modal>

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        tool={tool}
      />
    </>
  );
};

// Helper component for missing icons
const FaSearchPlus = ({ className }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M304 192v32c0 6.6-5.4 12-12 12h-56v56c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-56h-56c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h56v-56c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v56h56c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"></path>
  </svg>
);

const FaImage = ({ className, size }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={className} height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"></path>
  </svg>
);

export default ToolDetailsPage;