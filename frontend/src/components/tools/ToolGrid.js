import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';
import ToolCard from './ToolCard';

const ToolGrid = ({ tools, loading, isOwnerView = false, onReset }) => {
  if (loading) {
    return (
      <div className="tool-grid-state">
        <style>{`.tool-grid-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 2rem; color: #A3A3A3; }`}</style>
        <Spinner animation="border" style={{ color: '#34D399', width: '2.5rem', height: '2.5rem', marginBottom: '0.75rem' }} />
        <p>Loading tools...</p>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="tool-grid-state">
        <style>
          {`
            .tool-grid-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 300px;
              padding: 2rem;
              text-align: center;
            }
            
            .empty-icon-box {
              width: 64px; height: 64px;
              border-radius: 12px;
              background: rgba(16,185,129,0.06);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1rem;
              border: 1px solid rgba(16,185,129,0.1);
              color: #34D399;
              font-size: 1.5rem;
            }
            
            .empty-title { color: #F5F5F5; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem; }
            
            .empty-message { color: #A3A3A3; font-size: 0.9rem; margin-bottom: 1rem; }
            
            .reset-btn {
              background: transparent;
              color: #34D399;
              border: 1px solid rgba(16,185,129,0.2);
              border-radius: 8px;
              padding: 0.4rem 1rem;
              font-weight: 500;
              font-size: 0.85rem;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .reset-btn:hover { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.4); }
          `}
        </style>
        <div className="empty-icon-box">
          {isOwnerView ? <FaBoxOpen size={24} /> : <FaSearch size={24} />}
        </div>
        <h4 className="empty-title">{isOwnerView ? 'No Tools Listed' : 'No Tools Found'}</h4>
        <p className="empty-message">
          {isOwnerView ? 'Start sharing your tools with the community.' : 'Try adjusting your filters or search.'}
        </p>
        {!isOwnerView && onReset && (
          <button className="reset-btn" onClick={onReset}>Clear All Filters</button>
        )}
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          .grid-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #2A2A2A;
          }
          
          .grid-count { color: #A3A3A3; font-size: 0.85rem; }
          .grid-count strong { color: #34D399; }
        `}
      </style>
      
      <div className="grid-header">
        <div className="grid-count">
          <strong>{tools.length}</strong> {tools.length === 1 ? 'tool' : 'tools'} found
        </div>
      </div>

      <Row className="g-3">
        {tools.map((tool) => (
          <Col key={tool.id} md={6} lg={4} xl={3}>
            <ToolCard tool={tool} isOwnerView={isOwnerView} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ToolGrid;