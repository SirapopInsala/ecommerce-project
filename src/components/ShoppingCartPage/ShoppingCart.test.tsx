// import '@testing-library/jest-dom';
// import { render, screen, fireEvent } from '@testing-library/react';
// import ShoppingCart from './ShoppingCart';
// import { useCart } from '../../context/CartContext';
// import { useAuth } from '../../context/AuthContext';
// import { useRouter } from 'next/navigation'; 

// jest.mock('../../context/CartContext');
// jest.mock('../../context/AuthContext');
// jest.mock('next/navigation', () => ({
//   useRouter: jest.fn(),
// }));

// const mockedUseCart = useCart as jest.Mock;
// const mockedUseAuth = useAuth as jest.Mock;
// const mockedUseRouter = useRouter as jest.Mock;

// describe('ShoppingCart Component', () => {
//   beforeEach(() => {
//     mockedUseCart.mockReturnValue({
//       cart: [
//         {
//           id: 1,
//           product_name: 'Test Product',
//           product_image: '/test-image.jpg',
//           product_price: 100,
//           quantity: 2,
//         },
//       ],
//       removeFromCart: jest.fn(),
//       increaseQuantity: jest.fn(),
//       decreaseQuantity: jest.fn(),
//       getTotal: jest.fn().mockReturnValue(200),
//     });

//     mockedUseAuth.mockReturnValue({
//       user: { firstname: 'Bonus', lastname: 'Sirapop' },
//     });

//     mockedUseRouter.mockReturnValue({
//       push: jest.fn(),
//     });
//   });

//   it('renders the shopping cart correctly', () => {
//     render(<ShoppingCart />);

//     expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
//     expect(screen.getByText('Test Product')).toBeInTheDocument();
//     expect(screen.getByText('$100.00 x 2')).toBeInTheDocument();
//     expect(screen.getByText('Total: $200')).toBeInTheDocument();
//   });

//   it('calls the checkout function when the checkout button is clicked', () => {
//     const mockPush = mockedUseRouter().push;
//     render(<ShoppingCart />);

//     const checkoutButton = screen.getByText('Check Out');
//     fireEvent.click(checkoutButton);

//     expect(mockPush).toHaveBeenCalledWith('/checkout');
//   });
// });
