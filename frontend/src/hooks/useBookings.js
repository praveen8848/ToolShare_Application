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
      setBookings(data);
    } catch (err) {
      setError(err.message);
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
      toast.success('Booking cancelled successfully');
      fetchBookings();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
      return false;
    }
  };

  const returnItem = async (id) => {
    try {
      await bookingService.returnItem(id);
      toast.success('Item returned successfully! Deposit refund initiated.');
      fetchBookings();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return item');
      return false;
    }
  };

  return {
    bookings,
    loading,
    error,
    cancelBooking,
    returnItem,
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
      try {
        const data = await bookingService.getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  return { booking, loading, error };
};