import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookingModal from './BookingModal';
import bookingService from '../../services/bookingService';

jest.mock('../../services/bookingService');
jest.mock('react-datepicker', () => function MockDatePicker({ selected, onChange, placeholderText }) {
  const value = selected
    ? `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    : '';
  return (
    <input
      aria-label={placeholderText}
      type="date"
      value={value}
      onChange={event => onChange(new Date(`${event.target.value}T12:00:00`))}
    />
  );
});

const deferred = () => {
  let resolve;
  const promise = new Promise(resolvePromise => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

test('does not use an old date range availability result after the end date changes', async () => {
  const oldRange = deferred();
  const newRange = deferred();
  bookingService.checkAvailability
    .mockReturnValueOnce(oldRange.promise)
    .mockReturnValueOnce(newRange.promise);

  render(
    <BookingModal
      show
      onHide={jest.fn()}
      tool={{ id: 12, name: 'Drill', dailyRate: 10 }}
    />
  );

  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2030-01-10' } });
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2030-01-12' } });

  await waitFor(() => expect(bookingService.checkAvailability).toHaveBeenCalledTimes(1));
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2030-01-14' } });
  await waitFor(() => expect(bookingService.checkAvailability).toHaveBeenCalledTimes(2));
  expect(screen.queryByRole('button', { name: /confirm booking/i })).not.toBeInTheDocument();

  await act(async () => {
    oldRange.resolve({ available: true });
    await oldRange.promise;
  });
  expect(screen.queryByRole('button', { name: /confirm booking/i })).not.toBeInTheDocument();

  await act(async () => {
    newRange.resolve({ available: false, message: 'Dates are unavailable' });
    await newRange.promise;
  });
  expect(await screen.findByText('Dates are unavailable')).toBeInTheDocument();

  expect(screen.queryByRole('button', { name: /confirm booking/i })).not.toBeInTheDocument();
});
