import { render, screen } from '@testing-library/react';
import ProductCatalog from '@/components/ProductCatalogPage/ProductCatalog';
import fetchGraphQL from '@/utils/graphqlClient';

jest.mock('../../utils/graphqlClient', () => jest.fn());

test('displays products after fetching', async () => {
  const mockProducts = [
    {
      id: 1,
      product_name: 'Product 1',
      product_price: 100,
      product_image: '/product1.jpg',
      product_description: 'Description 1',
    },
    {
      id: 2,
      product_name: 'Product 2',
      product_price: 150,
      product_image: '/product2.jpg',
      product_description: 'Description 2',
    },
  ];

  (fetchGraphQL as jest.Mock).mockResolvedValue({
    products: mockProducts,
  });

  render(<ProductCatalog />);

  const productNames = await screen.findAllByText(/Product [1-2]/);
  expect(productNames).toHaveLength(2);

  expect(screen.getByText('$100.00')).toBeTruthy();
  expect(screen.getByText('$150.00')).toBeTruthy();
});
