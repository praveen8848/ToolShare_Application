import React from 'react';
import { getStatusBadge } from '../../utils/statusHelpers';

const StatusBadge = ({ status, style = {} }) => {
  const { color, label } = getStatusBadge(status);

  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
        ...style
      }}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
