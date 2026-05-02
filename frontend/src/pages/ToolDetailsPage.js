import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Image, Alert, Modal, Spinner } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, FaUser, FaArrowLeft, FaBookmark, FaStar, 
  FaInfoCircle, FaShieldAlt, FaRupeeSign, FaCheckCircle, FaTools
} from 'react-icons/fa';
import { useTool } from '../hooks/useTools';
import BookingModal from '../components/bookings/BookingModal';

const ToolDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tool, loading, error } = useTool(id);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const getStatusBadge = (status) => {
    const config = {
      'AVAILABLE':   { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)', text: 'Available Now' },
      'BORROWED':    { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)', text: 'Currently Borrowed' },
      'MAINTENANCE': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)', text: 'Under Maintenance' },
    };
    const { bg, color, border, text } = config[status] || { bg: 'rgba(115,115,115,0.1)', color: '#737373', border: 'rgba(115,115,115,0.2)', text: status };
    return (
      <span style={{ background: bg, color, border: `1px solid ${border}`, padding: '5px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem' }}>
        {text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="tool-details-wrapper">
        <style>{`.tool-details-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem' }} />
          <p style={{ color: '#A3A3A3', marginTop: '1rem' }}>Loading tool details...</p>
        </Container>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="tool-details-wrapper">
        <style>{`.tool-details-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5">
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '2rem', color: '#FCA5A5', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Tool Not Found</h4>
            <p style={{ color: '#A3A3A3', fontSize: '0.9rem' }}>{error || 'This tool does not exist or has been removed.'}</p>
            <Button style={{ background: '#10B981', color: '#121212', border: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600 }} onClick={() => navigate('/browse')}>Back to Browse</Button>
          </div>
        </Container>
      </div>
    );
  }

  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') + (tool.pincode ? ` - ${tool.pincode}` : '');

  return (
    <div className="tool-details-wrapper">
      <style>
        {`
          .tool-details-wrapper {
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 3rem;
            padding-top: 76px;
          }
          
          .back-btn {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            padding: 0.4rem 0.9rem;
            border-radius: 8px;
            font-weight: 500;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            cursor: pointer;
            margin-bottom: 1.5rem;
            transition: all 0.2s;
          }
          
          .back-btn:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .image-container {
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            cursor: pointer;
            height: 380px;
            border: 1px solid #2A2A2A;
          }
          
          .image-container img {
            width: 100%; height: 100%; object-fit: cover;
          }
          
          .image-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 1rem;
            background: linear-gradient(to top, rgba(18,18,18,0.9), transparent);
            color: #A3A3A3;
            font-size: 0.8rem;
          }
          
          .thumbnail {
            border-radius: 10px;
            overflow: hidden;
            height: 90px;
            cursor: pointer;
            border: 1px solid #2A2A2A;
          }
          
          .thumbnail img {
            width: 100%; height: 100%; object-fit: cover;
          }
          
          .detail-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1rem;
          }
          
          .pricing-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.5rem;
          }
          
          .info-row {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          
          .info-icon {
            width: 36px; height: 36px;
            border-radius: 8px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #34D399;
            flex-shrink: 0;
          }
          
          .category-badge {
            background: rgba(16,185,129,0.08);
            border: 1px solid rgba(16,185,129,0.15);
            border-radius: 6px;
            padding: 0.25rem 0.75rem;
            color: #34D399;
            font-size: 0.75rem;
            font-weight: 500;
            display: inline-block;
            margin-bottom: 0.5rem;
          }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            width: 100%;
            transition: all 0.2s;
          }
          
          .btn-mint:hover:not(:disabled) { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { background: #2A2A2A; border-color: #2A2A2A; color: #737373; }
          
          .owner-card {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: #0A0A0A;
            border-radius: 10px;
            border: 1px solid #2A2A2A;
          }
          
          .owner-avatar {
            width: 40px; height: 40px;
            border-radius: 10px;
            background: #10B981;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #121212;
            font-weight: 600;
            font-size: 0.9rem;
          }
          
          .deposit-note {
            background: rgba(16,185,129,0.04);
            border: 1px solid rgba(16,185,129,0.1);
            border-radius: 8px;
            padding: 0.6rem 0.75rem;
            color: #34D399;
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }
          
          .price-tag { color: #34D399; font-weight: 700; }
          
          .modal-dark .modal-content {
            background: #121212;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
          }
          
          .modal-dark .modal-header {
            border-bottom: 1px solid #2A2A2A;
            padding: 0.75rem 1rem;
          }
           
          .modal-dark .btn-close { filter: invert(1); }
          
          .empty-image {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 380px;
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            color: #737373;
          }
        `}
      </style>

      <Container className="py-4">
        <button className="back-btn" onClick={() => navigate('/browse')}>
          <FaArrowLeft size={14} /> Back to Browse
        </button>
        
        <Row className="g-4">
          <Col lg={7}>
            {tool.images && tool.images.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                <div className="image-container" onClick={() => { setSelectedImage(tool.images[0]); setShowImageModal(true); }}>
                  <Image src={tool.images[0]} alt={tool.name} />
                  <div className="image-overlay">Click to expand</div>
                </div>
                {tool.images.length > 1 && (
                  <Row className="g-2">
                    {tool.images.slice(1, 4).map((img, idx) => (
                      <Col key={idx} xs={4}>
                        <div className="thumbnail" onClick={() => { setSelectedImage(img); setShowImageModal(true); }}>
                          <Image src={img} alt={`${tool.name} ${idx + 1}`} />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            ) : (
              <div className="empty-image">
                <div className="text-center">
                  <FaTools size={40} className="mb-3" style={{ opacity: 0.3 }} />
                  <h5>No photos available</h5>
                </div>
              </div>
            )}
          </Col>
          
          <Col lg={5}>
            <div className="d-flex flex-column h-100">
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="category-badge">{tool.categoryName || 'General'}</span>
                    <h1 style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '1.6rem' }}>{tool.name}</h1>
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                
                <div className="owner-card mb-3">
                  <div className="owner-avatar">{tool.ownerName?.charAt(0) || 'O'}</div>
                  <div>
                    <div style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.9rem' }}>{tool.ownerName}</div>
                    <div style={{ color: '#A3A3A3', fontSize: '0.8rem' }}>
                      <FaCheckCircle className="me-1" size={10} style={{ color: '#34D399' }} />
                      Verified Owner
                      {tool.ownerRating && <span className="ms-2"><FaStar size={10} style={{ color: '#FBBF24' }} /> {parseFloat(tool.ownerRating).toFixed(1)}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>About this tool</h5>
                <p style={{ color: '#A3A3A3', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                  {tool.description || 'The owner hasn\'t provided a detailed description yet.'}
                </p>
                <hr style={{ borderColor: '#2A2A2A', margin: '1rem 0' }} />
                <div className="info-row">
                  <div className="info-icon"><FaMapMarkerAlt size={14} /></div>
                  <div>
                    <h6 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Pickup Location</h6>
                    <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: 0 }}>{locationString || 'Location not specified'}</p>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon"><FaShieldAlt size={14} /></div>
                  <div>
                    <h6 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Privacy Protected</h6>
                    <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: 0 }}>Exact address shared after booking approval</p>
                  </div>
                </div>
              </div>

              <div className="pricing-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="price-tag fw-bold mb-0 d-flex align-items-center">
                    <FaRupeeSign size={20} className="mt-1 me-1" />
                    {tool.dailyRate === 0 ? 'Free' : tool.dailyRate.toLocaleString('en-IN')}
                    <span style={{ color: '#A3A3A3', fontSize: '0.85rem', fontWeight: 400, marginLeft: '4px' }}>/day</span>
                  </h2>
                </div>
                {(tool.weeklyRate || tool.monthlyRate) > 0 && (
                  <div style={{ color: '#737373', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {tool.weeklyRate > 0 && <span>₹{tool.weeklyRate.toLocaleString('en-IN')}/week </span>}
                    {tool.monthlyRate > 0 && <span> • ₹{tool.monthlyRate.toLocaleString('en-IN')}/month</span>}
                  </div>
                )}
                {tool.depositAmount > 0 && (
                  <div className="deposit-note">
                    <FaInfoCircle className="me-2" size={12} />
                    Refundable deposit of <strong>₹{tool.depositAmount.toLocaleString('en-IN')}</strong> required
                  </div>
                )}
                <Button className="btn-mint" onClick={() => setShowBookingModal(true)} disabled={tool.status !== 'AVAILABLE'}>
                  {tool.status === 'AVAILABLE' ? <><FaBookmark className="me-2" size={14} /> Request to Book</> : 'Currently Unavailable'}
                </Button>
                <p style={{ color: '#737373', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.75rem', marginBottom: 0 }}>You won't be charged yet</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="xl" className="modal-dark">
        <Modal.Header closeButton />
        <Modal.Body className="p-0 text-center" style={{ background: '#0A0A0A' }}>
          <Image src={selectedImage} fluid style={{ maxHeight: '85vh', objectFit: 'contain' }} />
        </Modal.Body>
      </Modal>

      <BookingModal show={showBookingModal} onHide={() => setShowBookingModal(false)} tool={tool} />
    </div>
  );
};

export default ToolDetailsPage;