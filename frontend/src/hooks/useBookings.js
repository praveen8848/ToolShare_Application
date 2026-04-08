import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import { toast } from 'react-toastify';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bookingService.getUserBookings();
      setBookings(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (id) => {
    try {
      await bookingService.cancelBooking(id);

      // Safe type comparison using String()
      setBookings(prev =>
        prev.map(booking =>
          String(booking.id) === String(id)
            ? { ...booking, status: 'CANCELLED' }
            : booking
        )
      );

      toast.success('Booking cancelled successfully');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
      return false;
    }
  };

  const deleteBooking = async (id) => {
    try {
      await bookingService.deleteBooking(id);

      // Safe type comparison using String() to fix the state update bug
      setBookings(prev =>
        prev.filter(booking => String(booking.id) !== String(id))
      );

      toast.success('Booking deleted successfully');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete booking');
      return false;
    }
  };

  const returnItem = async (id) => {
    try {
      await bookingService.returnItem(id);

      // Safe type comparison using String()
      setBookings(prev =>
        prev.map(booking =>
          String(booking.id) === String(id)
            ? { ...booking, status: 'COMPLETED' }
            : booking
        )
      );

      toast.success('Item returned successfully! Deposit refund initiated.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return item');
      return false;
    }
  };

  const requestReturn = async (id) => {
    try {
      await bookingService.requestReturn(id);
      
      // OPTIMIZED: Update state locally instead of triggering a full page refetch!
      setBookings(prev =>
        prev.map(booking =>
          String(booking.id) === String(id)
            ? { ...booking, status: 'RETURN_REQUESTED' }
            : booking
        )
      );

      toast.success('Return request sent! Waiting for owner confirmation.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request return');
      return false;
    }
  };

  const confirmReturn = async (id) => {
    try {
      await bookingService.confirmReturn(id);

      // Safe type comparison using String()
      setBookings(prev =>
        prev.map(booking =>
          String(booking.id) === String(id)
            ? { ...booking, status: 'COMPLETED' }
            : booking
        )
      );

      toast.success('Return confirmed! Deposit will be refunded.');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm return');
      return false;
    }
  };

  return {
    bookings,
    loading,
    error,
    cancelBooking,
    deleteBooking,
    returnItem,
    requestReturn,
    confirmReturn,
    refreshBookings: fetchBookings,
  };
};

export const useBooking = (id) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  return { booking, loading, error };
};