// MyOrders.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MyOrders from './MyOrders'; // Adjust the path as necessary
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';

// Mocking the OrderContext and Next.js useRouter
jest.mock('../../context/OrderContext', () => ({
    useOrder: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('MyOrders', () => {
    const mockFetchOrders = jest.fn();
    const mockConfirmReceived = jest.fn();
    const mockCancelOrder = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        // Mocking useRouter to provide a mock push function
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });

        // Setting up the default return values for the mocked useOrder
        (useOrder as jest.Mock).mockReturnValue({
            orders: [],
            loading: false,
            fetchOrders: mockFetchOrders,
            confirmReceived: mockConfirmReceived,
            cancelOrder: mockCancelOrder,
        });
    });

    test('renders loading message when loading', () => {
        (useOrder as jest.Mock).mockReturnValueOnce({
            orders: [],
            loading: true,
            fetchOrders: mockFetchOrders,
            confirmReceived: mockConfirmReceived,
            cancelOrder: mockCancelOrder,
        });

        render(<MyOrders />);

        expect(screen.getByText(/Loading orders.../i)).not.toBeNull();
    });

    test('changes tabs correctly', () => {
        render(<MyOrders />);
    
        // Get all buttons with the text "To Receive"
        const buttons = screen.getAllByText(/To Receive/i);
        
        // Click on the first button (assuming this is the correct one)
        fireEvent.click(buttons[0]);
    
        // Assert that the button is still in the document (this is optional, depending on your behavior)
        expect(buttons[0]).not.toBeNull();
        
        // You can also check for specific UI changes that should happen on tab click.
        expect(screen.getByText(/No orders to receive/i)).not.toBeNull();
    });
    
});
