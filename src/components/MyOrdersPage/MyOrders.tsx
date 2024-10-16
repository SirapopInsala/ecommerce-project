"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrder } from "@/context/OrderContext";
import Image from "next/image";

type OrderItem = {
    product_id: number;
    quantity: number;
    price: number;
    product_image?: string;
};

type Order = {
    id: string | undefined; 
    sender_address: string;
    receiver_address: string;
    payment_method: string;
    status: string;
    total: number;
    orderItems: OrderItem[];
};

const MyOrders = () => {
    const [activeTab, setActiveTab] = useState<"summary" | "receive">("summary");
    const { orders = [], loading, fetchOrders, confirmReceived, cancelOrder } = useOrder();
    const router = useRouter();
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            setLoadingOrders(true);
            try {
                await fetchOrders();
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setLoadingOrders(false);
            }
        };
    
        if (loadingOrders) {
            loadOrders();
        }
    
        console.log("Orders:", orders);
    }, [loadingOrders, fetchOrders, orders]);

    const handleTabChange = (tab: SetStateAction<string>) => {
        setActiveTab(tab as "summary" | "receive");
    };

    const handleConfirmReceived = async (orderId: string | undefined) => {
        if (!orderId) return;
        try {
            await confirmReceived(orderId);
            router.push("/account/order_history");
        } catch (error) {
            console.error("Failed to confirm received:", error);
        }
    };

    const handleCancelOrder = async (orderId: string | undefined) => {
        if (!orderId) return;
        if (!confirm("Are you sure you want to cancel this order?")) return;
        try {
            await cancelOrder(orderId);
            await fetchOrders();
        } catch (error) {
            console.error("Failed to cancel order:", error);
        }
    };

    const renderOrderSummary = () => {
        if (loadingOrders) {
            return <p className="text-gray-500">Loading orders...</p>;
        }

        if (!Array.isArray(orders) || orders.length === 0) {
            return <p className="text-gray-500">No orders available</p>;
        }

        return (
            <div className="text-gray-700">
                {orders.map((order: Order) => {
                    console.log("Order:", order); // Log order details
                    const items = order.orderItems || []; // Get items from orderItems
                    const total = typeof order.total === 'number' ? order.total : 0;

                    return (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
                            <p>
                                <strong>Sender:</strong> {order.sender_address}
                            </p>
                            <p>
                                <strong>Receiver:</strong> {order.receiver_address}
                            </p>
                            <p>
                                <strong>Payment:</strong> {order.payment_method}
                            </p>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>

                            <h3 className="font-semibold text-xl mt-6">Items:</h3>
                            {Array.isArray(items) && items.length > 0 ? (
                                items.map((item) => {
                                    console.log("Item:", item); // Log item
                                    console.log("Product Image URL:", item.product_image);
                                    return (
                                        <div key={item.product_id} className="flex items-center justify-start mt-4">
                                            <Image src={item.product_image ?? ''} alt={`Product ${item.product_id}`} width={100} height={100} className="h-16 w-16 object-cover" />
                                            <span className="ml-4 flex-grow">
                                                Product ID: {item.product_id} (x{item.quantity}) - Price: ${(item.price).toFixed(2)}
                                            </span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500">No items in the order</p>
                            )}

                            <p className="font-bold text-xl mt-6">Total: ${total.toFixed(2)}</p>

                            {order.status !== "canceled" && order.status !== "completed" && (
                                <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    disabled={loading}
                                    className="bg-red-500 text-white w-full py-2 rounded-md mt-6 hover:bg-red-600 transition duration-300"
                                >
                                    {loading ? "Cancelling..." : "Cancel Order"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderToReceive = () => {
        const ordersToReceive = orders.filter((order) => order.status === "to_receive" || order.status === "pending");

        if (!Array.isArray(ordersToReceive) || ordersToReceive.length === 0) {
            return <p className="text-gray-500">No orders to receive</p>;
        }

        return (
            <div className="text-gray-700">
                {ordersToReceive.map((order: Order) => {
                    const total = typeof order.total === 'number' ? order.total : 0;

                    return (
                        <div key={order.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
                            <h3 className="font-semibold text-xl mt-6">Order:</h3>
                            <p>
                                <strong>Sender:</strong> {order.sender_address}
                            </p>
                            <p>
                                <strong>Receiver:</strong> {order.receiver_address}
                            </p>
                            <p>
                                <strong>Payment:</strong> {order.payment_method}
                            </p>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>

                            <h3 className="font-semibold text-xl mt-6">Items:</h3>
                            {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                                order.orderItems.map((item) => (
                                    <div key={item.product_id} className="flex items-center justify-start mt-4">
                                        <Image src={item.product_image ?? ''} alt={`Product ${item.product_id}`} width={100} height={100} className="h-16 w-16 object-cover" />
                                        <span className="ml-4 flex-grow">
                                            Product ID: {item.product_id} (x{item.quantity}) - Price: ${(item.price).toFixed(2)}
                                        </span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">No items in the order</p>
                            )}

                            <p className="font-bold text-xl mt-6">Total: ${total.toFixed(2)}</p>

                            <button
                                onClick={() => handleConfirmReceived(order.id)}
                                disabled={loading || order.status === "canceled"}
                                className={`w-full py-2 rounded-md mt-6 ${order.status === "canceled" ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 transition duration-300"}`}
                            >
                                {loading ? "Confirming..." : "Confirm Received"}
                            </button>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-5 bg-gray-100 flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={() => router.push("/account")} className="text-gray-600 hover:text-gray-500 transition duration-300 flex items-center">
                    <Image src="/left-icon.jpg" alt="Back" width={24} height={24} className="h-6 w-6 mr-2" />
                    <span>Back to Account</span>
                </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

            <div className="flex mb-6 bg-gray-200 rounded-md overflow-hidden shadow-sm">
                <button
                    onClick={() => handleTabChange("summary")}
                    className={`flex-1 py-2 text-black text-center ${activeTab === "summary" ? "bg-white" : ""} rounded-l-md transition duration-300`}
                >
                    Summary
                </button>
                <button
                    onClick={() => handleTabChange("receive")}
                    className={`flex-1 py-2 text-black text-center ${activeTab === "receive" ? "bg-white" : ""} rounded-r-md transition duration-300`}
                >
                    To Receive
                </button>
            </div>

            {activeTab === "summary" ? renderOrderSummary() : renderToReceive()}
        </div>
    );
};

export default MyOrders;
