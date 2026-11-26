import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaCalendarAlt, FaMapMarkerAlt, FaPhone, FaInfoCircle, FaClock } from 'react-icons/fa';
import DateTimePicker from 'react-datetime-picker';
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import './PickupDetailsModal.css';

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const PickupDetailsModal = ({ show, onHide, booking, onConfirm, toolPickupDetails }) => {
  const [pickupDateTime, setPickupDateTime] = useState(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [ownerContact, setOwnerContact] = useState('');
  const [contactMethod, setContactMethod] = useState('BOTH');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      // Reset form when modal opens
      if (toolPickupDetails) {
        setPickupLocation(toolPickupDetails.pickupLocation || '');
        setPickupInstructions(toolPickupDetails.pickupInstructions || '');
        setOwnerContact(toolPickupDetails.ownerContact || '');
        setContactMethod(toolPickupDetails.contactMethod || 'BOTH');
      }
      setPickupDateTime(null);
      setErrors({});
    }
  }, [show, toolPickupDetails]);

  const validate = () => {
    const newErrors = {};
    
    if (!pickupDateTime) {
      newErrors.pickupDateTime = 'Please select pickup date and time';
    } else if (Number.isNaN(pickupDateTime.getTime())) {
      newErrors.pickupDateTime = 'Please select a valid pickup date and time';
    } else {
      const startDate = parseLocalDate(booking?.startDate);
      if (!startDate) {
        newErrors.pickupDateTime = 'Booking start date is unavailable';
      } else {
        const minAllowedDateTime = new Date(startDate);
        minAllowedDateTime.setDate(minAllowedDateTime.getDate() - 1);
        const maxAllowedDateTime = new Date(startDate);
        maxAllowedDateTime.setTime(maxAllowedDateTime.getTime() - 1);

        if (pickupDateTime < minAllowedDateTime || pickupDateTime > maxAllowedDateTime) {
          newErrors.pickupDateTime = `Pickup must be scheduled at least 1 day before ${booking.startDate}`;
        } else if (pickupDateTime < new Date()) {
          newErrors.pickupDateTime = 'Pickup date and time cannot be in the past';
        }
      }
    }
    
    if (!pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    
    if (!ownerContact.trim()) {
      newErrors.ownerContact = 'Contact number is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        pickupDateTime: formatLocalDateTime(pickupDateTime),
        pickupLocation,
        pickupInstructions,
        ownerContact,
        contactMethod
      });
      // Do not call onHide() here; let the parent component handle hiding it after a successful API call.
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateForDisplay = (dateString) => {
    const date = parseLocalDate(dateString);
    if (!date) return '';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPickupDateBounds = () => {
    const startDate = parseLocalDate(booking?.startDate);
    if (!startDate) return { minDate: new Date(), maxDate: new Date() };

    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() - 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      minDate: today > maxDate ? today : maxDate,
      maxDate
    };
  };

  const { minDate, maxDate } = getPickupDateBounds();

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="pickup-details-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalendarAlt className="me-2" />
          Confirm Booking & Provide Pickup Details
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* Booking Summary */}
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-start">
            <FaInfoCircle className="me-2 mt-1" />
            <div>
              <strong>Booking Summary</strong><br />
              <strong>Tool:</strong> {booking?.itemName}<br />
              <strong>Borrower:</strong> {booking?.borrowerName}<br />
              <strong>Booking Dates:</strong> {formatDateForDisplay(booking?.startDate)} to {formatDateForDisplay(booking?.endDate)}<br />
              <strong>Total Amount:</strong> ₹{booking?.totalAmount}
              {booking?.depositAmount && <span className="ms-3">Deposit: ₹{booking.depositAmount}</span>}
            </div>
          </div>
        </Alert>

        <Form>
          {/* Pickup Date & Time */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <FaClock className="me-2" />
              Pickup Date & Time <span className="text-danger">*</span>
            </Form.Label>
            <DateTimePicker
              onChange={setPickupDateTime}
              value={pickupDateTime}
              className="form-control"
              format="yyyy-MM-dd h:mm a"
              minDate={minDate}
              maxDate={maxDate}
              clearIcon={null}
              disableClock={false}
              amPmAriaLabel="Select AM/PM"
            />
            {errors.pickupDateTime && (
              <Form.Text className="text-danger d-block mt-1">
                {errors.pickupDateTime}
              </Form.Text>
            )}
            <Form.Text className="pickup-date-help">
              Pickup must be scheduled at least 1 day before {formatDateForDisplay(booking?.startDate)}
            </Form.Text>
          </Form.Group>

          {/* Pickup Location */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <FaMapMarkerAlt className="me-2" />
              Pickup Location <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Enter the full address where borrower will pick up the tool"
              isInvalid={!!errors.pickupLocation}
            />
            <Form.Control.Feedback type="invalid">
              {errors.pickupLocation}
            </Form.Control.Feedback>
            <Form.Text className="pickup-date-help">
              Include building name, apartment number, landmark, etc.
            </Form.Text>
          </Form.Group>

          {/* Pickup Instructions */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              Pickup Instructions
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={pickupInstructions}
              onChange={(e) => setPickupInstructions(e.target.value)}
              placeholder="e.g., Call when you arrive, ring bell #4B, I'll come down, door code: 1234"
            />
            <Form.Text className="pickup-date-help">
              Any special instructions for the borrower
            </Form.Text>
          </Form.Group>

          {/* Contact Number */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <FaPhone className="me-2" />
              Contact Number <span className="text-danger">*</span>
            </Form.Label>
            <InputGroup>
              <InputGroup.Text>+91</InputGroup.Text>
              <Form.Control
                type="tel"
                value={ownerContact}
                onChange={(e) => setOwnerContact(e.target.value)}
                placeholder="98765 43210"
                isInvalid={!!errors.ownerContact}
              />
            </InputGroup>
            <Form.Control.Feedback type="invalid">
              {errors.ownerContact}
            </Form.Control.Feedback>
            <Form.Text className="pickup-date-help">
              Phone number where borrower can reach you
            </Form.Text>
          </Form.Group>

          {/* Preferred Contact Method */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Preferred Contact Method</Form.Label>
            <div>
              <Form.Check
                inline
                label="📞 Call"
                name="contactMethod"
                type="radio"
                value="CALL"
                checked={contactMethod === 'CALL'}
                onChange={(e) => setContactMethod(e.target.value)}
              />
              <Form.Check
                inline
                label="💬 Text"
                name="contactMethod"
                type="radio"
                value="TEXT"
                checked={contactMethod === 'TEXT'}
                onChange={(e) => setContactMethod(e.target.value)}
              />
              <Form.Check
                inline
                label="📱 Both"
                name="contactMethod"
                type="radio"
                value="BOTH"
                checked={contactMethod === 'BOTH'}
                onChange={(e) => setContactMethod(e.target.value)}
              />
            </div>
          </Form.Group>

          {/* Important Notes */}
          <Alert variant="warning" className="mt-3">
            <small>
              <strong>Important:</strong>
              <ul className="mb-0 mt-1">
                <li>These details will be shared with the borrower immediately after confirmation</li>
                <li>Make sure the pickup address and contact number are correct</li>
                <li>Pickup time must be at least 1 day before the booking start date</li>
              </ul>
            </small>
          </Alert>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button className="pickup-cancel-button" onClick={onHide} disabled={submitting}>
          Cancel
        </Button>
        <Button className="pickup-confirm-button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Confirming...
            </>
          ) : (
            <>
              <FaCalendarAlt className="me-2" />
              Confirm & Send Details
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PickupDetailsModal;