import { render, screen, fireEvent } from '@testing-library/react';
import Account from '@/components/AccountPage/Account';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Account Component', () => {
  const mockPush = jest.fn();
  const mockLogout = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading when no user', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    render(<Account />);
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  test('renders user information and wishlist count', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
      },
      logout: mockLogout,
    });

    render(<Account />);

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('0 wishlist')).toBeTruthy();
  });

  test('calls logout and redirects to home when Logout is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
      },
      logout: mockLogout,
    });

    render(<Account />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('navigates to order history when "View All Orders History" is clicked', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        firstname: 'John',
        lastname: 'Doe',
      },
      logout: mockLogout,
    });

    render(<Account />);

    const viewOrdersButton = screen.getByText('View All Orders History');
    fireEvent.click(viewOrdersButton);

    expect(mockPush).toHaveBeenCalledWith('/account/order_history');
  });
});
