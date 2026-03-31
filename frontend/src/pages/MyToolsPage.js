import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toolService from '../services/toolService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

const MyToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMyTools();
  }, []);

  const loadMyTools = async () => {
    setLoading(true);
    try {
      const data = await toolService.getMyTools();
      setTools(data);
    } catch (error) {
      toast.error('Failed to load your tools');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return;
    
    setDeleting(id);
    try {
      await toolService.deleteTool(id);
      toast.success('Tool deleted successfully');
      loadMyTools();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tool');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your tools...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Tools</h2>
        <Button variant="primary" onClick={() => navigate('/add-tool')}>
          <FaPlus className="me-2" />
          List New Tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FaTools size={50} className="text-muted mb-3" />
            <h5>No Tools Listed Yet</h5>
            <p className="text-muted">Start sharing your tools with the community.</p>
            <Button variant="primary" onClick={() => navigate('/add-tool')}>
              List Your First Tool
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {tools.map((tool) => (
            <Col key={tool.id} md={6} lg={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                {tool.images && tool.images[0] ? (
                  <Card.Img
                    variant="top"
                    src={tool.images[0]}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                    <FaTools size={40} className="text-muted" />
                  </div>
                )}
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{tool.name}</h5>
                    {getStatusBadge(tool.status)}
                  </div>
                  <p className="text-muted small mb-2">{tool.categoryName || 'Uncategorized'}</p>
                  <p className="text-muted small">{tool.description?.substring(0, 80)}...</p>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-primary fw-bold">{formatCurrency(tool.dailyRate)}/day</span>
                    <small className="text-muted">Listed {formatDate(tool.createdAt)}</small>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => navigate(`/edit-tool/${tool.id}`)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="flex-grow-1"
                      onClick={() => handleDelete(tool.id)}
                      disabled={deleting === tool.id}
                    >
                      {deleting === tool.id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <><FaTrash className="me-1" /> Delete</>
                      )}
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyToolsPage;