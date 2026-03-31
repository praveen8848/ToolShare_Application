import api from '../config/axiosConfig';

const ownerService = {
  // Get owner's tools
  getMyTools: async () => {
    const response = await api.get('/api/tools/my-tools');
    return response.data;
  },

  // Get pending bookings for owner's tools
  getPendingBookings: async () => {
    const response = await api.get('/api/bookings/pending');
    return response.data;
  },

  // Approve a booking
  approveBooking: async (bookingId) => {
    const response = await api.put(`/api/bookings/${bookingId}/approve`);
    return response.data;
  },

  // Reject a booking
  rejectBooking: async (bookingId) => {
    const response = await api.put(`/api/bookings/${bookingId}/reject`);
    return response.data;
  },

  // Update tool status
  updateToolStatus: async (toolId, status) => {
    const response = await api.patch(`/api/tools/${toolId}/status?status=${status}`);
    return response.data;
  },
};

export default ownerService;