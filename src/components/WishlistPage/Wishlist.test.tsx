import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Wishlist from '@/components/WishlistPage/Wishlist';
import { useCart } from '@/context/CartContext';
import fetchGraphQL from '@/utils/graphqlClient';
import { useRouter } from 'next/navigation';

jest.mock('../../context/CartContext');
jest.mock('../../utils/graphqlClient');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Wishlist', () => {
  const mockAddToCart = jest.fn();
  const mockRouter = { push: jest.fn() };

  beforeEach(() => {
    (useCart as jest.Mock).mockReturnValue({ addToCart: mockAddToCart });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Wishlist />);
    expect(screen.getByText(/loading wishlist/i)).toBeInTheDocument();
  });

  it('displays empty message if wishlist is empty', async () => {
    (fetchGraphQL as jest.Mock).mockResolvedValue({
      wishlist: [],
    });

    render(<Wishlist />);

    await waitFor(() => expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument());
  });

  it('displays wishlist items after fetching', async () => {
    const mockWishlistData = {
      wishlist: [
        {
          id: 1,
          user_id: 'user1',
          product: {
            id: 1,
            product_name: 'Test Product',
            product_image: '/test-image.jpg',
            product_price: 100,
          },
        },
      ],
    };

    (fetchGraphQL as jest.Mock).mockResolvedValue(mockWishlistData);

    render(<Wishlist />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });
  });

  it('navigates back to the account page when back button is clicked', async () => {
    const mockWishlistData = {
      wishlist: [
        {
          id: 1,
          user_id: 'user1',
          product: {
            id: 1,
            product_name: 'Test Product',
            product_image: '/test-image.jpg',
            product_price: 100,
          },
        },
      ],
    };

    (fetchGraphQL as jest.Mock).mockResolvedValue(mockWishlistData);

    render(<Wishlist />);

    // Wait for the wishlist items to load before attempting to click the back button
    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/back to account/i));

    expect(mockRouter.push).toHaveBeenCalledWith('/account');
  });
});
