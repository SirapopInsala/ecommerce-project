import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductSearch from '@/components/ProductSearchPage/ProductSearch';
import fetchGraphQL from '@/utils/graphqlClient';
import { useRouter } from 'next/navigation';

jest.mock('../../utils/graphqlClient');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = { push: jest.fn() };
(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('ProductSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input and button', () => {
    render(<ProductSearch />);
    expect(screen.getByPlaceholderText(/search for products.../i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('displays loading state when searching', async () => {
    (fetchGraphQL as jest.Mock).mockImplementation(() => new Promise(() => {})); // Mocking a pending promise

    render(<ProductSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search for products.../i), {
      target: { value: 'Test Product' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i })); // Click the search button

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('displays products when the search is successful', async () => {
    const mockProducts = [
      {
        id: 1,
        product_name: 'Test Product',
        product_price: 100,
        product_image: '/test-image.jpg',
      },
    ];

    (fetchGraphQL as jest.Mock).mockResolvedValue({ products: mockProducts });

    render(<ProductSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search for products.../i), {
      target: { value: 'Test Product' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i })); // Click the search button

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('displays a message when no products are found', async () => {
    (fetchGraphQL as jest.Mock).mockResolvedValue({ products: [] });

    render(<ProductSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search for products.../i), {
      target: { value: 'Non-existent Product' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i })); // Click the search button

    await waitFor(() => expect(screen.getByText(/no products found/i)).toBeInTheDocument());
  });

  it('alerts when a product is added to the cart', async () => {
    const mockProducts = [
      {
        id: 1,
        product_name: 'Test Product',
        product_price: 100,
        product_image: '/test-image.jpg',
      },
    ];

    (fetchGraphQL as jest.Mock).mockResolvedValue({ products: mockProducts });

    render(<ProductSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search for products.../i), {
      target: { value: 'Test Product' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i })); // Click the search button

    await waitFor(() => expect(screen.getByText('Test Product')).toBeInTheDocument());

    // Mocking window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(window.alert).toHaveBeenCalledWith('Test Product has been added to your cart!');
  });

  it('navigates back to the product catalog when the back button is clicked', () => {
    render(<ProductSearch />);
    
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    
    expect(mockRouter.push).toHaveBeenCalledWith('/product_catalog');
  });
});
