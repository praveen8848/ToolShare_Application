import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert, Spinner, Modal } from 'react-bootstrap';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaRupeeSign, FaImage, FaPhone, FaInfoCircle, FaSearchPlus, 
  FaTags, FaEye, FaShieldAlt, FaCheckCircle, FaTools 
} from 'react-icons/fa';
import toolService from '../services/toolService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const ToolViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadTool();
  }, [id]);

  const loadTool = async () => {
    setLoading(true);
    try {
      const data = await toolService.getToolById(id);
      setTool(data);
    } catch (error) {
      toast.error('Failed to load tool details');
      navigate('/my-tools');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await toolService.deleteTool(id);
      toast.success('Tool deleted successfully');
      navigate('/my-tools');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tool');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': { bg: '#10b981', color: '#ffffff', text: 'Available', icon: '🟢' },
      'BORROWED': { bg: '#f59e0b', color: '#0f172a', text: 'Borrowed', icon: '🟡' },
      'MAINTENANCE': { bg: '#ef4444', color: '#ffffff', text: 'Maintenance', icon: '🔴' },
    };
    const style = variants[status] || { bg: '#64748b', color: '#ffffff', text: status, icon: '' };
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
        {style.icon} {style.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="tool-view-wrapper">
        <style>
          {`
            .tool-view-wrapper {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              min-height: 100vh;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
          `}
        </style>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '400px' }}>
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <h5 className="mt-3" style={{ color: '#94a3b8' }}>Loading your tool...</h5>
          </div>
        </Container>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="tool-view-wrapper">
        <Container className="py-5">
          <Alert style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '2rem'
          }}>
            <Alert.Heading className="fw-bold">Tool Not Found</Alert.Heading>
            <p>We couldn't find this tool in your inventory.</p>
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
              onClick={() => navigate('/my-tools')}
            >
              Back to My Tools
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') + (tool.pincode ? ` - ${tool.pincode}` : '');

  return (
    <div className="tool-view-wrapper">
      <style>
        {`
          .tool-view-wrapper {
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
            background: transparent;
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
          
          .stats-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 0.75rem 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .pricing-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .private-settings-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          
          .action-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            border-top: 4px solid #3b82f6;
          }
          
          .info-row {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.25rem;
          }
          
          .info-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
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
          
          .btn-edit {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-edit:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-delete {
            background: transparent;
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            font-weight: 600;
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
          }
          
          .btn-delete:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #f87171;
          }
          
          .privacy-alert {
            background: rgba(59, 130, 246, 0.1);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 14px;
            padding: 1rem;
            color: #93c5fd;
            margin-bottom: 1.25rem;
          }
          
          .modal-dark .modal-content {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
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
          
          .price-value {
            color: #60a5fa;
            font-weight: 700;
          }
        `}
      </style>

      <Container className="py-4">
        <button 
          className="back-button"
          onClick={() => navigate('/my-tools')}
        >
          <FaArrowLeft className="me-2" /> Back to Inventory
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
                  <h5>No photos uploaded</h5>
                </div>
              </div>
            )}
          </Col>

          {/* RIGHT COLUMN: MANAGEMENT DASHBOARD */}
          <Col lg={5}>
            <div className="d-flex flex-column h-100">
              {/* Header Info */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <span className="category-badge">
                      {tool.categoryName || 'Uncategorized'}
                    </span>
                    <h2 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>
                      {tool.name}
                    </h2>
                  </div>
                  <div>{getStatusBadge(tool.status)}</div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="d-flex gap-3 mb-4">
                <div className="stats-card">
                  <FaEye style={{ color: '#60a5fa', fontSize: '1.2rem' }} />
                  <div>
                    <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1.1rem' }}>
                      {tool.viewsCount || 0}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', marginLeft: '4px' }}>
                      Views
                    </span>
                  </div>
                </div>
                <div className="stats-card">
                  <FaCalendarAlt style={{ color: '#60a5fa', fontSize: '1.1rem' }} />
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Listed {formatDate(tool.createdAt)}
                  </span>
                </div>
              </div>

              <hr style={{ borderColor: '#334155' }} />

              <div className="my-4 flex-grow-1">
                {/* Pricing Information */}
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#f1f5f9' }}>
                  <FaTags className="me-2" style={{ color: '#60a5fa' }} /> Pricing
                </h5>
                <div className="pricing-card">
                  <Row className="g-3">
                    <Col xs={6}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Daily Rate</p>
                      <h5 className="price-value mb-0 d-flex align-items-center">
                        <FaRupeeSign size={16} className="me-1" />
                        {tool.dailyRate?.toLocaleString('en-IN') || '0'}
                      </h5>
                    </Col>
                    <Col xs={6}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Weekly Rate</p>
                      <h6 style={{ color: '#e2e8f0' }} className="mb-0">
                        {tool.weeklyRate ? (
                          <><FaRupeeSign size={12} className="me-1" />{tool.weeklyRate.toLocaleString('en-IN')}</>
                        ) : '-'}
                      </h6>
                    </Col>
                    <Col xs={6}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Monthly Rate</p>
                      <h6 style={{ color: '#e2e8f0' }} className="mb-0">
                        {tool.monthlyRate ? (
                          <><FaRupeeSign size={12} className="me-1" />{tool.monthlyRate.toLocaleString('en-IN')}</>
                        ) : '-'}
                      </h6>
                    </Col>
                    <Col xs={6}>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Security Deposit</p>
                      <h6 style={{ color: '#e2e8f0' }} className="mb-0">
                        {tool.depositAmount ? (
                          <><FaRupeeSign size={12} className="me-1" />{tool.depositAmount.toLocaleString('en-IN')}</>
                        ) : 'None'}
                      </h6>
                    </Col>
                  </Row>
                </div>

                {/* Private Settings */}
                <h5 className="fw-bold mb-3 d-flex align-items-center" style={{ color: '#f1f5f9' }}>
                  <FaShieldAlt className="me-2" style={{ color: '#60a5fa' }} /> Private Settings
                </h5>
                <div className="private-settings-card">
                  <div className="privacy-alert">
                    <FaInfoCircle className="me-2" />
                    <span>These details are only shared with borrowers <strong>after</strong> you approve their request.</span>
                  </div>
                  
                  <div className="info-row">
                    <div className="info-icon">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <div>
                      <h6 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>Public Search Area</h6>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                        {locationString || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-icon">
                      <FaMapMarkerAlt size={16} />
                    </div>
                    <div>
                      <h6 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>Exact Pickup Instructions</h6>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                        {tool.pickupInstructions || 'No instructions provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-icon">
                      <FaPhone size={16} />
                    </div>
                    <div>
                      <h6 style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '4px' }}>Contact Info</h6>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 0 }}>
                        {tool.ownerContact ? (
                          <>
                            {tool.ownerContact} 
                            <Badge style={{ 
                              background: '#334155', 
                              color: '#94a3b8',
                              marginLeft: '8px',
                              fontWeight: 400
                            }}>
                              {tool.contactMethod === 'BOTH' ? 'Call/Text' : tool.contactMethod}
                            </Badge>
                          </>
                        ) : 'No contact provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <h5 className="fw-bold mb-2" style={{ color: '#f1f5f9' }}>Description</h5>
                  <p style={{ color: '#94a3b8', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                    {tool.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-card">
                <Card.Body className="p-3">
                  <div className="d-flex gap-2">
                    <Button
                      className="btn-edit flex-grow-1"
                      onClick={() => navigate(`/edit-tool/${tool.id}`)}
                    >
                      <FaEdit className="me-2" /> Edit Tool
                    </Button>
                    <Button
                      className="btn-delete"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </div>

            </div>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered
          className="modal-dark"
        >
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#ef4444', fontWeight: 700 }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ fontSize: '1.1rem', color: '#e2e8f0' }}>
              Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{tool.name}</strong>?
            </p>
            <Alert style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px'
            }}>
              <FaInfoCircle className="me-2" />
              This action cannot be undone. The tool will be permanently removed.
            </Alert>
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
              Cancel
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
              onClick={handleDelete} 
              disabled={deleting}
            >
              {deleting ? (
                <><Spinner animation="border" size="sm" className="me-2" /> Deleting...</>
              ) : (
                'Yes, Delete'
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Image Zoom Modal */}
        <Modal 
          show={showImageModal} 
          onHide={() => setShowImageModal(false)} 
          centered 
          size="xl"
          className="modal-dark"
        >
          <Modal.Header closeButton />
          <Modal.Body className="p-0 text-center" style={{ background: '#0f172a' }}>
            <Image 
              src={selectedImage} 
              fluid 
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
            />
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default ToolViewPage;