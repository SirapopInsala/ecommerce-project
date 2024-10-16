import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Home Component', () => {
  test('renders welcome message and shop button', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Welcome to Our/i })).toBeTruthy();
    expect(screen.getByText('E-Commerce')).toBeTruthy();
    expect(screen.getByRole('button', { name: /SHOP NOW/i })).toBeTruthy();
  });

  test('navigates to login page when SHOP NOW is clicked', () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    render(<Home />);

    const shopNowButton = screen.getByRole('button', { name: /SHOP NOW/i });
    fireEvent.click(shopNowButton);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
