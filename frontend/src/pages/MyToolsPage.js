import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner, Form } from 'react-bootstrap';
import { 
  FaPlus, FaTools, FaFolderPlus, FaFilter, FaSearch,
  FaRupeeSign, FaArrowRight, FaBoxes, FaTag, FaCheckCircle, FaTimes
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
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '' });
  
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
    setTools(prev => prev.filter(tool => tool.id !== deletedToolId));
    toast.success('Tool removed successfully');
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return toast.error('Category name is required');
    if (!newCategory.description.trim()) return toast.error('Category description is required');
    setCreatingCategory(true);
    try {
      await categoryService.createCategory({ ...newCategory, displayOrder: categories.length });
      toast.success('Category created!');
      setNewCategory({ name: '', description: '', icon: '' });
      setShowCategoryModal(false);
      const updated = await categoryService.getAllCategories();
      setCategories(updated || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const filteredTools = tools.filter(tool => {
    if (selectedCategory !== 'ALL' && String(tool.categoryId || tool.category?.id) !== String(selectedCategory)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!tool.name?.toLowerCase().includes(q) && !tool.description?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalValue = tools.reduce((sum, t) => sum + (t.dailyRate || 0), 0);
  const potentialEarnings = tools.reduce((sum, t) => sum + ((t.dailyRate || 0) * 15), 0);
  const categoryCount = new Set(tools.map(t => String(t.categoryId || t.category?.id))).size;
  const hasActiveFilters = selectedCategory !== 'ALL' || searchQuery.trim() !== '';

  const clearFilters = () => { setSelectedCategory('ALL'); setSearchQuery(''); };

  if (loading) {
    return (
      <div className="my-tools-wrapper">
        <style>{`.my-tools-wrapper { background: #121212; min-height: 100vh; padding-top: 76px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }`}</style>
        <Container className="py-5 text-center">
          <Spinner animation="border" style={{ color: '#34D399', width: '3rem', height: '3rem' }} />
          <p className="mt-3" style={{ color: '#A3A3A3' }}>Loading your tools...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="my-tools-wrapper">
      <style>
        {`
          .my-tools-wrapper {
            background: #121212;
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #E5E5E5;
            padding-bottom: 3rem;
            padding-top: 76px;
          }
          
          .page-header {
            padding: 0 0 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            margin-bottom: 1.5rem;
          }

          .page-header h1 { font-weight: 700; color: #F5F5F5; font-size: 2rem; }
          
          .stat-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            height: 100%;
          }
          
          .filter-bar {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
            margin-bottom: 1.5rem;
          }
          
          .form-select-dark, .form-control-dark {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 10px;
            padding: 0.6rem 0.9rem;
            font-size: 0.9rem;
          }
          
          .form-select-dark:focus, .form-control-dark:focus {
            border-color: #10B981;
            box-shadow: none;
            background: #0A0A0A;
            color: #E5E5E5;
          }
          
          .form-control-dark::placeholder { color: #737373; }
          
          .form-label-dark {
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0.4rem;
          }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
          .btn-mint:disabled { opacity: 0.5; }
          
          .btn-outline {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            font-weight: 500;
            padding: 0.6rem 1.25rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-outline:hover { border-color: #3A3A3A; color: #E5E5E5; }
          .btn-outline:disabled { opacity: 0.4; }
          
          .btn-outline-mint {
            background: transparent;
            color: #34D399;
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 10px;
            font-weight: 600;
            padding: 0.6rem 1.25rem;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          
          .btn-outline-mint:hover { background: rgba(16, 185, 129, 0.06); border-color: rgba(16, 185, 129, 0.4); color: #6EE7B7; }
          
          .empty-state {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 3rem 2rem;
            text-align: center;
          }
          
          .search-input-wrapper { position: relative; }
          .search-input-wrapper .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #737373;
          }
          .search-input { padding-left: 38px !important; }
          
          .active-filters {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #2A2A2A;
          }
          
          .filter-badge {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 8px;
            padding: 0.3rem 0.7rem;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            color: #A3A3A3;
          }
          
          .filter-badge .remove-icon { cursor: pointer; color: #737373; }
          .filter-badge .remove-icon:hover { color: #EF4444; }
          
          .clear-link { color: #34D399; font-size: 0.8rem; cursor: pointer; margin-left: 0.25rem; font-weight: 500; }
          .clear-link:hover { color: #6EE7B7; }
          
          .results-count { color: #A3A3A3; font-size: 0.85rem; margin-bottom: 1rem; }
          .results-count strong { color: #34D399; }
          
          /* Modal */
          .modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          
          .modal-content-custom {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            width: 90%;
            max-width: 460px;
          }
          
          .modal-header-custom {
            padding: 1.25rem;
            border-bottom: 1px solid #2A2A2A;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .modal-header-custom h4 { color: #F5F5F5; font-weight: 600; margin: 0; font-size: 1.1rem; }
          
          .modal-body-custom { padding: 1.25rem; }
          
          .close-btn {
            background: transparent;
            border: none;
            color: #A3A3A3;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.25rem;
          }
          
          .close-btn:hover { color: #E5E5E5; }
        `}
      </style>

      <Container className="py-4">
        
        <div className="page-header">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h1>My Tools</h1>
              <p style={{ color: '#A3A3A3', fontSize: '0.95rem' }}>Manage your listed tools and track performance</p>
            </div>
            <div className="d-flex gap-2">
              <Button className="btn-outline-mint" onClick={() => setShowCategoryModal(true)}>
                <FaFolderPlus className="me-2" size={14} /> Create Category
              </Button>
              <Button className="btn-mint" onClick={() => navigate('/add-tool')}>
                <FaPlus className="me-2" size={14} /> List New Tool
              </Button>
            </div>
          </div>
        </div>

        {tools.length > 0 && (
          <Row className="g-3 mb-4">
            {[
              { label: 'Total Tools', value: tools.length, icon: <FaBoxes size={20} />, sub: 'Active listings' },
              { label: 'Total Value', value: `₹${totalValue.toLocaleString('en-IN')}`, icon: <FaRupeeSign size={20} />, sub: 'Daily rate sum' },
              { label: 'Potential Monthly', value: `₹${potentialEarnings.toLocaleString('en-IN')}`, icon: <FaRupeeSign size={20} />, sub: 'Based on 15 days/month' },
              { label: 'Categories', value: categoryCount, icon: <FaTag size={20} />, sub: 'Unique categories' },
            ].map((stat, i) => (
              <Col lg={3} md={6} key={i}>
                <div className="stat-card">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span style={{ color: '#A3A3A3', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{stat.label}</span>
                    <span style={{ color: '#34D399' }}>{stat.icon}</span>
                  </div>
                  <h2 style={{ color: '#F5F5F5', fontWeight: 700, marginBottom: '0.25rem', fontSize: '1.5rem' }}>{stat.value}</h2>
                  <p style={{ color: '#A3A3A3', marginBottom: 0, fontSize: '0.8rem' }}>{stat.sub}</p>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {tools.length > 0 && (
          <div className="filter-bar">
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="form-label-dark"><FaSearch size={10} className="me-1" /> Search Tools</Form.Label>
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon" size={13} />
                    <Form.Control type="text" className="form-control-dark search-input" placeholder="Search by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="form-label-dark"><FaFilter size={10} className="me-1" /> Filter by Category</Form.Label>
                  <Form.Select className="form-select-dark" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="ALL">All Categories ({tools.length} Tools)</option>
                    {categories.map(cat => {
                      const count = tools.filter(t => String(t.categoryId || t.category?.id) === String(cat.id)).length;
                      return <option key={cat.id} value={cat.id}>{cat.icon && `${cat.icon} `}{cat.name} ({count})</option>;
                    })}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button className="btn-outline w-100" onClick={clearFilters} disabled={!hasActiveFilters}>
                  <FaTimes size={11} className="me-1" /> Clear
                </Button>
              </Col>
            </Row>
            {hasActiveFilters && (
              <div className="active-filters">
                <span style={{ color: '#737373', fontSize: '0.75rem' }}>Active:</span>
                {selectedCategory !== 'ALL' && (
                  <span className="filter-badge">
                    <FaFilter size={9} /> {categories.find(c => String(c.id) === String(selectedCategory))?.name || 'Selected'}
                    <FaTimes size={9} className="remove-icon" onClick={() => setSelectedCategory('ALL')} />
                  </span>
                )}
                {searchQuery && (
                  <span className="filter-badge">
                    <FaSearch size={9} /> "{searchQuery}"
                    <FaTimes size={9} className="remove-icon" onClick={() => setSearchQuery('')} />
                  </span>
                )}
                <span className="clear-link" onClick={clearFilters}>Clear all</span>
              </div>
            )}
          </div>
        )}

        {tools.length > 0 && (
          <div className="results-count">
            <strong>{filteredTools.length}</strong> {filteredTools.length === 1 ? 'tool' : 'tools'} found
            {hasActiveFilters && <span> (filtered from {tools.length})</span>}
          </div>
        )}

        {tools.length === 0 ? (
          <div className="empty-state">
            <FaTools size={44} style={{ color: '#737373', marginBottom: '1rem' }} />
            <h4 style={{ color: '#F5F5F5', marginBottom: '0.5rem' }}>No Tools Listed Yet</h4>
            <p style={{ color: '#A3A3A3', marginBottom: '1.25rem', fontSize: '0.9rem' }}>Start sharing your tools with the community</p>
            <Button className="btn-mint" onClick={() => navigate('/add-tool')}>List Your First Tool <FaArrowRight className="ms-2" size={12} /></Button>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="empty-state">
            <FaSearch size={40} style={{ color: '#737373', marginBottom: '1rem' }} />
            <h4 style={{ color: '#F5F5F5', marginBottom: '0.5rem' }}>No Tools Found</h4>
            <p style={{ color: '#A3A3A3', marginBottom: '1.25rem', fontSize: '0.9rem' }}>No tools match your current filters</p>
            <Button className="btn-mint" onClick={clearFilters}>Clear All Filters</Button>
          </div>
        ) : (
          <Row className="g-3">
            {filteredTools.map((tool) => (
              <Col key={tool.id} md={6} lg={4}>
                <ToolCard tool={tool} isOwnerView={true} onDelete={handleToolDeleted} />
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h4><FaFolderPlus className="me-2" size={16} style={{ color: '#34D399' }} /> Create New Category</h4>
              <button className="close-btn" onClick={() => setShowCategoryModal(false)}><FaTimes /></button>
            </div>
            <div className="modal-body-custom">
              <Form onSubmit={handleCreateCategory}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Category Name *</Form.Label>
                  <Form.Control type="text" className="form-control-dark" placeholder="e.g., Power Tools" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} autoFocus />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Description *</Form.Label>
                  <Form.Control as="textarea" rows={3} className="form-control-dark" placeholder="Brief description" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark">Icon (Emoji)</Form.Label>
                  <Form.Control type="text" className="form-control-dark" placeholder="e.g., 🔧" value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} />
                </Form.Group>
                <div className="d-flex gap-2 justify-content-end">
                  <Button className="btn-outline" onClick={() => setShowCategoryModal(false)}>Cancel</Button>
                  <Button className="btn-mint" type="submit" disabled={creatingCategory || !newCategory.name.trim() || !newCategory.description.trim()}>
                    {creatingCategory ? <><Spinner animation="border" size="sm" className="me-2" /> Creating...</> : 'Save Category'}
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