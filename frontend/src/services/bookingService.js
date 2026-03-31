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
    const response = await api.put(`/api/bookings/${id}/approve`);
    return response.data;
  },

  // Reject booking (owner)
  rejectBooking: async (id) => {
    const response = await api.put(`/api/bookings/${id}/reject`);
    return response.data;
  },

  // Cancel booking (borrower)
  cancelBooking: async (id) => {
    const response = await api.put(`/api/bookings/${id}/cancel`);
    return response.data;
  },

  // Return item (scan QR)
  returnItem: async (id) => {
    const response = await api.post(`/api/bookings/${id}/return`);
    return response.data;
  },

  // Get pending bookings for owner
    getPendingBookings: async () => {
    const response = await api.get('/api/bookings/pending');
    return response.data;
    },
};

export default bookingService;