import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { 
  FaSearch, FaTimes, FaFilter, FaChevronDown, FaTag, FaTags 
} from 'react-icons/fa';
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (cat.icon && cat.icon.toLowerCase().includes(categorySearch.toLowerCase()))
  );

  const highlightMatch = (text, search) => {
    if (!search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
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
    <>
      <style>
        {`
          .filter-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          
          .filter-card .card-body {
            padding: 1.5rem;
          }
          
          .filter-label {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .search-input-wrapper {
            display: flex;
            gap: 8px;
          }
          
          .search-input {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            font-size: 0.95rem;
            flex: 1;
          }
          
          .search-input:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: #0f172a;
            color: #e2e8f0;
            outline: none;
          }
          
          .search-input::placeholder {
            color: #64748b;
          }
          
          .btn-search {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 0.7rem 1.25rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
          
          .btn-search:hover {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
          }
          
          .category-selector {
            background: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #e2e8f0;
          }
          
          .category-selector:hover {
            border-color: #60a5fa;
          }
          
          .category-selector .placeholder {
            color: #64748b;
          }
          
          .category-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            z-index: 1000;
            margin-top: 4px;
            overflow: hidden;
          }
          
          .dropdown-search {
            padding: 0.75rem;
            border-bottom: 1px solid #334155;
          }
          
          .dropdown-search-input {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.9rem;
            width: 100%;
          }
          
          .dropdown-search-input:focus {
            border-color: #60a5fa;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
            outline: none;
            background: #0f172a;
            color: #e2e8f0;
          }
          
          .dropdown-search-input::placeholder {
            color: #64748b;
          }
          
          .category-option {
            padding: 0.7rem 1rem;
            cursor: pointer;
            border-bottom: 1px solid #334155;
            transition: all 0.15s ease;
            color: #cbd5e1;
          }
          
          .category-option:last-child {
            border-bottom: none;
          }
          
          .category-option:hover {
            background: #0f172a;
            color: #60a5fa;
          }
          
          .category-option.selected {
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
          }
          
          .categories-list {
            max-height: 280px;
            overflow-y: auto;
          }
          
          .categories-list::-webkit-scrollbar {
            width: 6px;
          }
          
          .categories-list::-webkit-scrollbar-track {
            background: #0f172a;
          }
          
          .categories-list::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 3px;
          }
          
          .categories-list::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }
          
          .btn-reset {
            background: transparent;
            color: #94a3b8;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 0.7rem 1rem;
            font-weight: 600;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .btn-reset:hover {
            background: #1e293b;
            border-color: #60a5fa;
            color: #e2e8f0;
          }
          
          .active-filters-section {
            margin-top: 1.25rem;
            padding-top: 1.25rem;
            border-top: 1px solid #334155;
          }
          
          .active-filters-label {
            color: #64748b;
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-right: 0.75rem;
          }
          
          .filter-badge {
            background: #0f172a;
            border: 1px solid #334155;
            color: #e2e8f0;
            padding: 0.4rem 0.75rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          
          .filter-badge.search-badge {
            border-color: #60a5fa;
          }
          
          .filter-badge.search-badge .badge-icon {
            color: #60a5fa;
          }
          
          .filter-badge.category-badge {
            border-color: #34d399;
          }
          
          .filter-badge.category-badge .badge-icon {
            color: #34d399;
          }
          
          .badge-remove {
            cursor: pointer;
            color: #94a3b8;
            transition: color 0.2s ease;
            display: flex;
            align-items: center;
            margin-left: 4px;
          }
          
          .badge-remove:hover {
            color: #ef4444;
          }
          
          .clear-all-link {
            color: #60a5fa;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            margin-left: 0.5rem;
            cursor: pointer;
            transition: color 0.2s ease;
          }
          
          .clear-all-link:hover {
            color: #93c5fd;
          }
          
          .search-highlight {
            background: rgba(245, 158, 11, 0.3);
            color: #fbbf24;
            padding: 0 2px;
            border-radius: 3px;
            font-weight: 500;
          }
          
          .empty-categories {
            padding: 2rem 1rem;
            text-align: center;
            color: #64748b;
          }
          
          .empty-categories svg {
            margin-bottom: 0.5rem;
            opacity: 0.5;
          }
        `}
      </style>

      <Card className="filter-card">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={5} lg={5}>
              <Form.Group>
                <div className="filter-label">
                  <FaSearch size={12} />
                  Search Tools
                </div>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name or description..."
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button className="btn-search" onClick={handleSearch}>
                    <FaSearch />
                  </Button>
                </div>
              </Form.Group>
            </Col>
            
            <Col md={4} lg={4}>
              <Form.Group>
                <div className="filter-label">
                  <FaFilter size={12} />
                  Category
                </div>
                <div className="position-relative" ref={dropdownRef}>
                  <div 
                    className="category-selector"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span className={!localCategory ? 'placeholder' : ''}>
                      {getSelectedCategoryDisplay()}
                    </span>
                    <FaChevronDown size={12} style={{ color: '#64748b' }} />
                  </div>
                  
                  {showCategoryDropdown && (
                    <div className="category-dropdown">
                      <div className="dropdown-search">
                        <input
                          type="text"
                          className="dropdown-search-input"
                          placeholder="Type to search category..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                      
                      <div 
                        className={`category-option ${!localCategory ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('')}
                      >
                        <FaTags className="me-2" size={14} style={{ color: '#60a5fa' }} />
                        All Categories
                      </div>
                      
                      {filteredCategories.length === 0 ? (
                        <div className="empty-categories">
                          <FaTag size={24} />
                          <div>No categories found matching "{categorySearch}"</div>
                        </div>
                      ) : (
                        <div className="categories-list">
                          {filteredCategories.map(cat => (
                            <div 
                              key={cat.id}
                              className={`category-option ${localCategory == cat.id ? 'selected' : ''}`}
                              onClick={() => handleCategorySelect(cat.id)}
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
              <Button className="btn-reset" onClick={handleReset}>
                <FaTimes className="me-2" size={12} />
                Reset Filters
              </Button>
            </Col>
          </Row>
          
          {/* Active Filters Display */}
          {(filters.search || filters.category) && (
            <div className="active-filters-section">
              <div className="d-flex align-items-center flex-wrap gap-2">
                <span className="active-filters-label">Active filters:</span>
                
                {filters.search && (
                  <span className="filter-badge search-badge">
                    <FaSearch size={10} className="badge-icon" />
                    <span>Search: {filters.search}</span>
                    <span 
                      className="badge-remove"
                      onClick={() => {
                        setLocalSearch('');
                        onFilterChange({ search: '', category: filters.category });
                      }}
                    >
                      <FaTimes size={10} />
                    </span>
                  </span>
                )}
                
                {filters.category && (
                  <span className="filter-badge category-badge">
                    <FaTag size={10} className="badge-icon" />
                    <span>Category: {getCategoryName(filters.category)}</span>
                    <span 
                      className="badge-remove"
                      onClick={() => {
                        setLocalCategory('');
                        setCategorySearch('');
                        onFilterChange({ search: filters.search, category: '' });
                      }}
                    >
                      <FaTimes size={10} />
                    </span>
                  </span>
                )}
                
                <span className="clear-all-link" onClick={handleReset}>
                  Clear all
                </span>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default SearchFilters;