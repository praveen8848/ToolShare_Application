import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Image, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaRupeeSign, FaImage } from 'react-icons/fa';
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
    const labels = {
      'AVAILABLE': 'Available',
      'BORROWED': 'Borrowed',
      'MAINTENANCE': 'Under Maintenance',
    };
    return <Badge bg={variants[status] || 'secondary'} className="ms-2">{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading tool details...</p>
      </Container>
    );
  }

  if (!tool) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Tool not found</Alert>
        <Button variant="primary" onClick={() => navigate('/my-tools')}>
          Back to My Tools
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Button 
        variant="link" 
        className="mb-3 text-decoration-none"
        onClick={() => navigate('/my-tools')}
      >
        <FaArrowLeft className="me-1" /> Back to My Tools
      </Button>

      <Row>
        {/* Images Section */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            {tool.images && tool.images.length > 0 ? (
              <>
                <div 
                  className="position-relative"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedImage(tool.images[0]);
                    setShowImageModal(true);
                  }}
                >
                  <Image
                    src={tool.images[0]}
                    fluid
                    className="rounded-top"
                    style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                  />
                </div>
                {tool.images.length > 1 && (
                  <div className="d-flex p-2 gap-2 overflow-auto">
                    {tool.images.slice(1, 5).map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        thumbnail
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          objectFit: 'cover', 
                          cursor: 'pointer' 
                        }}
                        onClick={() => {
                          setSelectedImage(img);
                          setShowImageModal(true);
                        }}
                      />
                    ))}
                    {tool.images.length > 5 && (
                      <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ width: '80px', height: '80px' }}>
                        <small>+{tool.images.length - 5} more</small>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-light text-center py-5 rounded">
                <FaImage size={50} className="text-muted mb-2" />
                <p className="text-muted">No images available</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Tool Details Section */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="mb-0">{tool.name}</h2>
                {getStatusBadge(tool.status)}
              </div>

              <div className="mb-3">
                <span className="text-muted">Category: </span>
                <strong>{tool.categoryName || 'Uncategorized'}</strong>
              </div>

              <div className="mb-3">
                <h5 className="text-primary">
                  <FaRupeeSign className="me-1" />
                  {formatCurrency(tool.dailyRate)}<small className="text-muted fs-6">/day</small>
                </h5>
                {tool.weeklyRate && (
                  <small className="text-muted">
                    {formatCurrency(tool.weeklyRate)}/week | {formatCurrency(tool.monthlyRate)}/month
                  </small>
                )}
              </div>

              <div className="mb-3">
                <p><FaMapMarkerAlt className="me-2 text-muted" /> {tool.location || 'Location not specified'}</p>
                <p><FaCalendarAlt className="me-2 text-muted" /> Listed on {formatDate(tool.createdAt)}</p>
                <p><FaUser className="me-2 text-muted" /> Views: {tool.viewsCount || 0} times</p>
              </div>

              {tool.depositAmount > 0 && (
                <Alert variant="info" className="mb-3">
                  <strong>Deposit:</strong> {formatCurrency(tool.depositAmount)} (refundable upon return)
                </Alert>
              )}

              <div className="mb-4">
                <h5>Description</h5>
                <p className="text-muted">{tool.description || 'No description provided.'}</p>
              </div>

              <hr />

              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  className="flex-grow-1"
                  onClick={() => navigate(`/edit-tool/${tool.id}`)}
                >
                  <FaEdit className="me-2" />
                  Edit Tool
                </Button>
                <Button
                  variant="outline-danger"
                  className="flex-grow-1"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrash className="me-2" />
                  Delete Tool
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{tool.name}</strong>?</p>
          <p className="text-muted small">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner animation="border" size="sm" /> : 'Delete Tool'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Fullscreen Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered size="lg">
        <Modal.Body className="p-0">
          <Image 
            src={selectedImage} 
            fluid 
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ToolViewPage;