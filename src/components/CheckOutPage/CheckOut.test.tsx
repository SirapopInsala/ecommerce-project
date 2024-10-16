import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useCart } from '../../context/CartContext';
import { useOrder } from '../../context/OrderContext';
import CheckOut from './CheckOut';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

// Mocking context
jest.mock('../../context/CartContext', () => ({
  useCart: jest.fn(),
}));

jest.mock('../../context/OrderContext', () => ({
  useOrder: jest.fn(),
}));

// Mocking useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('CheckOut Component', () => {
  const mockCart = [
    { id: 1, product_name: 'Product 1', quantity: 2, product_price: 10, product_image: '/product1.jpg' },
    { id: 2, product_name: 'Product 2', quantity: 1, product_price: 20, product_image: '/product2.jpg' },
  ];

  const mockRouter = {
    push: jest.fn(),
    query: {},
    pathname: '/',
    asPath: '/',
  };

  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({
      cart: mockCart,
      getTotal: jest.fn().mockReturnValue(40),
    });

    (useOrder as jest.Mock).mockReturnValue({
      createOrder: jest.fn(),
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter); // Ensure to mock the router correctly
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component correctly', () => {
    render(<CheckOut />);
    
    expect(screen.getByText(/check out/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/enter sender's address/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/enter receiver's address/i)).toBeTruthy();
    expect(screen.getByText(/credit\/debit card/i)).toBeTruthy();
    expect(screen.getByText(/cash on delivery/i)).toBeTruthy();
    expect(screen.getByText(/total:/i)).toBeTruthy();
  });

  test('places an order successfully', async () => {
    const createOrderMock = jest.fn();
    (useOrder as jest.Mock).mockReturnValue({
      createOrder: createOrderMock,
    });

    render(<CheckOut />);

    fireEvent.change(screen.getByPlaceholderText(/enter sender's address/i), {
      target: { value: 'Sender Address' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter receiver's address/i), {
      target: { value: 'Receiver Address' },
    });
    fireEvent.click(screen.getByText(/credit\/debit card/i));

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderButton);
    
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      sender_address: 'Sender Address',
      receiver_address: 'Receiver Address',
      payment_method: 'credit_card',
      orderItems: [
        { product_id: 1, quantity: 2, price: 10 },
        { product_id: 2, quantity: 1, price: 20 },
      ],
      total: 40,
    });
  });

  test('shows loading state while placing order', async () => {
    const createOrderMock = jest.fn().mockImplementation(() => new Promise(() => {})); // Hang indefinitely
    (useOrder as jest.Mock).mockReturnValue({
      createOrder: createOrderMock,
    });

    render(<CheckOut />);

    fireEvent.change(screen.getByPlaceholderText(/enter sender's address/i), {
      target: { value: 'Sender Address' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter receiver's address/i), {
      target: { value: 'Receiver Address' },
    });
    fireEvent.click(screen.getByText(/credit\/debit card/i));

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderButton);

    expect(placeOrderButton).toHaveTextContent('Placing Order...');
  });
  
  test('displays error message when order placement fails', async () => {
    const createOrderMock = jest.fn().mockRejectedValue(new Error('Failed to place order.'));
    (useOrder as jest.Mock).mockReturnValue({
      createOrder: createOrderMock,
    });

    render(<CheckOut />);

    fireEvent.change(screen.getByPlaceholderText(/enter sender's address/i), {
      target: { value: 'Sender Address' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter receiver's address/i), {
      target: { value: 'Receiver Address' },
    });
    fireEvent.click(screen.getByText(/credit\/debit card/i));

    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to place order. Please try again.')).toBeTruthy();
    });
  });
});
