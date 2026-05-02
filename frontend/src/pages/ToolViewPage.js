import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner, Modal } from 'react-bootstrap';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, 
  FaRupeeSign, FaPhone, FaInfoCircle, FaEye, FaShieldAlt, FaTools 
} from 'react-icons/fa';
import toolService from '../services/toolService';
import { formatDate } from '../utils/formatters';
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

  useEffect(() => { loadTool(); }, [id]);

  const loadTool = async () => {
    setLoading(true);
    try {
      const data = await toolService.getToolById(id);
      setTool(data);
    } catch (error) {
      toast.error('Failed to load tool details');
      navigate('/my-tools');
    } finally { setLoading(false); }
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
    } finally { setDeleting(false); }
  };

  const getStatusBadge = (status) => {
    const config = {
      'AVAILABLE':   { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)', text: 'Available' },
      'BORROWED':    { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)', text: 'Borrowed' },
      'MAINTENANCE': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)', text: 'Maintenance' },
    };
    const { bg, color, border, text } = config[status] || { bg: 'rgba(115,115,115,0.1)', color: '#737373', border: 'rgba(115,115,115,0.2)', text: status };
    return <span style={{ background: bg, color, border: `1px solid ${border}`, padding: '4px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>{text}</span>;
  };

  if (loading) {
    return (
      <div className="tool-view-wrapper">
        <style>{`.tool-view-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem' }} />
          <p style={{ color: '#A3A3A3', marginTop: '1rem' }}>Loading your tool...</p>
        </Container>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="tool-view-wrapper">
        <style>{`.tool-view-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5">
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '14px', padding: '2rem', color: '#FCA5A5', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <h4>Tool Not Found</h4>
            <p style={{ color: '#A3A3A3', fontSize: '0.9rem' }}>We couldn't find this tool in your inventory.</p>
            <Button style={{ background: '#10B981', color: '#121212', border: 'none', borderRadius: '10px', padding: '0.6rem 1.5rem', fontWeight: 600 }} onClick={() => navigate('/my-tools')}>Back to My Tools</Button>
          </div>
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
          
          .image-container img { width: 100%; height: 100%; object-fit: cover; }
          
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
          
          .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
          
          .stats-row {
            display: flex;
            gap: 0.75rem;
          }
          
          .stat-chip {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            padding: 0.5rem 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.85rem;
          }
          
          .detail-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1rem;
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
          
          .info-row {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
          }
          
          .info-icon {
            width: 34px; height: 34px;
            border-radius: 8px;
            background: rgba(16,185,129,0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #34D399;
            flex-shrink: 0;
          }
          
          .privacy-note {
            background: rgba(16,185,129,0.04);
            border: 1px solid rgba(16,185,129,0.1);
            border-radius: 8px;
            padding: 0.6rem 0.75rem;
            color: #34D399;
            font-size: 0.8rem;
            margin-bottom: 1rem;
          }
          
          .price-tag { color: #34D399; font-weight: 700; }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.25rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
          
          .btn-danger-outline {
            background: transparent;
            color: #EF4444;
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 10px;
            font-weight: 500;
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-danger-outline:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.4); color: #F87171; }
          
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
          
          .modal-dark .modal-content {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            color: #E5E5E5;
          }
          
          .modal-dark .modal-header { border-bottom: 1px solid #2A2A2A; padding: 1.25rem; }
          .modal-dark .modal-footer { border-top: 1px solid #2A2A2A; padding: 1rem 1.25rem; }
          .modal-dark .btn-close { filter: invert(1); }
        `}
      </style>

      <Container className="py-4">
        <button className="back-btn" onClick={() => navigate('/my-tools')}>
          <FaArrowLeft size={14} /> Back to Inventory
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
                <div className="text-center"><FaTools size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} /><h5>No photos uploaded</h5></div>
              </div>
            )}
          </Col>

          <Col lg={5}>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span className="category-badge">{tool.categoryName || 'Uncategorized'}</span>
                  <h2 style={{ color: '#F5F5F5', fontWeight: 700, fontSize: '1.5rem' }}>{tool.name}</h2>
                </div>
                {getStatusBadge(tool.status)}
              </div>
            </div>

            <div className="stats-row mb-4">
              <div className="stat-chip">
                <FaEye size={14} style={{ color: '#34D399' }} />
                <span style={{ color: '#F5F5F5', fontWeight: 600 }}>{tool.viewsCount || 0}</span>
                <span style={{ color: '#A3A3A3', fontSize: '0.8rem' }}>Views</span>
              </div>
              <div className="stat-chip">
                <FaCalendarAlt size={14} style={{ color: '#34D399' }} />
                <span style={{ color: '#A3A3A3', fontSize: '0.8rem' }}>Listed {formatDate(tool.createdAt)}</span>
              </div>
            </div>

            <div className="detail-card">
              <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Pricing</h5>
              <Row className="g-3">
                <Col xs={6}>
                  <p style={{ color: '#A3A3A3', fontSize: '0.8rem', marginBottom: '2px' }}>Daily Rate</p>
                  <h5 className="price-tag mb-0 d-flex align-items-center"><FaRupeeSign size={14} className="me-1" />{tool.dailyRate?.toLocaleString('en-IN') || '0'}</h5>
                </Col>
                <Col xs={6}>
                  <p style={{ color: '#A3A3A3', fontSize: '0.8rem', marginBottom: '2px' }}>Weekly Rate</p>
                  <p style={{ color: '#E5E5E5', marginBottom: 0, fontSize: '0.9rem' }}>{tool.weeklyRate ? <><FaRupeeSign size={10} />{tool.weeklyRate.toLocaleString('en-IN')}</> : '-'}</p>
                </Col>
                <Col xs={6}>
                  <p style={{ color: '#A3A3A3', fontSize: '0.8rem', marginBottom: '2px' }}>Monthly Rate</p>
                  <p style={{ color: '#E5E5E5', marginBottom: 0, fontSize: '0.9rem' }}>{tool.monthlyRate ? <><FaRupeeSign size={10} />{tool.monthlyRate.toLocaleString('en-IN')}</> : '-'}</p>
                </Col>
                <Col xs={6}>
                  <p style={{ color: '#A3A3A3', fontSize: '0.8rem', marginBottom: '2px' }}>Deposit</p>
                  <p style={{ color: '#E5E5E5', marginBottom: 0, fontSize: '0.9rem' }}>{tool.depositAmount ? <><FaRupeeSign size={10} />{tool.depositAmount.toLocaleString('en-IN')}</> : 'None'}</p>
                </Col>
              </Row>
            </div>

            <div className="detail-card">
              <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.75rem' }}>Private Settings</h5>
              <div className="privacy-note"><FaInfoCircle className="me-2" size={12} />These details are only shared after you approve a booking.</div>
              <div className="info-row">
                <div className="info-icon"><FaMapMarkerAlt size={13} /></div>
                <div>
                  <h6 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>Public Area</h6>
                  <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: 0 }}>{locationString || 'Not specified'}</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon"><FaMapMarkerAlt size={13} /></div>
                <div>
                  <h6 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>Pickup Instructions</h6>
                  <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: 0 }}>{tool.pickupInstructions || 'None'}</p>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon"><FaPhone size={13} /></div>
                <div>
                  <h6 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>Contact</h6>
                  <p style={{ color: '#A3A3A3', fontSize: '0.85rem', marginBottom: 0 }}>{tool.ownerContact ? <>{tool.ownerContact} <span style={{ background: '#2A2A2A', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '4px' }}>{tool.contactMethod === 'BOTH' ? 'Call/Text' : tool.contactMethod}</span></> : 'None'}</p>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h5 style={{ color: '#F5F5F5', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Description</h5>
              <p style={{ color: '#A3A3A3', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: 0 }}>{tool.description || 'No description provided.'}</p>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Button className="btn-mint flex-grow-1" onClick={() => navigate(`/edit-tool/${tool.id}`)}><FaEdit className="me-2" size={14} /> Edit Tool</Button>
              <Button className="btn-danger-outline" onClick={() => setShowDeleteModal(true)}><FaTrash size={14} /></Button>
            </div>
          </Col>
        </Row>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="modal-dark">
          <Modal.Header closeButton>
            <Modal.Title style={{ color: '#EF4444', fontWeight: 600, fontSize: '1.1rem' }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: '#E5E5E5' }}>Delete <strong style={{ color: '#F5F5F5' }}>{tool.name}</strong>? This cannot be undone.</p>
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#FCA5A5', fontSize: '0.85rem' }}>This tool will be permanently removed.</div>
          </Modal.Body>
          <Modal.Footer>
            <Button style={{ background: 'transparent', color: '#A3A3A3', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 500, fontSize: '0.85rem' }} onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button style={{ background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.85rem' }} onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner animation="border" size="sm" /> : 'Delete'}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="xl" className="modal-dark">
          <Modal.Header closeButton />
          <Modal.Body className="p-0 text-center" style={{ background: '#0A0A0A' }}>
            <Image src={selectedImage} fluid style={{ maxHeight: '85vh', objectFit: 'contain' }} />
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default ToolViewPage;