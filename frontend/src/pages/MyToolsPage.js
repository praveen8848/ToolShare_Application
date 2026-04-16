import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Form, Badge } from 'react-bootstrap';
import { 
  FaPlus, 
  FaTools, 
  FaFolderPlus, 
  FaFilter, 
  FaSearch,
  FaRupeeSign,
  FaArrowRight,
  FaBoxes,
  FaTag,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toolService from '../services/toolService';
import categoryService from '../services/categoryService';
import ToolCard from '../components/tools/ToolCard';
import { toast } from 'react-toastify';

const MyToolsPage = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
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
    toast.success('Tool removed successfully');
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
      setShowCategoryModal(false);
      
      const updatedCategories = await categoryService.getAllCategories();
      setCategories(updatedCategories || []);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Filter tools by category AND search query
  const filteredTools = tools.filter(tool => {
    // Category filter
    if (selectedCategory !== 'ALL') {
      const toolCatId = String(tool.categoryId || tool.category?.id);
      if (String(toolCatId) !== String(selectedCategory)) return false;
    }
    
    // Search filter (by name or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = tool.name?.toLowerCase().includes(query);
      const descMatch = tool.description?.toLowerCase().includes(query);
      if (!nameMatch && !descMatch) return false;
    }
    
    return true;
  });

  const calculateTotalValue = () => {
    return tools.reduce((sum, tool) => sum + (tool.dailyRate || 0), 0);
  };

  const calculatePotentialEarnings = () => {
    return tools.reduce((sum, tool) => sum + ((tool.dailyRate || 0) * 15), 0);
  };

  const clearFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'ALL' || searchQuery.trim() !== '';

  if (loading) {
    return (
      <div className="my-tools-wrapper">
        <Container className="py-5 text-center">
          <div className="loading-spinner-wrapper">
            <Spinner animation="border" style={{ color: '#60a5fa', width: '3rem', height: '3rem' }} />
            <p className="mt-3" style={{ color: '#94a3b8' }}>Loading your tools dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  const totalValue = calculateTotalValue();
  const potentialEarnings = calculatePotentialEarnings();
  const categoryCount = new Set(tools.map(t => String(t.categoryId || t.category?.id))).size;

  return (
    <div className="my-tools-wrapper">
      <style>
        {`
          .my-tools-wrapper {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #e2e8f0;
            padding-bottom: 3rem;
            padding-top: 76px; /* Fixed: Prevent navbar overlap */
          }
          
          .loading-spinner-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
          }
          
          .page-header {
            padding: 0 0 1.5rem;
            border-bottom: 1px solid #334155;
            margin-bottom: 2rem;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .stat-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 1.75rem;
            height: 100%;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
            transform: translateY(-2px);
          }
          
          .filter-bar {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .form-select-dark {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-weight: 500;
          }
          
          .form-select-dark:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .form-control-dark {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 1rem;
          }
          
          .form-control-dark:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .form-control-dark::placeholder {
            color: #64748b;
          }
          
          .form-label-dark {
            color: #cbd5e1;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
          }
          
          .btn-gradient-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-gradient-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white;
          }
          
          .btn-gradient-success {
            background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
          }
          
          .btn-gradient-success:hover {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }
          
          .btn-outline-purple {
            background: transparent;
            color: #a78bfa;
            border: 1px solid rgba(167, 139, 250, 0.3);
            border-radius: 12px;
            font-weight: 600;
            padding: 0.7rem 1.5rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-purple:hover {
            background: rgba(167, 139, 250, 0.1);
            border-color: #a78bfa;
            color: #c4b5fd;
          }
          
          .btn-outline-light-custom {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            border-radius: 12px;
            font-weight: 600;
            padding: 0.5rem 1.25rem;
            transition: all 0.3s ease;
          }
          
          .btn-outline-light-custom:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .empty-state-card {
            background: #1e293b;
            border: 2px dashed #334155;
            border-radius: 20px;
            padding: 4rem 2rem;
            text-align: center;
          }
          
          .search-input-wrapper {
            position: relative;
          }
          
          .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
          }
          
          .search-input {
            padding-left: 40px !important;
          }
          
          .active-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #334155;
          }
          
          .filter-badge {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 20px;
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #cbd5e1;
          }
          
          .filter-badge .remove-icon {
            cursor: pointer;
            color: #94a3b8;
            transition: color 0.2s;
          }
          
          .filter-badge .remove-icon:hover {
            color: #ef4444;
          }
          
          .clear-all-link {
            color: #60a5fa;
            font-size: 0.85rem;
            cursor: pointer;
            margin-left: 0.5rem;
          }
          
          .clear-all-link:hover {
            color: #93c5fd;
            text-decoration: underline;
          }
          
          .modal-dark .modal-content {
            background: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
            border-radius: 20px;
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
          
          .results-count {
            color: #94a3b8;
            font-size: 0.9rem;
          }
          
          .results-count strong {
            color: #60a5fa;
          }
        `}
      </style>

      <Container className="py-4">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1 className="fw-extrabold mb-2" style={{ fontSize: '2.5rem' }}>
                <span className="gradient-text">My Tools</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                Manage your listed tools, track performance, and grow your rental business
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                className="btn-outline-purple"
                onClick={() => setShowCategoryModal(true)}
              >
                <FaFolderPlus className="me-2" />
                Create Category
              </Button>
              <Button 
                className="btn-gradient-success"
                onClick={() => navigate('/add-tool')}
              >
                <FaPlus className="me-2" />
                List New Tool
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Overview Section */}
        {tools.length > 0 && (
          <Row className="g-4 mb-4">
            <Col lg={3} md={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Tools
                  </span>
                  <FaBoxes style={{ color: '#60a5fa', fontSize: '1.5rem' }} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {tools.length}
                </h2>
                <p style={{ color: '#10b981', marginBottom: 0, fontSize: '0.9rem' }}>
                  <FaCheckCircle className="me-1" size={12} />
                  Active listings
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Value
                  </span>
                  <FaRupeeSign style={{ color: '#34d399', fontSize: '1.5rem' }} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ₹{totalValue.toLocaleString('en-IN')}
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
                  Daily rate sum
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Potential Monthly
                  </span>
                  <FaRupeeSign style={{ color: '#fbbf24', fontSize: '1.5rem' }} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                  ₹{potentialEarnings.toLocaleString('en-IN')}
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
                  Based on 15 days/month
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="stat-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Categories
                  </span>
                  <FaTag style={{ color: '#a78bfa', fontSize: '1.5rem' }} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {categoryCount}
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: 0, fontSize: '0.9rem' }}>
                  Unique categories
                </p>
              </div>
            </Col>
          </Row>
        )}

        {/* Filter Bar - Category + Search */}
        {tools.length > 0 && (
          <div className="filter-bar">
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaSearch className="me-1" size={12} />
                    Search Tools
                  </Form.Label>
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon" size={14} />
                    <Form.Control
                      type="text"
                      className="form-control-dark search-input"
                      placeholder="Search by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="form-label-dark">
                    <FaFilter className="me-1" size={12} />
                    Filter by Category
                  </Form.Label>
                  <Form.Select 
                    className="form-select-dark"
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="ALL">All Categories ({tools.length} Tools)</option>
                    {categories.map(cat => {
                      const countInCat = tools.filter(t => String(t.categoryId || t.category?.id) === String(cat.id)).length;
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon && `${cat.icon} `}{cat.name} ({countInCat})
                        </option>
                      );
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button 
                  className="btn-outline-light-custom w-100"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  <FaTimes className="me-1" size={12} />
                  Clear
                </Button>
              </Col>
            </Row>
            
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="active-filters">
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Active filters:</span>
                {selectedCategory !== 'ALL' && (
                  <span className="filter-badge">
                    <FaFilter size={10} />
                    Category: {categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Selected'}
                    <FaTimes 
                      size={10} 
                      className="remove-icon"
                      onClick={() => setSelectedCategory('ALL')}
                    />
                  </span>
                )}
                {searchQuery && (
                  <span className="filter-badge">
                    <FaSearch size={10} />
                    Search: "{searchQuery}"
                    <FaTimes 
                      size={10} 
                      className="remove-icon"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
                <span className="clear-all-link" onClick={clearFilters}>
                  Clear all
                </span>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        {tools.length > 0 && (
          <div className="results-count mb-3">
            <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'} found
            {hasActiveFilters && <span> (filtered from {tools.length})</span>}
          </div>
        )}

        {/* Tools Grid Display */}
        {tools.length === 0 ? (
          <div className="empty-state-card">
            <FaTools size={56} style={{ color: '#334155', marginBottom: '1.5rem' }} />
            <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>No Tools Listed Yet</h4>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Start sharing your tools with the community and earn passive income
            </p>
            <Button 
              className="btn-gradient-primary"
              onClick={() => navigate('/add-tool')}
            >
              List Your First Tool <FaArrowRight className="ms-2" />
            </Button>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="empty-state-card">
            <FaSearch size={48} style={{ color: '#334155', marginBottom: '1.5rem' }} />
            <h4 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>No Tools Found</h4>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              No tools match your current filters
            </p>
            <Button 
              className="btn-gradient-primary"
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <Row className="g-4">
            {filteredTools.map((tool) => (
              <Col key={tool.id} md={6} lg={4}>
                <ToolCard 
                  tool={tool} 
                  isOwnerView={true} 
                  onDelete={handleToolDeleted}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className="modal-dark" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h4 style={{ color: '#f1f5f9', fontWeight: 600, margin: 0 }}>
                <FaFolderPlus className="me-2" style={{ color: '#a78bfa' }} />
                Create New Category
              </h4>
              <button
                onClick={() => setShowCategoryModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <Form onSubmit={handleCreateCategory}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark">
                    Category Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    placeholder="e.g., Power Tools"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    autoFocus
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark">
                    Description *
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    className="form-control-dark"
                    placeholder="Brief description of this category"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark">
                    Icon (Emoji)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="form-control-dark"
                    placeholder="e.g., 🔧, 🛠️, ⚡"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  />
                  <Form.Text style={{ color: '#64748b' }}>
                    Add an emoji to make your category stand out
                  </Form.Text>
                </Form.Group>

                <div className="d-flex gap-2 justify-content-end">
                  <Button 
                    className="btn-outline-light-custom"
                    onClick={() => setShowCategoryModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="btn-gradient-primary"
                    type="submit"
                    disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}
                  >
                    {creatingCategory ? (
                      <><Spinner animation="border" size="sm" className="me-2" /> Creating...</>
                    ) : (
                      'Save Category'
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyToolsPage;