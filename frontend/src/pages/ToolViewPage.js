import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert, Spinner, Modal } from 'react-bootstrap';
import { 
  FaArrowLeft, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, 
  FaUser, FaRupeeSign, FaImage, FaPhone, FaInfoCircle, FaSearchPlus, FaTags, FaEye 
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

  if (loading) {
    return (
      <Container className="py-5 text-center mt-5">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h5 className="mt-3 text-muted">Loading your tool...</h5>
      </Container>
    );
  }

  if (!tool) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm p-4 text-center">
          <Alert.Heading className="fw-bold">Tool Not Found</Alert.Heading>
          <p>We couldn't find this tool in your inventory.</p>
          <Button variant="outline-danger" className="mt-2 px-4" onClick={() => navigate('/my-tools')}>
            Back to My Tools
          </Button>
        </Alert>
      </Container>
    );
  }

  // FIXED: Format the new location string for the owner view
  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') + (tool.pincode ? ` - ${tool.pincode}` : '');

  return (
    <Container className="py-4">
      <Button 
        variant="link" 
        className="mb-4 text-decoration-none p-0 text-secondary hover-primary d-flex align-items-center"
        onClick={() => navigate('/my-tools')}
      >
        <FaArrowLeft className="me-2" /> Back to Inventory
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
                <h5>No photos uploaded</h5>
              </div>
            </Card>
          )}
        </Col>

        {/* RIGHT COLUMN: MANAGEMENT DASHBOARD */}
        <Col lg={5}>
          <div className="d-flex flex-column h-100">
            {/* Header Info */}
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <Badge bg="light" text="primary" className="mb-2 border border-primary-subtle px-2 py-1">
                    {tool.categoryName || 'Uncategorized'}
                  </Badge>
                  <h2 className="fw-bold mb-1">{tool.name}</h2>
                </div>
                <div>{getStatusBadge(tool.status)}</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="d-flex gap-3 mb-4">
              <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center">
                <FaEye className="text-primary me-2" />
                <span className="fw-semibold me-1">{tool.viewsCount || 0}</span> 
                <span className="text-muted small">Views</span>
              </div>
              <div className="bg-light px-3 py-2 rounded-3 border d-flex align-items-center">
                <FaCalendarAlt className="text-primary me-2" />
                <span className="text-muted small">Listed {formatDate(tool.createdAt)}</span>
              </div>
            </div>

            <hr className="my-0 border-secondary-subtle" />

            <div className="my-4 flex-grow-1">
              {/* Pricing Information */}
              <h5 className="fw-bold mb-3 d-flex align-items-center">
                <FaTags className="me-2 text-primary" /> Pricing Configured
              </h5>
              <div className="bg-white border rounded-4 p-3 shadow-sm mb-4">
                <Row className="g-3">
                  <Col xs={6}>
                    <p className="text-muted small mb-1">Daily Rate</p>
                    <h5 className="fw-bold text-primary mb-0">{formatCurrency(tool.dailyRate)}</h5>
                  </Col>
                  <Col xs={6}>
                    <p className="text-muted small mb-1">Weekly Rate</p>
                    <h6 className="mb-0">{tool.weeklyRate ? formatCurrency(tool.weeklyRate) : '-'}</h6>
                  </Col>
                  <Col xs={6}>
                    <p className="text-muted small mb-1">Monthly Rate</p>
                    <h6 className="mb-0">{tool.monthlyRate ? formatCurrency(tool.monthlyRate) : '-'}</h6>
                  </Col>
                  <Col xs={6}>
                    <p className="text-muted small mb-1">Security Deposit</p>
                    <h6 className="mb-0">{tool.depositAmount ? formatCurrency(tool.depositAmount) : 'None'}</h6>
                  </Col>
                </Row>
              </div>

              {/* Private Settings (Location & Contact) */}
              <h5 className="fw-bold mb-3 d-flex align-items-center">
                <FaInfoCircle className="me-2 text-primary" /> Private Settings
              </h5>
              <div className="bg-light border rounded-4 p-3 mb-4">
                <Alert variant="secondary" className="py-2 px-3 mb-3 border-0 bg-white small">
                  These details are only shared with borrowers <strong>after</strong> you approve their request.
                </Alert>
                
                <div className="mb-3">
                  <strong className="d-flex align-items-center text-dark mb-1">
                    <FaMapMarkerAlt className="me-2 text-muted" /> Public Search Area
                  </strong>
                  <div className="ms-4 text-muted small">{locationString || 'Not specified'}</div>
                </div>

                <div className="mb-3">
                  <strong className="d-flex align-items-center text-dark mb-1">
                    <FaMapMarkerAlt className="me-2 text-muted" /> Exact Pickup Instructions
                  </strong>
                  <div className="ms-4 text-muted small">{tool.pickupInstructions || 'No instructions provided.'}</div>
                </div>

                <div>
                  <strong className="d-flex align-items-center text-dark mb-1">
                    <FaPhone className="me-2 text-muted" /> Contact Info
                  </strong>
                  <div className="ms-4 text-muted small">
                    {tool.ownerContact ? (
                      <>
                        {tool.ownerContact} <Badge bg="secondary" className="ms-1 fw-normal">{tool.contactMethod === 'BOTH' ? 'Call/Text' : tool.contactMethod}</Badge>
                      </>
                    ) : 'No contact provided'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2">Description</h5>
                <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>
                  {tool.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <Card className="border-0 shadow-sm rounded-4 border-top border-4 border-primary">
              <Card.Body className="p-3">
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="flex-grow-1 fw-bold"
                    onClick={() => navigate(`/edit-tool/${tool.id}`)}
                  >
                    <FaEdit className="me-2 mb-1" /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="lg"
                    className="fw-bold px-4"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <FaTrash className="mb-1" />
                  </Button>
                </div>
              </Card.Body>
            </Card>

          </div>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-danger fw-bold">Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="fs-5">Are you sure you want to delete <strong>{tool.name}</strong>?</p>
          <Alert variant="danger" className="border-0 mb-0">
            <FaInfoCircle className="me-2" />
            This action cannot be undone. The tool will be permanently removed from your inventory.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={() => setShowDeleteModal(false)} className="fw-bold px-4">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting} className="fw-bold px-4">
            {deleting ? <><Spinner animation="border" size="sm" className="me-2" /> Deleting...</> : 'Yes, Delete Tool'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="xl">
        <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
        <Modal.Body className="p-0 text-center bg-dark rounded-bottom">
          <Image 
            src={selectedImage} 
            fluid 
            style={{ maxHeight: '85vh', objectFit: 'contain' }}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ToolViewPage;