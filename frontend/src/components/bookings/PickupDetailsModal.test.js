import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PickupDetailsModal from './PickupDetailsModal';

jest.mock('react-datetime-picker', () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <div>
      <button type="button" onClick={() => onChange(new Date(2030, 0, 9, 14, 30, 0))}>
        Select valid pickup time
      </button>
      <button type="button" onClick={() => onChange(new Date(2030, 0, 8, 14, 30, 0))}>
        Select pickup time before allowed window
      </button>
    </div>
  ),
}));

const booking = {
  id: 21,
  itemName: 'Circular saw',
  borrowerName: 'Borrower',
  startDate: '2030-01-10',
  endDate: '2030-01-12',
  totalAmount: 100,
};

const toolPickupDetails = {
  pickupLocation: 'Owner address',
  ownerContact: '9876543210',
  contactMethod: 'BOTH',
};

const fillRequiredDetails = () => {
  fireEvent.change(screen.getByPlaceholderText(/full address/i), {
    target: { value: 'Owner address' },
  });
  fireEvent.change(screen.getByPlaceholderText('98765 43210'), {
    target: { value: '9876543210' },
  });
};

test('accepts a pickup during the allowed day and submits local datetime without a timezone shift', async () => {
  const onConfirm = jest.fn().mockResolvedValue(undefined);
  render(
    <PickupDetailsModal
      show
      onHide={jest.fn()}
      booking={booking}
      onConfirm={onConfirm}
      toolPickupDetails={toolPickupDetails}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Select valid pickup time' }));
  fillRequiredDetails();
  fireEvent.click(screen.getByRole('button', { name: /confirm & send details/i }));

  await waitFor(() => {
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      pickupDateTime: '2030-01-09T14:30:00',
    }));
  });
});

test('rejects a pickup earlier than the backend-accepted time window', async () => {
  const onConfirm = jest.fn();
  render(
    <PickupDetailsModal
      show
      onHide={jest.fn()}
      booking={booking}
      onConfirm={onConfirm}
      toolPickupDetails={toolPickupDetails}
    />
  );

  fireEvent.click(screen.getByRole('button', { name: 'Select pickup time before allowed window' }));
  fillRequiredDetails();
  fireEvent.click(screen.getByRole('button', { name: /confirm & send details/i }));

  expect(await screen.findByText('Pickup must be scheduled at least 1 day before 2030-01-10')).toBeInTheDocument();
  expect(onConfirm).not.toHaveBeenCalled();
});
