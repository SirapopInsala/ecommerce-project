import React from 'react';
import { render, screen } from '@testing-library/react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // Import useRouter at the top
import Navbar from './Navbar';

jest.mock('../../context/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Navbar Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({
      cart: [],
    });

    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    (useRouter as jest.Mock).mockImplementation(() => ({
      push: mockPush,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Navbar with guest user', () => {
    render(<Navbar />);

    expect(screen.getByAltText('Logo')).toBeTruthy();
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Guest')).toBeTruthy();
    expect(screen.queryByText('Cart')).toBeNull();
  });

  test('renders Navbar with user name', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstname: 'John', lastname: 'Doe' },
    });

    render(<Navbar />);

    expect(screen.getByText('John Doe')).not.toBeNull();
  });

  test('displays cart item count', () => {
    (useCart as jest.Mock).mockReturnValue({
      cart: [{ id: 1, product_price: 100, quantity: 2 }],
    });

    render(<Navbar />);

    expect(screen.getByText('2')).not.toBeNull(); // Cart count
  });

  test('navigates to shopping cart on cart button click', () => {
    render(<Navbar />);
    
    // Simulate a click on the cart button
    screen.getByAltText('Cart').click();
    expect(mockPush).toHaveBeenCalledWith('/shopping_cart');
  });

  test('navigates to account on profile button click', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { firstname: 'John', lastname: 'Doe' },
    });

    render(<Navbar />);
    
    // Simulate a click on the profile button
    screen.getByText('John Doe').click();
    
    // Check that the push function was called
    expect(mockPush).toHaveBeenCalledWith('/account');
  });
});
