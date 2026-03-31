import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const ToolCard = ({ tool }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getRatingStars = (rating) => {
    if (!rating) return '⭐ New';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalf ? '½' : '') + ` (${rating})`;
  };

  const handleViewDetails = () => {
    navigate(`/tools/${tool.id}`);
  };

  return (
    <Card className="h-100 shadow-sm hover-shadow transition" style={{ cursor: 'pointer' }} onClick={handleViewDetails}>
      {tool.images && tool.images.length > 0 ? (
        <Card.Img
          variant="top"
          src={tool.images[0]}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      ) : (
        <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
          <span className="text-muted">No Image</span>
        </div>
      )}
      
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="mb-0">{tool.name}</Card.Title>
          {getStatusBadge(tool.status)}
        </div>
        
        <div className="mb-2">
          <small className="text-muted">{tool.categoryName || 'Uncategorized'}</small>
        </div>
        
        <div className="mb-2">
          <span className="text-warning me-1">
            {getRatingStars(tool.ownerRating)}
          </span>
          <small className="text-muted">{tool.ownerName}</small>
        </div>
        
        <Card.Text className="text-muted small">
          {tool.description && tool.description.length > 100
            ? `${tool.description.substring(0, 100)}...`
            : tool.description || 'No description available'}
        </Card.Text>
        
        <div className="mt-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5 text-primary mb-0">{formatCurrency(tool.dailyRate)}<small className="text-muted">/day</small></span>
            <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}>
              View Details
            </Button>
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-white text-muted small">
        <div className="d-flex justify-content-between">
          <span><FaMapMarkerAlt className="me-1" /> {tool.location || 'Location not specified'}</span>
          <span><FaCalendarAlt className="me-1" /> Listed {new Date(tool.createdAt).toLocaleDateString()}</span>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ToolCard;