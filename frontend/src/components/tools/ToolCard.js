import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import toolService from '../../services/toolService';
import { toast } from 'react-toastify';

const ToolCard = ({ tool, isOwnerView = false, onDelete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': 'success',
      'BORROWED': 'warning',
      'MAINTENANCE': 'danger',
    };
    const labels = {
      'AVAILABLE': 'Available',
      'BORROWED': 'Borrowed',
      'MAINTENANCE': 'Under Maintenance',
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const getRatingStars = (rating) => {
    if (!rating) return '⭐ New';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    return '⭐'.repeat(fullStars) + (hasHalf ? '½' : '') + ` (${rating})`;
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    // If it's owner view (from My Tools page), go to tool view page
    if (isOwnerView || location.pathname === '/my-tools') {
      navigate(`/tools/view/${tool.id}`);
    } else {
      // Default: go to browse tool details page
      navigate(`/tools/${tool.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-tool/${tool.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${tool.name}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleting(true);
    try {
      await toolService.deleteTool(tool.id);
      toast.success('Tool deleted successfully');
      if (onDelete) {
        onDelete(tool.id);
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tool');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="h-100 shadow-sm hover-shadow transition">
      {tool.images && tool.images.length > 0 ? (
        <Card.Img
          variant="top"
          src={tool.images[0]}
          style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
          onClick={handleViewDetails}
        />
      ) : (
        <div 
          className="bg-light d-flex align-items-center justify-content-center" 
          style={{ height: '200px', cursor: 'pointer' }}
          onClick={handleViewDetails}
        >
          <span className="text-muted">No Image</span>
        </div>
      )}
      
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title 
            className="mb-0" 
            style={{ cursor: 'pointer' }}
            onClick={handleViewDetails}
          >
            {tool.name}
          </Card.Title>
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
            <span className="h5 text-primary mb-0">
              {formatCurrency(tool.dailyRate)}
              <small className="text-muted">/day</small>
            </span>
            <Button variant="outline-primary" size="sm" onClick={handleViewDetails}>
              View Details
            </Button>
          </div>
        </div>
      </Card.Body>
      
      <Card.Footer className="bg-white">
        {isOwnerView ? (
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="flex-grow-1"
              onClick={handleEdit}
            >
              <FaEdit className="me-1" /> Edit
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              className="flex-grow-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner animation="border" size="sm" /> : <><FaTrash className="me-1" /> Delete</>}
            </Button>
          </div>
        ) : (
          <div className="d-flex justify-content-between text-muted small">
            <span><FaMapMarkerAlt className="me-1" /> {tool.location || 'Location not specified'}</span>
            <span><FaCalendarAlt className="me-1" /> Listed {new Date(tool.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </Card.Footer>
    </Card>
  );
};

export default ToolCard;