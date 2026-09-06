/**
 * Status badge utilities
 */

export const getStatusBadge = (status) => {
  const statusMap = {
    'AVAILABLE': { color: '#10B981', label: 'Available' },
    'BORROWED': { color: '#F59E0B', label: 'Borrowed' },
    'MAINTENANCE': { color: '#EF4444', label: 'Maintenance' },
    'UNAVAILABLE': { color: '#6B7280', label: 'Unavailable' },
    'PENDING': { color: '#F59E0B', label: 'Pending' },
    'APPROVED': { color: '#10B981', label: 'Approved' },
    'CONFIRMED': { color: '#10B981', label: 'Confirmed' },
    'REJECTED': { color: '#EF4444', label: 'Rejected' },
    'CANCELLED': { color: '#6B7280', label: 'Cancelled' },
    'COMPLETED': { color: '#3B82F6', label: 'Completed' },
    'RETURN_REQUESTED': { color: '#8B5CF6', label: 'Return Requested' },
  };

  const statusInfo = statusMap[status] || { color: '#6B7280', label: status };

  return {
    color: statusInfo.color,
    label: statusInfo.label,
  };
};

export const getStatusColor = (status) => {
  return getStatusBadge(status).color;
};

export const getStatusLabel = (status) => {
  return getStatusBadge(status).label;
};
