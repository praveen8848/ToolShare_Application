import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert, Modal, Spinner } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaArrowLeft, 
  FaBookmark, 
  FaStar, 
  FaTags, 
  FaInfoCircle, 
  FaShieldAlt,
  FaRupeeSign,
  FaPhoneAlt,
  FaCheckCircle,
  FaClock,
  FaTools
} from 'react-icons/fa';
import { useTool } from '../hooks/useTools';
import { formatCurrency, formatDate } from '../utils/formatters';
import BookingModal from '../components/bookings/BookingModal';

const ToolDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, loading, error } = useTool(id);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': { bg: '#10b981', color: '#ffffff', text: 'Available Now' },
      'BORROWED': { bg: '#f59e0b', color: '#0f172a', text: 'Currently Borrowed' },
      'MAINTENANCE': { bg: '#ef4444', color: '#ffffff', text: 'Under Maintenance' },
    };
    const style = variants[status] || { bg: '#64748b', color: '#ffffff', text: status };
    return (
      <Badge style={{ 
        backgroundColor: style.bg, 
        color: style.color,
        padding: '8px 16px',
        borderRadius: '12px',
        fontWeight: 600,
        fontSize: '0.85rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {style.text}
      </Badge>
    );
  };

  const getRatingDisplay = (rating) => {
    if (!rating) return (
      <span style={{ color: '#94a3b8' }}>
        <FaStar className="me-1" style={{ color: '#fbbf24' }} />
        New
      </span>
    );
    return (
      <span style={{ color: '#f1f5f9' }}>
        <FaStar className="me-1" style={{ color: '#fbbf24' }} />
        <span className="fw-bold">{parseFloat(rating).toFixed(1)}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="tool-details-wrapper">
        <style>
          {`
            .tool-details-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
          `}
        </style>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <h5 className="mt-3" style={{ color: '#94a3b8' }}>Loading tool details...</h5>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="tool-details-wrapper">
        <Container className="py-5">
          <Alert style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <Alert.Heading className="fw-bold">Tool Not Found</Alert.Heading>
            <p>{error || 'The tool you are looking for does not exist or has been removed.'}</p>
            <Button 
              className="mt-2"
              style={{
                background: 'transparent',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '0.75rem 2rem',
                fontWeight: 600
              }}
              onClick={() => navigate('/browse')}
            >
              Back to Browse
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') + (tool.pincode ? ` - ${tool.pincode}` : '');

  return (
    <>
      <div className="tool-details-wrapper">
        <style>
          {`
            .tool-details-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              color: #e2e8f0;
              padding-bottom: 3rem;
            }
            
            .back-button {
              color: #94a3b8;
              text-decoration: none;
              padding: 0.5rem 1rem;
              border-radius: 12px;
              transition: all 0.3s ease;
              display: inline-flex;
              align-items: center;
              margin-bottom: 1.5rem;
              border: 1px solid transparent;
            }
            
            .back-button:hover {
              color: #60a5fa;
              background: rgba(59, 130, 246, 0.1);
              border-color: rgba(59, 130, 246, 0.2);
            }
            
            .main-image-container {
              position: relative;
              overflow: hidden;
              border-radius: 20px;
              cursor: pointer;
              height: 400px;
              border: 1px solid #334155;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }
            
            .main-image-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }
            
            .main-image-container:hover img {
              transform: scale(1.05);
            }
            
            .image-overlay {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              padding: 1.5rem;
              background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent);
              color: white;
            }
            
            .thumbnail-container {
              border-radius: 12px;
              overflow: hidden;
              height: 100px;
              cursor: pointer;
              border: 1px solid #334155;
              transition: all 0.3s ease;
            }
            
            .thumbnail-container:hover {
              border-color: #60a5fa;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            
            .thumbnail-container img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }
            
            .thumbnail-container:hover img {
              transform: scale(1.1);
            }
            
            .detail-card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 20px;
              padding: 1.5rem;
              margin-bottom: 1.5rem;
            }
            
            .pricing-card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 20px;
              padding: 1.75rem;
              border-top: 4px solid #3b82f6;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            
            .info-row {
              display: flex;
              align-items: flex-start;
              gap: 1rem;
              margin-bottom: 1.25rem;
            }
            
            .info-icon {
              width: 40px;
              height: 40px;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.2) 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #60a5fa;
              flex-shrink: 0;
            }
            
            .category-badge {
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 20px;
              padding: 0.4rem 1rem;
              color: #60a5fa;
              font-size: 0.85rem;
              font-weight: 500;
              display: inline-block;
              margin-bottom: 0.75rem;
            }
            
            .btn-book {
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
              color: white;
              border: none;
              border-radius: 14px;
              font-weight: 600;
              padding: 1rem 2rem;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            
            .btn-book:hover {
              background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
              color: white;
            }
            
            .btn-book:disabled {
              background: #334155;
              box-shadow: none;
              transform: none;
            }
            
            .deposit-alert {
              background: rgba(59, 130, 246, 0.1);
              border: 1px solid rgba(59, 130, 246, 0.3);
              border-radius: 14px;
              padding: 1rem;
              color: #93c5fd;
            }
            
            .owner-info {
              display: flex;
              align-items: center;
              gap: 1rem;
              padding: 1rem;
              background: #0f172a;
              border-radius: 14px;
              border: 1px solid #334155;
            }
            
            .owner-avatar {
              width: 48px;
              height: 48px;
              border-radius: 14px;
              background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
            }
            
            .price-tag {
              color: #60a5fa;
              font-weight: 700;
            }
            
            .modal-dark .modal-content {
              background: #1e293b;
              color: #e2e8f0;
              border: 1px solid #334155;
            }
            
            .modal-dark .modal-header {
              border-bottom: 1px solid #334155;
            }
            
            .modal-dark .btn-close {
              filter: invert(1);
            }
          `}
        </style>

        <Container className="py-4">
          <button 
            className="back-button"
            onClick={() => navigate('/browse')}
          >
            <FaArrowLeft className="me-2" /> Back to Browse
          </button>
          
          <Row className="g-4">
            {/* LEFT COLUMN: IMAGES */}
            <Col lg={7}>
              {tool.images && tool.images.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  <div 
                    className="main-image-container"
                    onClick={() => {
                      setSelectedImage(tool.images[0]);
                      setShowImageModal(true);
                    }}
                  >
                    <Image src={tool.images[0]} alt={tool.name} />
                    <div className="image-overlay">
                      <small>
                        <FaSearchPlus className="me-1" /> Click to expand
                      </small>
                    </div>
                  </div>

                  {tool.images.length > 1 && (
                    <Row className="g-2 mt-1">
                      {tool.images.slice(1, 4).map((img, idx) => (
                        <Col key={idx} xs={4}>
                          <div 
                            className="thumbnail-container"
                            onClick={() => {
                              setSelectedImage(img);
                              setShowImageModal(true);
                            }}
                          >
                            <Image src={img} alt={`${tool.name} ${idx + 1}`} />
                          </div>
                        </Col>
                      ))}
                      {tool.images.length > 4 && (
                        <Col xs={4}>
                          <div 
                            className="thumbnail-container position-relative"
                            onClick={() => {
                              setSelectedImage(tool.images[4]);
                              setShowImageModal(true);
                            }}
                          >
                            <Image src={tool.images[4]} style={{ opacity: 0.5 }} />
                            <div className="position-absolute top-50 start-50 translate-middle fw-bold fs-5 text-white">
                              +{tool.images.length - 4}
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>
                  )}
                </div>
              ) : (
                <div className="main-image-container d-flex align-items-center justify-content-center" style={{ cursor: 'default' }}>
                  <div className="text-center" style={{ color: '#64748b' }}>
                    <FaTools size={50} className="mb-3 opacity-50" />
                    <h5>No photos available</h5>
                  </div>
                </div>
              )}
            </Col>
            
            {/* RIGHT COLUMN: DETAILS & BOOKING */}
            <Col lg={5}>
              <div className="d-flex flex-column h-100">
                {/* Header Info */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="category-badge">
                        {tool.categoryName || 'General'}
                      </span>
                      <h1 className="fw-bold mb-2" style={{ color: '#f1f5f9', fontSize: '2rem' }}>
                        {tool.name}
                      </h1>
                    </div>
                    {getStatusBadge(tool.status)}
                  </div>
                  
                  {/* Owner Info */}
                  <div className="owner-info mb-3">
                    <div className="owner-avatar">
                      {tool.ownerName?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{tool.ownerName}</span>
                        {getRatingDisplay(tool.ownerRating)}
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 0 }}>
                        <FaCheckCircle className="me-1" size={12} style={{ color: '#10b981' }} />
                        Verified Owner
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description & Details */}
                <div className="detail-card">
                  <h5 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>About this tool</h5>
                  <p style={{ color: '#94a3b8', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {tool.description || 'The owner hasn\'t provided a detailed description yet.'}
                  </p>

                  <hr style={{ borderColor: '#334155', margin: '1.5rem 0' }} />

                  <div className="info-row">
                    <div className="info-icon">
                      <FaMapMarkerAlt size={18} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>Pickup Location</h6>
                      <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                        {locationString || 'Location not specified'}
                      </p>
                      {tool.latitude && tool.longitude && (
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${tool.latitude},${tool.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ 
                            color: '#60a5fa', 
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }}
                        >
                          View on Map →
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-icon">
                      <FaShieldAlt size={18} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1" style={{ color: '#f1f5f9' }}>Privacy Protected</h6>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                        Exact address shared after booking approval
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pricing & Booking Card */}
                <div className="pricing-card">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h2 className="price-tag fw-bold mb-0 d-flex align-items-center">
                        <FaRupeeSign size={24} className="mt-1 me-1" />
                        {tool.dailyRate === 0 ? 'Free' : tool.dailyRate.toLocaleString('en-IN')}
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 400, marginLeft: '4px', marginTop: '8px' }}>
                          / day
                        </span>
                      </h2>
                      {(tool.weeklyRate || tool.monthlyRate) && (
                        <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                          {tool.weeklyRate && <span>₹{tool.weeklyRate.toLocaleString('en-IN')}/week </span>}
                          {tool.monthlyRate && <span> • ₹{tool.monthlyRate.toLocaleString('en-IN')}/month</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {tool.depositAmount > 0 && (
                    <div className="deposit-alert mb-3">
                      <FaInfoCircle className="me-2" />
                      <span>Refundable deposit of <strong>₹{tool.depositAmount.toLocaleString('en-IN')}</strong> required</span>
                    </div>
                  )}

                  <Button
                    className="btn-book w-100"
                    onClick={() => setShowBookingModal(true)}
                    disabled={tool.status !== 'AVAILABLE'}
                  >
                    {tool.status === 'AVAILABLE' ? (
                      <><FaBookmark className="me-2" /> Request to Book</>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </Button>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
                    You won't be charged yet
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Image Modal */}
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          centered 
          size="xl"
          className="modal-dark"
        >
          <Modal.Header closeButton style={{ borderBottom: '1px solid #334155' }} />
          <Modal.Body className="p-0 text-center" style={{ background: '#0f172a' }}>
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
      </div>
    </>
  );
};

// Helper component
const FaSearchPlus = ({ className }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M304 192v32c0 6.6-5.4 12-12 12h-56v56c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-56h-56c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h56v-56c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v56h56c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"></path>
  </svg>
);

export default ToolDetailsPage;