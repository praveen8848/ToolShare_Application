import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MyBookingsPage from './MyBookingsPage';
import bookingService from '../services/bookingService';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}), { virtual: true });

jest.mock('../services/bookingService');
jest.mock('react-toastify', () => ({ toast: { error: jest.fn(), success: jest.fn() } }));

const booking = {
  id: 21,
  itemId: 7,
  itemName: 'Circular saw',
  ownerName: 'Tool owner',
  startDate: '2030-01-10',
  endDate: '2030-01-12',
  totalAmount: 100,
  createdAt: '2030-01-01',
};

test('keeps return-requested bookings visible until the owner confirms the return', async () => {
  bookingService.getUserBookings.mockResolvedValue([{ ...booking, status: 'RETURN_REQUESTED' }]);
  render(<MyBookingsPage />);

  fireEvent.click(await screen.findByRole('tab', { name: /returns \(1\)/i }));

  expect(screen.getByText('Circular saw')).toBeInTheDocument();
  expect(screen.getByText('Return Requested')).toBeInTheDocument();
  expect(screen.getByText(/waiting for owner confirmation/i)).toBeInTheDocument();
});

test('moves the borrower to the return-request tab after a successful return request', async () => {
  bookingService.getUserBookings.mockResolvedValue([{ ...booking, status: 'CONFIRMED' }]);
  bookingService.requestReturn.mockResolvedValue({});
  render(<MyBookingsPage />);

  fireEvent.click(await screen.findByRole('tab', { name: /confirmed \(1\)/i }));
  fireEvent.click(screen.getByRole('button', { name: /request return/i }));

  await waitFor(() => {
    expect(bookingService.requestReturn).toHaveBeenCalledWith(21);
    expect(screen.getByRole('tab', { name: /returns \(1\)/i })).toHaveAttribute('aria-selected', 'true');
  });

  expect(screen.getByText('Circular saw')).toBeInTheDocument();
  expect(screen.getByText(/waiting for owner confirmation/i)).toBeInTheDocument();
});
