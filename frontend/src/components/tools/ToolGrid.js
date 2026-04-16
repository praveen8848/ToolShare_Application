import React from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { FaSearch, FaBoxOpen, FaFilter } from 'react-icons/fa';
import ToolCard from './ToolCard';

const ToolGrid = ({ tools, loading, isOwnerView = false, onReset }) => {
  if (loading) {
    return (
      <>
        <style>
          {`
            .tool-grid-loading {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 3rem;
            }
            
            .loading-spinner {
              color: #60a5fa !important;
              width: 3rem;
              height: 3rem;
              margin-bottom: 1rem;
            }
            
            .loading-text {
              color: #94a3b8;
              font-size: 1rem;
            }
            
            .loading-subtext {
              color: #64748b;
              font-size: 0.85rem;
              margin-top: 0.5rem;
            }
          `}
        </style>
        <div className="tool-grid-loading">
          <Spinner animation="border" className="loading-spinner" />
          <p className="loading-text">Discovering tools near you...</p>
          <p className="loading-subtext">Please wait while we fetch the best tools</p>
        </div>
      </>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <>
        <style>
          {`
            .tool-grid-empty {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 3rem;
              text-align: center;
            }
            
            .empty-icon-wrapper {
              width: 100px;
              height: 100px;
              border-radius: 24px;
              background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1.5rem;
              border: 1px solid #334155;
            }
            
            .empty-icon {
              color: #60a5fa;
              font-size: 2.5rem;
              opacity: 0.8;
            }
            
            .empty-title {
              color: #f1f5f9;
              font-weight: 700;
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }
            
            .empty-message {
              color: #94a3b8;
              font-size: 1rem;
              margin-bottom: 1.5rem;
              max-width: 400px;
            }
            
            .empty-suggestions {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
              justify-content: center;
              margin-bottom: 1.5rem;
            }
            
            .suggestion-badge {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 20px;
              padding: 0.5rem 1rem;
              color: #94a3b8;
              font-size: 0.85rem;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            
            .reset-link {
              color: #60a5fa;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.9rem;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              transition: all 0.2s ease;
              padding: 0.5rem 1.25rem;
              border: 1px solid #334155;
              border-radius: 10px;
              background: transparent;
            }
            
            .reset-link:hover {
              color: #93c5fd;
              border-color: #60a5fa;
              background: rgba(59, 130, 246, 0.1);
            }
            
            .grid-container {
              width: 100%;
            }
          `}
        </style>
        <div className="tool-grid-empty">
          <div className="empty-icon-wrapper">
            {isOwnerView ? (
              <FaBoxOpen className="empty-icon" />
            ) : (
              <FaSearch className="empty-icon" />
            )}
          </div>
          <h4 className="empty-title">
            {isOwnerView ? 'No Tools Listed Yet' : 'No Tools Found'}
          </h4>
          <p className="empty-message">
            {isOwnerView 
              ? 'Start sharing your tools with the community and earn passive income.'
              : 'Try adjusting your filters or search for something else.'}
          </p>
          
          {!isOwnerView && (
            <>
              <div className="empty-suggestions">
                <span className="suggestion-badge">
                  <FaSearch size={12} />
                  Try broader keywords
                </span>
                <span className="suggestion-badge">
                  <FaFilter size={12} />
                  Remove filters
                </span>
                <span className="suggestion-badge">
                  📍 Expand radius
                </span>
              </div>
              {onReset && (
                <button className="reset-link" onClick={onReset}>
                  Clear All Filters
                </button>
              )}
            </>
          )}
        </div>
      </>
    );
  }

  // Calculate responsive column sizes
  const getColumnSize = () => {
    if (tools.length === 1) return { md: 12, lg: 12, xl: 12 };
    if (tools.length === 2) return { md: 6, lg: 6, xl: 6 };
    return { md: 6, lg: 4, xl: 3 };
  };

  const colSize = getColumnSize();

  return (
    <>
      <style>
        {`
          .tool-grid-container {
            width: 100%;
          }
          
          .tool-grid-row {
            display: flex;
            flex-wrap: wrap;
            margin-right: -12px;
            margin-left: -12px;
          }
          
          .tool-grid-col {
            padding-right: 12px;
            padding-left: 12px;
            margin-bottom: 24px;
          }
          
          .grid-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #334155;
          }
          
          .grid-count {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .count-badge {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.85rem;
          }
          
          .count-text {
            color: #94a3b8;
            font-size: 0.9rem;
          }
          
          .grid-view-options {
            display: flex;
            gap: 0.5rem;
          }
          
          .fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .grid-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.75rem;
            }
          }
        `}
      </style>

      <div className="tool-grid-container">
        {/* Grid Header with count */}
        <div className="grid-header">
          <div className="grid-count">
            <span className="count-badge">{tools.length}</span>
            <span className="count-text">
              {tools.length === 1 ? 'tool found' : 'tools found'}
            </span>
          </div>
          <div className="grid-view-options">
            {!isOwnerView && (
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Showing nearest tools first
              </span>
            )}
          </div>
        </div>

        {/* Tools Grid */}
        <Row className="g-4 fade-in">
          {tools.map((tool, index) => (
            <Col 
              key={tool.id} 
              md={colSize.md} 
              lg={colSize.lg} 
              xl={colSize.xl}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: `fadeIn 0.5s ease-in-out ${index * 50}ms both`
              }}
            >
              <ToolCard tool={tool} isOwnerView={isOwnerView} />
            </Col>
          ))}
        </Row>
        
        {/* Bottom spacer */}
        <div style={{ height: '2rem' }} />
      </div>
    </>
  );
};

export default ToolGrid;