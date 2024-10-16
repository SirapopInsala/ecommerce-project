"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import fetchGraphQL from "@/utils/graphqlClient";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext"; 
import Image from "next/image";

type OrderItem = {
    product_id: number;
    quantity: number;
    price: number;
    product: {
        id: string;
        product_image: string;
        product_name: string;
        product_price: number;
    };
};

type Order = {
    id: string;
    sender_address: string;
    receiver_address: string;
    payment_method: string;
    total: number;
    created_at: string;
    updated_at: string;
    status: string;
    orderItems: OrderItem[];
};

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { addToCart } = useCart(); 

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const currentUserId = user?.id;

        if (!currentUserId) {
            console.error("User ID is not available");
            setLoading(false);
            return;
        }

        const query = `
            query GetCompletedOrders($userId: uuid!) {
                orders(where: { user_id: { _eq: $userId }, status: { _eq: "completed" } }) {
                    id
                    sender_address
                    receiver_address
                    payment_method
                    total
                    created_at
                    updated_at
                    status
                    orderItems {
                        product_id
                        quantity
                        price
                        product {
                            id
                            product_image
                            product_name
                            product_price
                        }
                    }
                }
            }
        `;

        const variables = {
            userId: currentUserId,
        };

        try {
            const response = await fetchGraphQL(query, variables);
            console.log('Fetched Orders:', response.orders);
            if (response.orders) {
                setOrders(response.orders);
            } else {
                console.warn('Unexpected response format:', response);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [fetchOrders, user]);

    const handleBuyAgain = async (orderItems: OrderItem[]) => {
        if (orderItems.length > 0) {
            const addToCartPromises = orderItems.map(async (item) => {
                const { product_id, quantity, product } = item;
                console.log('Processing item:', item);
    
                if (product_id && product) {
                    try {
                        await addToCart({
                            id: product_id,
                            product_price: product.product_price,
                            product_name: product.product_name,
                            product_image: product.product_image,
                            quantity: quantity,
                        });
                    } catch (error) {
                        console.error('Error adding item to cart:', error);
                    }
                } else {
                    console.error('Missing product_id or product for item:', item);
                }
            });
            await Promise.all(addToCartPromises);
    
            router.push('/shopping_cart');
        }
    };                 

    if (authLoading) {
        return <p className="text-gray-500">Loading user data...</p>;
    }

    if (!user) {
        return <p className="text-gray-500">Please log in to see your orders.</p>;
    }

    if (loading) {
        return <p className="text-gray-500">Loading...</p>;
    }

    return (
        <div className="p-5 h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col w-full">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                    <button onClick={() => router.push('/account')} className="flex items-center text-gray-700 mr-5 hover:text-gray-500 transition duration-300">
                        <Image src="/left-icon.jpg" alt="Back" width={32} height={32} priority={false} className="mr-3" />
                        <span className="text-lg font-semibold">Back to Account</span>
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 flex justify-center">Your Orders History</h2>
                {orders.length > 0 ? (
                    <div className="text-gray-700">
                        <h3 className="font-semibold text-xl mt-6">Items:</h3>
                        {orders.map(order => (
                            <div key={order.id} className="mt-4 border-b pb-4">
                                <h4 className="font-bold text-lg">Order ID: {order.id}</h4>
                                <p className="text-sm">Sender Address: {order.sender_address}</p>
                                <p className="text-sm">Receiver Address: {order.receiver_address}</p>
                                <p className="text-sm">Payment Method: {order.payment_method}</p>

                                {order.orderItems.map((item, index) => (
                                    <div key={item.product_id || `orderItem-${index}`} className="flex items-center justify-start mt-2">
                                        <Image src={item.product.product_image} alt={item.product.product_name} width={100} height={100} className="h-16 w-16 object-cover rounded-md" />
                                        <div className="ml-4 flex flex-col">
                                            <span className="font-medium">{item.product.product_name} (x{item.quantity})</span>
                                            <span className="text-gray-600">${(item.product.product_price * item.quantity).toFixed(2)}</span> {/* Updated here */}
                                        </div>
                                    </div>
                                ))}
                                <p className="font-bold text-xl mt-2">Total: ${order.total.toFixed(2)}</p>
                                <button
                                    onClick={() => handleBuyAgain(order.orderItems)}
                                    className="bg-blue-500 text-white w-full py-2 rounded-md mt-4 hover:bg-blue-600 transition duration-300"
                                >
                                    Buy Again
                                </button>
                            </div>
                        ))} 
                    </div>
                ) : (
                    <p className="text-gray-500">No orders available</p>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
