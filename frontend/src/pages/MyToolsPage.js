import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { FaPlus, FaTools, FaFolderPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import ToolCard from '../components/tools/ToolCard';
import { toast } from 'react-toastify';

const MyToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toolsData, categoriesData] = await Promise.all([
        toolService.getMyTools(),
        toolService.getCategories()
      ]);
      setTools(toolsData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Failed to load your tools');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!newCategory.description.trim()) {
      toast.error('Category description is required');
      return;
    }

    setCreatingCategory(true);
    try {
      await categoryService.createCategory({
        ...newCategory,
        displayOrder: categories.length
      });
      toast.success('Category created successfully!');
      setShowCategoryModal(false);
      setNewCategory({ name: '', description: '', icon: '' });
      const updatedCategories = await toolService.getCategories();
      setCategories(updatedCategories);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
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
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => setShowCategoryModal(true)}>
            <FaFolderPlus className="me-2" />
            Create Category
          </Button>
          <Button variant="primary" onClick={() => navigate('/add-tool')}>
            <FaPlus className="me-2" />
            List New Tool
          </Button>
        </div>
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
              <ToolCard tool={tool} isOwnerView={true} />
            </Col>
          ))}
        </Row>
      )}

      {/* Create Category Modal */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFolderPlus className="me-2" />
            Create New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Power Tools"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief description of this category"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Icon (Emoji)</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 🔧, 🛠️, ⚡"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              />
              <Form.Text className="text-muted">
                Add an emoji to make your category stand out
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateCategory}
            disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}
          >
            {creatingCategory ? <Spinner animation="border" size="sm" /> : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyToolsPage;