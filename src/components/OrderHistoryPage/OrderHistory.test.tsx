import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OrderHistory from "@/components/OrderHistoryPage/OrderHistory"; // Adjust import as needed
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import fetchGraphQL from "@/utils/graphqlClient";

// Mock necessary hooks and contexts
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../../utils/graphqlClient", () => jest.fn());

describe("OrderHistory Component", () => {
  const mockPush = jest.fn();
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
    });
  });

  it("displays loading state while fetching orders", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user123" },
      loading: true,
    });

    render(<OrderHistory />);

    expect(screen.getByText("Loading user data...")).not.toBeNull();
  });

  it("prompts user to log in if not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<OrderHistory />);

    expect(screen.getByText("Please log in to see your orders.")).not.toBeNull();
  });

  it("displays orders when user is authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user123" },
      loading: false,
    });

    const mockOrders = [
      {
        id: "order1",
        sender_address: "123 Street",
        receiver_address: "456 Avenue",
        payment_method: "Credit Card",
        total: 100,
        created_at: "2024-10-01",
        updated_at: "2024-10-02",
        status: "completed",
        orderItems: [
          {
            product_id: 1,
            quantity: 2,
            price: 50,
            product: {
              id: "1",
              product_image: "/test-image.jpg",
              product_name: "Test Product",
              product_price: 50,
            },
          },
        ],
      },
    ];

    // Mock GraphQL response
    (fetchGraphQL as jest.Mock).mockResolvedValueOnce({
      orders: mockOrders,
    });

    render(<OrderHistory />);

    // Wait for orders to be fetched
    await waitFor(() => {
      expect(screen.getByText("Your Orders History")).not.toBeNull();
      expect(screen.getByText("Order ID: order1")).not.toBeNull();
      expect(screen.getByText("Test Product (x2)")).not.toBeNull();
      expect(screen.getByText("$100.00")).not.toBeNull();
    });
  });

  it("handles the 'Buy Again' action", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "user123" },
      loading: false,
    });

    const mockOrders = [
      {
        id: "order1",
        sender_address: "123 Street",
        receiver_address: "456 Avenue",
        payment_method: "Credit Card",
        total: 100,
        created_at: "2024-10-01",
        updated_at: "2024-10-02",
        status: "completed",
        orderItems: [
          {
            product_id: 1,
            quantity: 2,
            price: 50,
            product: {
              id: "1",
              product_image: "/test-image.jpg",
              product_name: "Test Product",
              product_price: 50,
            },
          },
        ],
      },
    ];

    // Mock GraphQL response
    (fetchGraphQL as jest.Mock).mockResolvedValueOnce({
      orders: mockOrders,
    });

    render(<OrderHistory />);

    // Wait for orders to be fetched
    await waitFor(() => {
      expect(screen.getByText("Test Product (x2)")).not.toBeNull();
    });

    // Click 'Buy Again' button
    fireEvent.click(screen.getByText("Buy Again"));

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith({
        id: 1,
        product_price: 50,
        product_name: "Test Product",
        product_image: "/test-image.jpg",
        quantity: 2,
      });
      expect(mockPush).toHaveBeenCalledWith("/shopping_cart");
    });
  });
});
