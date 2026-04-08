import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, Nav, Tab, Badge } from 'react-bootstrap';
import { FaPlus, FaTools, FaFolderPlus, FaFilter, FaChartPie, FaListOl } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import ToolCard from '../components/tools/ToolCard';
import { toast } from 'react-toastify';

const MyToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Layout States
  const [activeTab, setActiveTab] = useState('view-tools');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Category Form State
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: ''
  });
  
  const navigate = useNavigate();
  const loadedRef = useRef(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [toolsData, categoriesData] = await Promise.all([
        toolService.getMyTools(),
        categoryService.getAllCategories()
      ]);

      setTools(toolsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadData();
  }, []);

  const handleToolDeleted = (deletedToolId) => {
    setTools(prevTools => prevTools.filter(tool => tool.id !== deletedToolId));
    toast.info('Tool removed from your list');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
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
      setNewCategory({ name: '', description: '', icon: '' });
      
      setActiveTab('view-tools');
      const updatedCategories = await categoryService.getAllCategories();
      setCategories(updatedCategories || []);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  // --- NEW: Dashboard Statistics Calculations ---
  const getCategoryBreakdown = () => {
    const breakdown = {};
    tools.forEach(tool => {
      const catId = String(tool.categoryId || tool.category?.id);
      const category = categories.find(c => String(c.id) === catId);
      const catName = category ? (category.icon ? `${category.icon} ${category.name}` : category.name) : 'Uncategorized';
      
      breakdown[catName] = (breakdown[catName] || 0) + 1;
    });
    
    // Convert object to sorted array for rendering
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  };

  const filteredTools = tools.filter(tool => {
    if (selectedCategory === 'ALL') return true;
    const toolCatId = tool.categoryId || tool.category?.id; 
    return String(toolCatId) === String(selectedCategory);
  });

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading your dashboard...</p>
      </Container>
    );
  }

  const categoryStats = getCategoryBreakdown();

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Tools Dashboard</h2>

      <Tab.Container 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)}
      >
        {/* Navigation Options */}
        <Nav variant="pills" className="mb-4 gap-2 bg-light p-2 rounded shadow-sm">
          <Nav.Item>
            <Nav.Link eventKey="view-tools" className="d-flex align-items-center cursor-pointer">
              <FaTools className="me-2" /> View My Tools
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="add-tool" className="d-flex align-items-center cursor-pointer" onClick={() => navigate('/add-tool')}>
              <FaPlus className="me-2" /> List New Tool
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="create-category" className="d-flex align-items-center cursor-pointer">
              <FaFolderPlus className="me-2" /> Create Category
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* TAB 1: VIEW TOOLS */}
          <Tab.Pane eventKey="view-tools">
            
            {/* NEW: Statistics Overview Section */}
            {tools.length > 0 && (
              <Row className="mb-4">
                <Col md={4} className="mb-3 mb-md-0">
                  <Card className="h-100 border-0 shadow-sm bg-primary text-white">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center py-4">
                      <FaListOl size={40} className="mb-3 opacity-75" />
                      <h2 className="display-5 fw-bold mb-0">{tools.length}</h2>
                      <p className="mb-0 fs-5">Total Tools Listed</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom pt-3 pb-2">
                      <h6 className="mb-0 fw-bold text-muted">
                        <FaChartPie className="me-2" />
                        Tools by Category
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex flex-wrap gap-2">
                        {categoryStats.map(([categoryName, count]) => (
                          <div 
                            key={categoryName} 
                            className="p-2 border rounded d-flex justify-content-between align-items-center flex-grow-1"
                            style={{ minWidth: '150px', flexBasis: 'calc(33.333% - 0.5rem)' }}
                          >
                            <span className="text-truncate me-2 fw-medium">{categoryName}</span>
                            <Badge bg="secondary" pill className="fs-6">{count}</Badge>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Category Filter Toolbar */}
            {tools.length > 0 && (
              <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body className="py-3 d-flex align-items-center">
                  <FaFilter className="text-muted me-3" />
                  <Form.Group className="mb-0 d-flex align-items-center gap-3 w-100">
                    <Form.Label className="mb-0 fw-bold text-nowrap">Filter by Category:</Form.Label>
                    <Form.Select 
                      style={{ maxWidth: '300px' }}
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="ALL">All Categories ({tools.length} Tools)</option>
                      {categories.map(cat => {
                        // Find how many tools are in this specific category for the dropdown label
                        const countInCat = tools.filter(t => String(t.categoryId || t.category?.id) === String(cat.id)).length;
                        return (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon && `${cat.icon} `}{cat.name} ({countInCat})
                          </option>
                        );
                      })}
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>
            )}

            {/* Tools Grid Display */}
            {tools.length === 0 ? (
              <Card className="text-center py-5 shadow-sm border-0">
                <Card.Body>
                  <FaTools size={50} className="text-muted mb-3" />
                  <h5>No Tools Listed Yet</h5>
                  <p className="text-muted">Start sharing your tools with the community.</p>
                  <Button variant="primary" onClick={() => navigate('/add-tool')}>
                    List Your First Tool
                  </Button>
                </Card.Body>
              </Card>
            ) : filteredTools.length === 0 ? (
              <Card className="text-center py-5 shadow-sm border-0 bg-light">
                <Card.Body>
                  <p className="text-muted mb-0">No tools found in this category.</p>
                  <Button variant="link" onClick={() => setSelectedCategory('ALL')}>
                    Clear Filter
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {filteredTools.map((tool) => (
                  <Col key={tool.id} md={6} lg={4} className="mb-4">
                    <ToolCard 
                      tool={tool} 
                      isOwnerView={true} 
                      onDelete={handleToolDeleted}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </Tab.Pane>

          {/* TAB 2: CREATE CATEGORY */}
          <Tab.Pane eventKey="create-category">
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                    <h4 className="mb-0">
                      <FaFolderPlus className="me-2 text-primary" />
                      Create New Category
                    </h4>
                  </Card.Header>
                  <Card.Body className="p-4">
                    <Form onSubmit={handleCreateCategory}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Category Name *</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., Power Tools"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                          autoFocus
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Description *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Brief description of this category"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Icon (Emoji)</Form.Label>
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

                      <div className="d-flex gap-2 justify-content-end">
                        <Button variant="light" onClick={() => setActiveTab('view-tools')}>
                          Cancel
                        </Button>
                        <Button 
                          variant="primary" 
                          type="submit"
                          disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}
                        >
                          {creatingCategory ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                          Save Category
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default MyToolsPage;