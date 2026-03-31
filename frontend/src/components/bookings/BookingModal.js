import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { formatCurrency } from '../../utils/formatters';
import bookingService from '../../services/bookingService';
import { toast } from 'react-toastify';

const BookingModal = ({ show, onHide, tool }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Reset dates when modal closes
  const handleClose = () => {
    setStartDate(null);
    setEndDate(null);
    setAvailability(null);
    setBookingSuccess(false);
    onHide();
  };

  // Check availability when dates change
  useEffect(() => {
    if (startDate && endDate && tool) {
      const checkAvailability = async () => {
        setCheckingAvailability(true);
        try {
          const result = await bookingService.checkAvailability(
            tool.id,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );
          setAvailability(result);
        } catch (err) {
          console.error('Availability check failed:', err);
          setAvailability({ available: false, message: 'Failed to check availability' });
        } finally {
          setCheckingAvailability(false);
        }
      };
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [startDate, endDate, tool]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!tool || !availability?.available) return 0;
    const days = calculateDays();
    return days * tool.dailyRate;
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select dates');
      return;
    }

    setLoading(true);
    try {
      await bookingService.createBooking({
        itemId: tool.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        notes: '',
      });
      setBookingSuccess(true);
      toast.success('Booking request sent! Waiting for owner approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays();
  const total = calculateTotal();

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Book {tool?.name}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {bookingSuccess ? (
          <Alert variant="success" className="text-center">
            <Alert.Heading>Booking Request Sent!</Alert.Heading>
            <p>The owner will review your request and notify you soon.</p>
            <p>You can check the status in <strong>My Bookings</strong>.</p>
            <Button variant="success" onClick={handleClose}>
              Close
            </Button>
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <h6>Tool Details</h6>
              <p className="text-muted">
                {tool?.name} - {formatCurrency(tool?.dailyRate)}/day
                {tool?.depositAmount && <span className="ms-2">Deposit: {formatCurrency(tool.depositAmount)}</span>}
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Select Dates</Form.Label>
              <div className="d-flex gap-3">
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  placeholderText="Start Date"
                  className="form-control"
                  dateFormat="MMM dd, yyyy"
                />
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  placeholderText="End Date"
                  className="form-control"
                  dateFormat="MMM dd, yyyy"
                  disabled={!startDate}
                />
              </div>
            </Form.Group>

            {checkingAvailability && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                Checking availability...
              </div>
            )}

            {availability && !checkingAvailability && (
              <Alert variant={availability.available ? 'success' : 'danger'}>
                {availability.available ? (
                  <>
                    <strong>✅ Available!</strong> You can book this tool.
                    {availability.pendingRequests > 0 && (
                      <p className="mb-0 mt-1 small">
                        ⚠️ {availability.pendingRequests} other request(s) pending for these dates.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <strong>❌ Not Available</strong>
                    <p className="mb-0 mt-1">{availability.message}</p>
                    {availability.suggestedDates?.length > 0 && (
                      <div className="mt-2">
                        <small>Suggested dates:</small>
                        <ul className="mb-0 mt-1">
                          {availability.suggestedDates.map((date, idx) => (
                            <li key={idx}>
                              {date.startDate} to {date.endDate} ({date.days} days)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </Alert>
            )}

            {startDate && endDate && availability?.available && (
              <div className="bg-light p-3 rounded">
                <h6>Price Breakdown</h6>
                <div className="d-flex justify-content-between">
                  <span>{days} day(s) @ {formatCurrency(tool?.dailyRate)}/day</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {tool?.depositAmount && (
                  <div className="d-flex justify-content-between mt-1">
                    <span>Deposit (refundable)</span>
                    <span>{formatCurrency(tool.depositAmount)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total + (tool?.depositAmount || 0))}</span>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {bookingSuccess ? 'Close' : 'Cancel'}
        </Button>
        {!bookingSuccess && startDate && endDate && availability?.available && (
          <Button 
            variant="success" 
            onClick={handleBooking}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Booking'}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default BookingModal;