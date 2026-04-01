import api from '../config/axiosConfig';

const bookingService = {
  // Check availability
  checkAvailability: async (itemId, startDate, endDate) => {
    const response = await api.get(`/api/bookings/availability`, {
      params: { itemId, startDate, endDate }
    });
    return response.data;
  },

  // Create a booking
  createBooking: async (bookingData) => {
    const response = await api.post('/api/bookings', bookingData);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async () => {
    const response = await api.get('/api/bookings/my-bookings');
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await api.get(`/api/bookings/${id}`);
    return response.data;
  },

  // Approve booking (owner)
  approveBooking: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.put(`/api/bookings/${id}/approve`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },

  // Reject booking (owner)
  rejectBooking: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.put(`/api/bookings/${id}/reject`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },

  // Cancel booking (borrower)
  cancelBooking: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.put(`/api/bookings/${id}/cancel`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },

  // Request return (borrower initiates return)
  requestReturn: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.post(`/api/bookings/${id}/request-return`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },

  // Confirm return (owner confirms after scanning QR)
  confirmReturn: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.post(`/api/bookings/${id}/confirm-return`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },

  // Legacy return method (kept for backward compatibility)
  returnItem: async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const response = await api.post(`/api/bookings/${id}/return`, {}, {
      headers: { 'X-User-Id': user?.id }
    });
    return response.data;
  },
};

export default bookingService;