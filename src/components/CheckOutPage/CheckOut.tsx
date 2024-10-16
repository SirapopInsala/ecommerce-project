"use client";

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useOrder } from '@/context/OrderContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CheckOut = () => {
  const { cart, getTotal } = useCart();
  const { createOrder } = useOrder();
  const router = useRouter();

  const [sender_address, setSender_address] = useState<string>('');
  const [receiver_address, setReceiver_address] = useState<string>('');
  const [payment_method, setPayment_method] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {

    if (!sender_address || !receiver_address || !payment_method) {
      alert('Please fill in all fields.');
      return;
    }

    const orderData = {
      sender_address: sender_address,
      receiver_address: receiver_address,
      payment_method: payment_method,
      orderItems: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.product_price,
      })),
      total: Number(getTotal()),
    };
    console.log("Order Data: ", orderData);

    setIsLoading(true);
    setError(null);

    try {
      await createOrder(orderData);
      alert('Order placed successfully!');
      router.push('/account/my_orders');
    } catch (err) {
      console.error('Order placement failed:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg text-black">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Check Out</h1>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Sender Address</h2>
        <textarea
          placeholder="Enter sender's address"
          value={sender_address}
          onChange={(e) => setSender_address(e.target.value)}
          className="w-full px-4 py-3 border rounded resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Receiver Address</h2>
        <textarea
          placeholder="Enter receiver's address"
          value={receiver_address}
          onChange={(e) => setReceiver_address(e.target.value)}
          className="w-full px-4 py-3 border rounded resize-none h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Payment Method</h2>
        <div className="relative">
          <button
            className={`w-full px-4 py-3 border rounded text-left flex items-center justify-between transition duration-300 ${payment_method === 'credit_card' ? 'bg-blue-100 border-blue-500' : ''}`}
            onClick={() => setPayment_method('credit_card')}
          >
            <span className="flex items-center">
              <Image src="/credit-card-icon.jpg" alt="Credit Card" width={24} height={24} className="inline-block w-6 h-6 mr-2" />
              Credit/Debit Card
            </span>
            {payment_method === 'credit_card' && <span className="text-blue-500 font-bold">&#10003;</span>}
          </button>
          <button
            className={`w-full px-4 py-3 border rounded text-left flex items-center justify-between mt-3 transition duration-300 ${payment_method === 'cash_on_delivery' ? 'bg-blue-100 border-blue-500' : ''}`}
            onClick={() => setPayment_method('cash_on_delivery')}
          >
            <span className="flex items-center">
              <Image src="/money-icon.jpg" alt="Cash on Delivery" width={24} height={24} className="inline-block w-6 h-6 mr-2" />
              Cash On Delivery
            </span>
            {payment_method === 'cash_on_delivery' && <span className="text-blue-500 font-bold">&#10003;</span>}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Products in Cart</h2>
        {cart.map((product) => (
          <div key={product.id} className="flex justify-between items-center py-2 border-b">
            <Image src={product.product_image ?? '/default-image.jpg'} alt={product.product_name ?? 'Product Image'} width={80} height={80} className="w-20 h-20 object-cover mr-4 rounded" />
            <div className="flex-1">
              <span className="text-gray-700 font-medium">{product.product_name}</span>
              <span className="block text-sm text-gray-500">Qty: {product.quantity}</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">${(product.product_price * product.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-6 border-t pt-4">
        <h2 className="text-xl font-bold text-gray-800">Total:</h2>
        <span className="text-xl font-bold text-blue-600">${getTotal()}</span>
      </div>

      <button
        onClick={handlePlaceOrder}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 text-lg font-medium"
        disabled={isLoading || !sender_address || !receiver_address || !payment_method}
      >
        {isLoading ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default CheckOut;
