import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ToolCard from './ToolCard';

const ToolGrid = ({ tools, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No tools found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <Row>
      {tools.map((tool) => (
        <Col key={tool.id} md={6} lg={4} xl={3} className="mb-4">
          <ToolCard tool={tool} />
        </Col>
      ))}
    </Row>
  );
};

export default ToolGrid;