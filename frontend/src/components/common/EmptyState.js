import React from 'react';
import { Button } from 'react-bootstrap';

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  iconSize = '48px',
  iconColor = '#6B7280'
}) => {
  return (
    <div className="text-center py-5" style={{ color: '#9CA3AF' }}>
      {icon && (
        <div style={{ fontSize: iconSize, color: iconColor, marginBottom: '16px' }}>
          {icon}
        </div>
      )}
      <h3 style={{ color: '#E5E7EB', marginBottom: '12px' }}>{title}</h3>
      <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '8px'
          }}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
