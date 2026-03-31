import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { FaSearch, FaTimes } from 'react-icons/fa';
import toolService from '../../services/toolService';

const SearchFilters = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localCategory, setLocalCategory] = useState(filters.category || '');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await toolService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

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
    onReset();
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <Row className="align-items-end">
          <Col md={6} lg={5}>
            <Form.Group>
              <Form.Label>Search Tools</Form.Label>
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
          
          <Col md={4} lg={3}>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={localCategory}
                onChange={(e) => setLocalCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              className="w-100"
              onClick={handleReset}
            >
              <FaTimes className="me-1" />
              Reset
            </Button>
          </Col>
        </Row>
        
        {/* Active Filters Display */}
        {(filters.search || filters.category) && (
          <div className="mt-3 pt-2 border-top">
            <small className="text-muted me-2">Active filters:</small>
            {filters.search && (
              <Badge bg="info" className="me-1">Search: {filters.search}</Badge>
            )}
            {filters.category && (
              <Badge bg="info" className="me-1">
                Category: {categories.find(c => c.id == filters.category)?.name}
              </Badge>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default SearchFilters;