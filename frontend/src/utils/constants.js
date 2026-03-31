// Tool categories
export const CATEGORIES = [
  { id: 1, name: 'Power Tools', icon: '🔧' },
  { id: 2, name: 'Hand Tools', icon: '🔨' },
  { id: 3, name: 'Gardening', icon: '🌱' },
  { id: 4, name: 'Woodworking', icon: '🪚' },
  { id: 5, name: 'Plumbing', icon: '🚰' },
  { id: 6, name: 'Electrical', icon: '⚡' },
  { id: 7, name: 'Painting', icon: '🎨' },
  { id: 8, name: 'Other', icon: '📦' },
];

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Tool statuses
export const TOOL_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BORROWED: 'BORROWED',
  MAINTENANCE: 'MAINTENANCE',
};

// Status colors for badges
export const STATUS_COLORS = {
  AVAILABLE: 'success',
  BORROWED: 'warning',
  MAINTENANCE: 'danger',
  PENDING: 'info',
  CONFIRMED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'secondary',
  COMPLETED: 'dark',
};