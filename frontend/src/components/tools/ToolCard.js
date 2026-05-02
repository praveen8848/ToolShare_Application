import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { 
  FaStar, FaMapMarkerAlt, FaEdit, FaTrash, 
  FaRupeeSign, FaUser, FaTag, FaEye, FaClock 
} from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom'; 
import toolService from '../../services/toolService';
import { toast } from 'react-toastify';

const ToolCard = ({ tool, isOwnerView = false, onDelete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  const getStatusBadge = (status) => {
    const config = {
      'AVAILABLE':   { bg: 'rgba(16,185,129,0.1)', color: '#34D399', border: 'rgba(16,185,129,0.2)', text: 'Available' },
      'BORROWED':    { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: 'rgba(245,158,11,0.2)', text: 'Borrowed' },
      'MAINTENANCE': { bg: 'rgba(239,68,68,0.1)', color: '#EF4444', border: 'rgba(239,68,68,0.2)', text: 'Maintenance' },
    };
    const { bg, color, border, text } = config[status] || { bg: 'rgba(115,115,115,0.1)', color: '#737373', border: 'rgba(115,115,115,0.2)', text: status };
    return <span style={{ background: bg, color, border: `1px solid ${border}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.7rem' }}>{text}</span>;
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(isOwnerView || location.pathname === '/my-tools' ? `/tools/view/${tool.id}` : `/tools/${tool.id}`);
  };

  const handleEdit = (e) => { e.stopPropagation(); navigate(`/edit-tool/${tool.id}`); };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${tool.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await toolService.deleteTool(tool.id);
      toast.success('Tool deleted');
      if (onDelete) onDelete(tool.id);
      else window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tool');
    } finally { setDeleting(false); }
  };

  const locationString = [tool.city, tool.state].filter(Boolean).join(', ') || 'Location not specified';
  const ratingDisplay = tool.ownerRating ? parseFloat(tool.ownerRating).toFixed(1) : null;

  return (
    <div className="tool-card">
      <style>
        {`
          .tool-card {
            background: #1E1E1E;
            border: 1px solid #2A2A2A;
            border-radius: 14px;
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          
          .tool-card-image {
            height: 180px;
            background: #0A0A0A;
            cursor: pointer;
            position: relative;
            overflow: hidden;
          }
          
          .tool-card-image img {
            width: 100%; height: 100%; object-fit: cover;
          }
          
          .tool-card-image-placeholder {
            width: 100%; height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #737373;
          }
          
          .tool-card-body {
            padding: 1rem 1rem 0;
            flex: 1;
          }
          
          .tool-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
            gap: 0.5rem;
          }
          
          .tool-card-title {
            color: #F5F5F5;
            font-weight: 600;
            font-size: 1rem;
            margin: 0;
            cursor: pointer;
          }
          
          .tool-card-title:hover { color: #34D399; }
          
          .tool-card-category {
            color: #34D399;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            gap: 4px;
            margin-bottom: 0.5rem;
          }
          
          .tool-card-owner {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 0.5rem;
            font-size: 0.8rem;
            color: #A3A3A3;
          }
          
          .owner-link {
            color: #34D399;
            text-decoration: none;
            font-weight: 600;
          }
          
          .owner-link:hover { text-decoration: underline; }
          
          .tool-card-description {
            color: #A3A3A3;
            font-size: 0.8rem;
            line-height: 1.5;
            margin-bottom: 0.75rem;
          }
          
          .tool-card-pricing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6rem 0;
            border-top: 1px solid #2A2A2A;
            margin-top: auto;
          }
          
          .price-amount {
            color: #34D399;
            font-weight: 700;
            font-size: 1.3rem;
            display: flex;
            align-items: center;
          }
          
          .price-unit { color: #737373; font-size: 0.8rem; margin-left: 4px; }
          
          .deposit-badge {
            background: rgba(16,185,129,0.06);
            border: 1px solid rgba(16,185,129,0.15);
            border-radius: 4px;
            padding: 1px 6px;
            color: #34D399;
            font-size: 0.65rem;
            margin-left: 6px;
          }
          
          .btn-view {
            background: transparent;
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 6px;
            padding: 0.3rem 0.8rem;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s;
          }
          
          .btn-view:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.4); color: #6EE7B7; }
          
          .tool-card-footer { padding: 0.5rem 1rem 1rem; }
          
          .owner-actions { display: flex; gap: 0.4rem; }
          
          .btn-edit {
            background: transparent;
            color: #34D399;
            border: 1px solid rgba(16,185,129,0.2);
            border-radius: 6px;
            padding: 0.3rem 0.7rem;
            font-size: 0.8rem;
            font-weight: 500;
            flex: 1;
          }
          
          .btn-edit:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.4); color: #6EE7B7; }
          
          .btn-delete {
            background: transparent;
            color: #EF4444;
            border: 1px solid rgba(239,68,68,0.2);
            border-radius: 6px;
            padding: 0.3rem 0.7rem;
            font-size: 0.8rem;
            font-weight: 500;
            flex: 1;
          }
          
          .btn-delete:hover { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.4); color: #F87171; }
          .btn-delete:disabled { opacity: 0.4; }
          
          .tool-card-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #737373;
            font-size: 0.7rem;
          }
          
          .tool-card-meta span {
            display: flex;
            align-items: center;
            gap: 3px;
          }
        `}
      </style>

      <div className="tool-card-image" onClick={handleViewDetails}>
        {tool.images && tool.images.length > 0 && imageLoaded ? (
          <img src={tool.images[0]} alt={tool.name} onError={() => setImageLoaded(false)} />
        ) : (
          <div className="tool-card-image-placeholder"><FaTag size={28} style={{ opacity: 0.3 }} /></div>
        )}
      </div>
      
      <div className="tool-card-body">
        <div className="tool-card-header">
          <h5 className="tool-card-title" onClick={handleViewDetails}>{tool.name}</h5>
          {getStatusBadge(tool.status)}
        </div>
        
        <div className="tool-card-category"><FaTag size={10} />{tool.categoryName || 'Uncategorized'}</div>
        
        <div className="tool-card-owner">
          {ratingDisplay && <span style={{ color: '#FBBF24' }}><FaStar size={10} /> {ratingDisplay}</span>}
          {ratingDisplay && <span style={{ color: '#737373' }}>•</span>}
          <FaUser size={10} />
          {tool.ownerId && !isOwnerView ? (
            <Link to={`/owner/${tool.ownerId}`} className="owner-link" onClick={(e) => e.stopPropagation()}>
              {tool.ownerName || 'Unknown Owner'}
            </Link>
          ) : (
            <span>{tool.ownerName || 'Unknown Owner'}</span>
          )}
        </div>
        
        <p className="tool-card-description">
          {tool.description && tool.description.length > 80 ? `${tool.description.substring(0, 80)}...` : tool.description || 'No description'}
        </p>
        
        <div className="tool-card-pricing">
          <div className="price-amount">
            <FaRupeeSign size={14} />{tool.dailyRate?.toLocaleString('en-IN') || '0'}
            <span className="price-unit">/day</span>
            {tool.depositAmount > 0 && <span className="deposit-badge">Dep ₹{tool.depositAmount?.toLocaleString('en-IN')}</span>}
          </div>
          <Button className="btn-view" onClick={handleViewDetails}><FaEye size={10} className="me-1" /> View</Button>
        </div>
      </div>
      
      <div className="tool-card-footer">
        {isOwnerView ? (
          <div className="owner-actions">
            <Button className="btn-edit" onClick={handleEdit}><FaEdit size={10} className="me-1" /> Edit</Button>
            <Button className="btn-delete" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Spinner animation="border" size="sm" /> : <><FaTrash size={10} className="me-1" /> Delete</>}
            </Button>
          </div>
        ) : (
          <div className="tool-card-meta">
            <span><FaMapMarkerAlt size={10} />{locationString}</span>
            <span><FaClock size={10} />{tool.createdAt ? new Date(tool.createdAt).toLocaleDateString('en-IN') : 'Recently'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolCard;