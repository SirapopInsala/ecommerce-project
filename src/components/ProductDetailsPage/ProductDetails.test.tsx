import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductDetails from '@/components/ProductDetailsPage/ProductDetails';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import fetchGraphQL from '@/utils/graphqlClient';

jest.mock('../../context/CartContext');
jest.mock('../../context/AuthContext');
jest.mock('../../utils/graphqlClient');
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: '1' })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('ProductDetails', () => {
  const mockAddToCart = jest.fn();
  const mockUser = { id: 'user1' };

  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({ addToCart: mockAddToCart });
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Restore window.alert
  });

  it('renders loading state initially', () => {
    render(<ProductDetails />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays product details after fetching', async () => {
    (fetchGraphQL as jest.Mock).mockResolvedValue({
      products: [{
        id: 1,
        product_name: 'Test Product',
        product_price: 100,
        product_description: 'Test Description',
        product_image: '/test-image.jpg',
      }],
      wishlist: [],
    });

    render(<ProductDetails />);

    // Wait for data to load and check if product details are rendered
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('adds product to cart when Add to Cart is clicked', async () => {
    (fetchGraphQL as jest.Mock).mockResolvedValue({
      products: [{
        id: 1,
        product_name: 'Test Product',
        product_price: 100,
        product_description: 'Test Description',
        product_image: '/test-image.jpg',
      }],
      wishlist: [],
    });

    render(<ProductDetails />);

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/add to cart/i));
    
    expect(mockAddToCart).toHaveBeenCalledWith({
      id: 1,
      product_name: 'Test Product',
      product_price: 100,
      product_description: 'Test Description',
      product_image: '/test-image.jpg',
      quantity: 1,
    });

    expect(window.alert).toHaveBeenCalledWith('Test Product has been added to your cart! Quantity: 1');
  });
});
