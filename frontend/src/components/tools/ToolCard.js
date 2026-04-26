import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { 
  FaStar, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaTrash, 
  FaRupeeSign, FaUser, FaTag, FaEye, FaClock 
} from 'react-icons/fa';
// FIX 1: Added Link to the imports
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import { formatCurrency } from '../../utils/formatters';
import toolService from '../../services/toolService';
import { toast } from 'react-toastify';

const ToolCard = ({ tool, isOwnerView = false, onDelete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  const getStatusBadge = (status) => {
    const variants = {
      'AVAILABLE': { bg: '#10b981', color: '#ffffff', icon: '🟢', text: 'Available' },
      'BORROWED': { bg: '#f59e0b', color: '#0f172a', icon: '🟡', text: 'Borrowed' },
      'MAINTENANCE': { bg: '#ef4444', color: '#ffffff', icon: '🔴', text: 'Maintenance' },
    };
    const style = variants[status] || { bg: '#64748b', color: '#ffffff', icon: '', text: status };
    return (
      <Badge style={{ 
        backgroundColor: style.bg, 
        color: style.color,
        padding: '6px 12px',
        borderRadius: '8px',
        fontWeight: 500,
        fontSize: '0.75rem',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {style.icon} {style.text}
      </Badge>
    );
  };

  const getRatingStars = (rating) => {
    if (!rating) {
      return (
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
          <FaStar className="me-1" style={{ color: '#334155' }} />
          New
        </span>
      );
    }
    return (
      <span style={{ color: '#fbbf24', fontWeight: 500 }}>
        {'★'.repeat(Math.floor(rating))}
        {rating % 1 >= 0.5 ? '½' : ''}
        <span style={{ color: '#94a3b8', marginLeft: '4px' }}>
          ({rating.toFixed(1)})
        </span>
      </span>
    );
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (isOwnerView || location.pathname === '/my-tools') {
      navigate(`/tools/view/${tool.id}`);
    } else {
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

  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') || 'Location not specified';

  return (
    <>
      <style>
        {`
          .tool-card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .tool-card:hover {
            border-color: #60a5fa;
            box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
            transform: translateY(-4px);
          }
          
          .tool-card-image {
            height: 200px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
            background: #0f172a;
          }
          
          .tool-card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .tool-card:hover .tool-card-image img {
            transform: scale(1.05);
          }
          
          .tool-card-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #64748b;
          }
          
          .tool-card-body {
            padding: 1.25rem 1.25rem 0;
            flex: 1;
          }
          
          .tool-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
            gap: 0.5rem;
          }
          
          .tool-card-title {
            color: #f1f5f9;
            font-weight: 700;
            font-size: 1.1rem;
            margin: 0;
            cursor: pointer;
            line-height: 1.4;
            transition: color 0.2s ease;
          }
          
          .tool-card-title:hover {
            color: #60a5fa;
          }
          
          .tool-card-category {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #60a5fa;
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 0.75rem;
          }
          
          .tool-card-owner {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 0.75rem;
            font-size: 0.85rem;
          }
          
          .tool-card-description {
            color: #94a3b8;
            font-size: 0.85rem;
            line-height: 1.6;
            margin-bottom: 1rem;
            min-height: 2.5rem;
          }
          
          .tool-card-pricing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-top: 1px solid #334155;
            margin-top: auto;
          }
          
          .tool-card-price {
            display: flex;
            align-items: baseline;
            gap: 2px;
          }
          
          .price-amount {
            color: #60a5fa;
            font-weight: 700;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
          }
          
          .price-unit {
            color: #64748b;
            font-size: 0.85rem;
            margin-left: 4px;
          }
          
          .btn-view {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0.4rem 1rem;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .btn-view:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .tool-card-footer {
            padding: 0.75rem 1.25rem 1.25rem;
          }
          
          .owner-actions {
            display: flex;
            gap: 0.5rem;
          }
          
          .btn-edit {
            background: transparent;
            color: #60a5fa;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s ease;
            flex: 1;
          }
          
          .btn-edit:hover {
            background: rgba(59, 130, 246, 0.1);
            border-color: #60a5fa;
            color: #93c5fd;
          }
          
          .btn-delete {
            background: transparent;
            color: #ef4444;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 0.4rem 0.75rem;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s ease;
            flex: 1;
          }
          
          .btn-delete:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #f87171;
          }
          
          .btn-delete:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .tool-card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #64748b;
            font-size: 0.75rem;
          }
          
          .tool-card-meta span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .weekly-rate {
            color: #34d399;
            font-size: 0.8rem;
            margin-top: 2px;
          }
          
          .deposit-badge {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 6px;
            padding: 2px 8px;
            color: #34d399;
            font-size: 0.7rem;
            font-weight: 500;
            margin-left: 8px;
          }
        `}
      </style>

      <div className="tool-card">
        {/* Image Section */}
        <div className="tool-card-image" onClick={handleViewDetails}>
          {tool.images && tool.images.length > 0 && imageLoaded ? (
            <img
              src={tool.images[0]}
              alt={tool.name}
              onError={() => setImageLoaded(false)}
            />
          ) : (
            <div className="tool-card-image-placeholder">
              <FaTag size={32} style={{ opacity: 0.5 }} />
            </div>
          )}
        </div>
        
        {/* Body Section */}
        <div className="tool-card-body">
          <div className="tool-card-header">
            <h5 className="tool-card-title" onClick={handleViewDetails}>
              {tool.name}
            </h5>
            {getStatusBadge(tool.status)}
          </div>
          
          <div className="tool-card-category">
            <FaTag size={12} />
            <span>{tool.categoryName || 'Uncategorized'}</span>
          </div>
          
          <div className="tool-card-owner">
            {getRatingStars(tool.ownerRating)}
            <span style={{ color: '#64748b' }}>•</span>
            <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaUser size={12} />
              
              {/* FIX 2: Wrapped the owner name in a Link with hover styling! */}
              {tool.ownerId && !isOwnerView ? (
                <Link 
                  to={`/owner/${tool.ownerId}`} 
                  style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease' }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                  onClick={(e) => e.stopPropagation()} // Prevents the card's view details click
                >
                  {tool.ownerName || 'Unknown Owner'}
                </Link>
              ) : (
                <span>{tool.ownerName || 'Unknown Owner'}</span>
              )}

            </span>
          </div>
          
          <p className="tool-card-description">
            {tool.description && tool.description.length > 80
              ? `${tool.description.substring(0, 80)}...`
              : tool.description || 'No description available'}
          </p>
          
          {/* Pricing Section */}
          <div className="tool-card-pricing">
            <div>
              <div className="tool-card-price">
                <span className="price-amount">
                  <FaRupeeSign size={16} />
                  {tool.dailyRate?.toLocaleString('en-IN') || '0'}
                </span>
                <span className="price-unit">/day</span>
                {tool.depositAmount > 0 && (
                  <span className="deposit-badge">
                    Deposit ₹{tool.depositAmount?.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {tool.weeklyRate && (
                <div className="weekly-rate">
                  <FaRupeeSign size={10} />
                  {tool.weeklyRate?.toLocaleString('en-IN')}/week
                </div>
              )}
            </div>
            <Button className="btn-view" onClick={handleViewDetails}>
              <FaEye className="me-1" size={12} />
              View
            </Button>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="tool-card-footer">
          {isOwnerView ? (
            <div className="owner-actions">
              <Button className="btn-edit" onClick={handleEdit}>
                <FaEdit className="me-1" size={12} />
                Edit
              </Button>
              <Button 
                className="btn-delete" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <>
                    <FaTrash className="me-1" size={12} />
                    Delete
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="tool-card-meta">
              <span>
                <FaMapMarkerAlt size={12} />
                {locationString}
              </span>
              <span>
                <FaClock size={12} />
                {tool.createdAt ? new Date(tool.createdAt).toLocaleDateString('en-IN') : 'Recently'}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ToolCard;