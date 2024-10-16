"use client";

import { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import fetchGraphQL from '@/utils/graphqlClient';
import { useAuth } from '@/context/AuthContext';

export type OrderItem = {
  product_id: number;
  quantity: number;
  price: number;
  product_image?: string;
}

export type Order = {
  id: string;
  sender_address: string;
  receiver_address: string;
  payment_method: string;
  orderItems: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'completed' | 'canceled' | 'to_receive';
}

export type OrderContextProps = {
  orders: Order[];
  loading: boolean;
  createOrder: (orderData: Omit<Order, 'status' | 'id'>) => Promise<void>;
  confirmReceived: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextProps | undefined>(undefined);

export const useOrder = (): OrderContextProps => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

type OrderProviderProps = {
  children: ReactNode;
}

const CREATE_ORDER_MUTATION = `
  mutation CreateOrder(
    $userId: uuid!, 
    $sender_address: String!, 
    $receiver_address: String!, 
    $payment_method: String!, 
    $total: numeric!, 
    $status: String!, 
    $orderItems: [orderItems_insert_input!]!
  ) {
    insert_orders_one(object: {
      user_id: $userId,
      sender_address: $sender_address,
      receiver_address: $receiver_address,
      payment_method: $payment_method,
      total: $total,
      status: $status,
      orderItems: { data: $orderItems }
    }) {
      id
      sender_address
      receiver_address
      payment_method
      total
      status
      orderItems {
        product_id
        quantity
        price
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = `
  mutation UpdateOrderStatus($orderId: uuid!, $status: String!) {
    update_orders_by_pk(pk_columns: { id: $orderId }, _set: { status: $status }) {
      id
      status
    }
  }
`;

const GET_ORDERS_QUERY = `
  query GetOrders($userId: uuid!) {
    orders(where: { user_id: { _eq: $userId } }) {
      id
      sender_address
      receiver_address
      payment_method
      total
      status
      orderItems {
        product_id
        quantity
        price
      }
    }
  }
`;

const GET_PRODUCTS_QUERY = `
  query GetProducts($productIds: [Int!]!) {
    products(where: { id: { _in: $productIds } }) {
      id
      product_image
    }
  }
`;

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchOrdersOnLoad = async () => {
      if (userId) {
        await fetchOrders();
      }
    };
    fetchOrdersOnLoad();
  }, [userId]);

  const setLoadingWithTryCatch = async (callback: () => Promise<void>) => {
    setLoading(true);
    try {
      await callback();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'status' | 'id'>) => {
    if (!userId) {
      console.error('User ID is required to create an order');
      return;
    }

    const { sender_address, receiver_address, payment_method, total, orderItems } = orderData;

    if (!orderItems || orderItems.length === 0) {
      console.error('orderItems is empty or undefined:', orderItems);
      return;
    }

    const orderItemsData = orderItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const variables = {
      userId,
      sender_address,
      receiver_address,
      payment_method,
      total,
      status: 'pending',
      orderItems: orderItemsData,
    };

    await setLoadingWithTryCatch(async () => {
      const response = await fetchGraphQL(CREATE_ORDER_MUTATION, variables);

      console.log('GraphQL Response:', response);

      if (response.errors) {
        console.error('GraphQL Errors:', response.errors);
        throw new Error('Error in GraphQL mutation');
      }

      if (!response.insert_orders_one) {
        throw new Error('Order creation response did not include an order.');
      }

      const newOrder: Order = {
        id: response.insert_orders_one.id,
        sender_address,
        receiver_address,
        payment_method,
        orderItems: orderItemsData,
        total,
        status: 'pending',
      };

      setOrders(prevOrders => [...prevOrders, newOrder]);
    });
  };

  const fetchProductImages = async (orderItems: OrderItem[]): Promise<OrderItem[]> => {
    const productIds = orderItems.map(item => item.product_id);

    if (productIds.length === 0) return [];

    const response = await fetchGraphQL(GET_PRODUCTS_QUERY, { productIds });
    console.log('GraphQL Response for products:', response);

    if (response.errors) {
      console.error('GraphQL Errors:', response.errors);
      return orderItems; // Return original orderItems if there's an error
    }

    return orderItems.map(item => {
      const product = response.products.find((p: { id: number; product_image: string | null }) => p.id === item.product_id);
      return {
        ...item,
        product_image: product ? product.product_image : null,
      };
    });
  };

  const fetchOrders = async () => {
    if (!userId) return;

    await setLoadingWithTryCatch(async () => {
      const response = await fetchGraphQL(GET_ORDERS_QUERY, { userId });

      console.log('GraphQL Response:', response);

      if (response.errors) {
        console.error('GraphQL Errors:', response.errors);
        return;
      }

      if (Array.isArray(response.orders)) {
        const ordersWithImages = await Promise.all(response.orders.map(async (order: Order) => {
          const enrichedOrderItems = await fetchProductImages(order.orderItems);
          return {
            ...order,
            orderItems: enrichedOrderItems,
          };
        }));
        setOrders(ordersWithImages);
      } else {
        console.warn('No orders found or response format is unexpected:', response);
        setOrders([]);
      }
    });
  };

  const confirmReceived = async (orderId: string) => {
    const newStatus = 'completed';

    await setLoadingWithTryCatch(async () => {
      await fetchGraphQL(UPDATE_ORDER_STATUS_MUTATION, { orderId, status: newStatus });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    });
  };

  const cancelOrder = async (orderId: string) => {
    const newStatus = 'canceled';

    await setLoadingWithTryCatch(async () => {
      await fetchGraphQL(UPDATE_ORDER_STATUS_MUTATION, { orderId, status: newStatus });
      setOrders(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    });
  };

  // Wrap the context value in useMemo to avoid unnecessary re-renders
  const value = useMemo(() => ({
    orders,
    loading,
    createOrder,
    confirmReceived,
    cancelOrder,
    fetchOrders,
  }), [orders, loading]); // Add any other dependencies if necessary

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};
