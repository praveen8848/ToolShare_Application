import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './context/AuthContext';

jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    MemoryRouter: ({ children }) => children,
    Routes: ({ children }) => {
      const rootRoute = React.Children.toArray(children).find(route => route.props.path === '/');
      return rootRoute?.props.element || null;
    },
    Route: () => null,
    Navigate: ({ to }) => <div>Navigation target: {to}</div>,
  };
}, { virtual: true });

jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./pages/LandingPage', () => () => <div>Landing page</div>);
jest.mock('./pages/DashboardPage', () => () => <div>Dashboard page</div>);
jest.mock('./components/bookings/PickupDetailsModal', () => () => null);

describe('root route', () => {
  test('waits for saved-session restoration before redirecting', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, loading: true });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toHaveClass('app-loading-screen');
    expect(screen.queryByText('Landing page')).not.toBeInTheDocument();
  });

  test('routes an authenticated user to the dashboard after restoration', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Navigation target: /dashboard')).toBeInTheDocument();
  });
});
