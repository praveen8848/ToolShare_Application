import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { FaSearch, FaTimes, FaFilter, FaChevronDown, FaTag, FaTags } from 'react-icons/fa';
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
        setCategories(data.filter(cat => cat.isActive !== false));
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
    return parts.map((part, i) => regex.test(part) ? <mark key={i} style={{ background: 'rgba(16,185,129,0.2)', color: '#34D399', padding: '0 2px', borderRadius: '3px' }}>{part}</mark> : part);
  };

  const handleSearch = () => onFilterChange({ search: localSearch, category: localCategory });
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSearch(); };

  const handleReset = () => {
    setLocalSearch(''); setLocalCategory(''); setCategorySearch('');
    onReset();
  };

  const handleCategorySelect = (categoryId) => {
    setLocalCategory(categoryId);
    setCategorySearch('');
    setShowCategoryDropdown(false);
    onFilterChange({ search: localSearch, category: categoryId });
  };

  const getSelectedCategoryDisplay = () => {
    if (!localCategory) return 'All Categories';
    const category = categories.find(c => c.id == localCategory);
    return category ? `${category.icon || ''} ${category.name}` : 'All Categories';
  };

  return (
    <div className="search-filters">
      <style>
        {`
          .search-filters {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            padding: 1.25rem;
          }
          
          .filter-label {
            color: #A3A3A3;
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .search-input {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 10px;
            padding: 0.6rem 0.9rem;
            font-size: 0.9rem;
            width: 100%;
          }
          
          .search-input:focus {
            border-color: #10B981;
            box-shadow: none;
            outline: none;
            background: #0A0A0A;
            color: #E5E5E5;
          }
          
          .search-input::placeholder { color: #737373; }
          
          .btn-mint {
            background: #10B981;
            color: #121212;
            border: 1px solid #10B981;
            border-radius: 10px;
            padding: 0.6rem 1rem;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .btn-mint:hover { background: #059669; border-color: #059669; color: #121212; }
          
          .btn-outline {
            background: transparent;
            color: #A3A3A3;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            padding: 0.6rem 1rem;
            font-weight: 500;
            font-size: 0.9rem;
            width: 100%;
            transition: all 0.2s;
          }
          
          .btn-outline:hover { border-color: #3A3A3A; color: #E5E5E5; }
          
          .category-selector {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            border-radius: 10px;
            padding: 0.6rem 0.9rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            color: #E5E5E5;
            font-size: 0.9rem;
          }
          
          .category-selector:hover { border-color: #10B981; }
          .category-selector .placeholder { color: #737373; }
          
          .category-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0; right: 0;
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 12px;
            z-index: 1000;
            overflow: hidden;
          }
          
          .dropdown-search {
            padding: 0.6rem;
            border-bottom: 1px solid #2A2A2A;
          }
          
          .dropdown-search-input {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #E5E5E5;
            border-radius: 8px;
            padding: 0.5rem 0.7rem;
            font-size: 0.85rem;
            width: 100%;
          }
          
          .dropdown-search-input:focus {
            border-color: #10B981;
            box-shadow: none;
            outline: none;
          }
          
          .dropdown-search-input::placeholder { color: #737373; }
          
          .category-option {
            padding: 0.6rem 0.9rem;
            cursor: pointer;
            border-bottom: 1px solid #2A2A2A;
            color: #A3A3A3;
            font-size: 0.9rem;
          }
          
          .category-option:last-child { border-bottom: none; }
          .category-option:hover { background: #0A0A0A; color: #34D399; }
          .category-option.selected { background: rgba(16,185,129,0.08); color: #34D399; }
          
          .categories-list { max-height: 250px; overflow-y: auto; }
          
          .categories-list::-webkit-scrollbar { width: 5px; }
          .categories-list::-webkit-scrollbar-track { background: #0A0A0A; }
          .categories-list::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
          
          .active-filters-section {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #2A2A2A;
          }
          
          .active-filters-label {
            color: #737373;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-right: 0.5rem;
          }
          
          .filter-badge {
            background: #0A0A0A;
            border: 1px solid #2A2A2A;
            color: #A3A3A3;
            padding: 0.3rem 0.7rem;
            border-radius: 6px;
            font-size: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 5px;
          }
          
          .badge-remove {
            cursor: pointer;
            color: #737373;
            transition: color 0.2s;
          }
          
          .badge-remove:hover { color: #EF4444; }
          
          .clear-link { color: #34D399; font-size: 0.8rem; cursor: pointer; font-weight: 500; }
          .clear-link:hover { color: #6EE7B7; }
          
          .empty-categories {
            padding: 1.5rem 1rem;
            text-align: center;
            color: #737373;
            font-size: 0.85rem;
          }
        `}
      </style>

      <Row className="align-items-end g-3">
        <Col md={5}>
          <div className="filter-label"><FaSearch size={11} /> Search Tools</div>
          <div className="d-flex gap-2">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name or description..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button className="btn-mint" onClick={handleSearch}><FaSearch size={14} /></Button>
          </div>
        </Col>
        
        <Col md={4}>
          <div className="filter-label"><FaFilter size={11} /> Category</div>
          <div className="position-relative" ref={dropdownRef}>
            <div className="category-selector" onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}>
              <span className={!localCategory ? 'placeholder' : ''}>{getSelectedCategoryDisplay()}</span>
              <FaChevronDown size={11} style={{ color: '#737373' }} />
            </div>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                <div className="dropdown-search">
                  <input type="text" className="dropdown-search-input" placeholder="Type to search..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} autoFocus />
                </div>
                <div className={`category-option ${!localCategory ? 'selected' : ''}`} onClick={() => handleCategorySelect('')}>
                  <FaTags className="me-2" size={12} style={{ color: '#34D399' }} /> All Categories
                </div>
                {filteredCategories.length === 0 ? (
                  <div className="empty-categories"><FaTag size={20} style={{ opacity: 0.3, marginBottom: '0.25rem', display: 'block', margin: '0 auto' }} />No categories found</div>
                ) : (
                  <div className="categories-list">
                    {filteredCategories.map(cat => (
                      <div key={cat.id} className={`category-option ${localCategory == cat.id ? 'selected' : ''}`} onClick={() => handleCategorySelect(cat.id)}>
                        {cat.icon || ''} {categorySearch ? highlightMatch(cat.name, categorySearch) : cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
        
        <Col md={3}>
          <Button className="btn-outline" onClick={handleReset}>
            <FaTimes className="me-2" size={11} /> Reset Filters
          </Button>
        </Col>
      </Row>
      
      {(filters.search || filters.category) && (
        <div className="active-filters-section">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <span className="active-filters-label">Active:</span>
            {filters.search && (
              <span className="filter-badge">
                <FaSearch size={9} style={{ color: '#34D399' }} />
                Search: {filters.search}
                <span className="badge-remove" onClick={() => { setLocalSearch(''); onFilterChange({ search: '', category: filters.category }); }}>
                  <FaTimes size={9} />
                </span>
              </span>
            )}
            {filters.category && (
              <span className="filter-badge">
                <FaTag size={9} style={{ color: '#34D399' }} />
                Category: {categories.find(c => c.id == filters.category)?.name || ''}
                <span className="badge-remove" onClick={() => { setLocalCategory(''); setCategorySearch(''); onFilterChange({ search: filters.search, category: '' }); }}>
                  <FaTimes size={9} />
                </span>
              </span>
            )}
            <span className="clear-link" onClick={handleReset}>Clear all</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;