import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { FaSearch, FaTimes, FaFilter, FaChevronDown } from 'react-icons/fa';
import toolService from '../../services/toolService';

const SearchFilters = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localCategory, setLocalCategory] = useState(filters.category || '');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await toolService.getCategories();
        const activeCategories = data.filter(cat => cat.isActive !== false);
        setCategories(activeCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter categories based on search input
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (cat.icon && cat.icon.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  // Highlight matching text
  const highlightMatch = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-warning bg-opacity-50 px-0">{part}</mark> : part
    );
  };

  const handleSearch = () => {
    onFilterChange({ search: localSearch, category: localCategory });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleReset = () => {
    setLocalSearch('');
    setLocalCategory('');
    setCategorySearch('');
    onReset();
  };

  const handleCategorySelect = (categoryId) => {
    setLocalCategory(categoryId);
    setCategorySearch('');
    setShowCategoryDropdown(false);
    onFilterChange({ search: localSearch, category: categoryId });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id == categoryId);
    return category ? `${category.icon || '📁'} ${category.name}` : '';
  };

  const getSelectedCategoryDisplay = () => {
    if (!localCategory) return 'All Categories';
    const category = categories.find(c => c.id == localCategory);
    return category ? `${category.icon || '📁'} ${category.name}` : 'All Categories';
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        {/* Main Search Row */}
        <Row className="align-items-end">
          <Col md={5} lg={5}>
            <Form.Group>
              <Form.Label>
                <FaSearch className="me-1" /> Search Tools
              </Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  placeholder="Search by name or description..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button variant="primary" className="ms-2" onClick={handleSearch}>
                  <FaSearch />
                </Button>
              </div>
            </Form.Group>
          </Col>
          
          <Col md={4} lg={4}>
            <Form.Group>
              <Form.Label>
                <FaFilter className="me-1" /> Category
              </Form.Label>
              <div className="position-relative" ref={dropdownRef}>
                <div 
                  className="border rounded d-flex align-items-center justify-content-between p-2 bg-white"
                  style={{ cursor: 'pointer', minHeight: '38px' }}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <span className={!localCategory ? 'text-muted' : ''}>
                    {getSelectedCategoryDisplay()}
                  </span>
                  <FaChevronDown size={14} className="text-muted" />
                </div>
                
                {showCategoryDropdown && (
                  <div 
                    className="position-absolute bg-white border rounded shadow-sm"
                    style={{ 
                      top: '100%', 
                      left: 0, 
                      right: 0, 
                      zIndex: 1000,
                      marginTop: '4px'
                    }}
                  >
                    {/* Search Input inside dropdown */}
                    <div className="p-2 border-bottom">
                      <Form.Control
                        type="text"
                        placeholder="Type to search category..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        autoFocus
                        size="sm"
                      />
                    </div>
                    
                    {/* All Categories option */}
                    <div 
                      className="p-2 border-bottom category-option"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCategorySelect('')}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <span>📁 All Categories</span>
                    </div>
                    
                    {/* Categories List */}
                    {filteredCategories.length === 0 ? (
                      <div className="p-3 text-center text-muted">
                        <small>No categories found matching "{categorySearch}"</small>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {filteredCategories.map(cat => (
                          <div 
                            key={cat.id}
                            className="p-2 border-bottom category-option"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCategorySelect(cat.id)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <span>
                              {cat.icon || '📁'} {categorySearch ? highlightMatch(cat.name, categorySearch) : cat.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Form.Group>
          </Col>
          
          <Col md={3} lg={3}>
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={handleReset}
            >
              <FaTimes className="me-1" />
              Reset Filters
            </Button>
          </Col>
        </Row>
        
        {/* Active Filters Display */}
        {(filters.search || filters.category) && (
          <div className="mt-3 pt-2 border-top">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <small className="text-muted me-2">Active filters:</small>
              {filters.search && (
                <Badge bg="primary" className="d-flex align-items-center gap-1">
                  Search: {filters.search}
                  <FaTimes 
                    size={10} 
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                    onClick={() => {
                      setLocalSearch('');
                      onFilterChange({ search: '', category: filters.category });
                    }}
                  />
                </Badge>
              )}
              {filters.category && (
                <Badge bg="success" className="d-flex align-items-center gap-1">
                  Category: {getCategoryName(filters.category)}
                  <FaTimes 
                    size={10} 
                    style={{ cursor: 'pointer', marginLeft: '5px' }}
                    onClick={() => {
                      setLocalCategory('');
                      setCategorySearch('');
                      onFilterChange({ search: filters.search, category: '' });
                    }}
                  />
                </Badge>
              )}
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 ms-2"
                onClick={handleReset}
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;