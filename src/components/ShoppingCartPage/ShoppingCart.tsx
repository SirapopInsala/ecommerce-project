"use client";

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ShoppingCart = () => {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, getTotal } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert('User is not logged in.');
      return;
    }

    const confirmation = window.confirm('Are you sure you want to proceed to checkout?');
    if (!confirmation) {
      return; // If the user cancels, exit the function
    }

    console.log('User Name:', user.firstname, user.lastname);
    console.log('Cart Items:', cart);
    
    alert("Proceeding to checkout!");
    router.push('/checkout');
  };  

  return (
    <div className="p-5 h-screen bg-white rounded-lg shadow-md">
      <button onClick={() => router.push('/product_catalog')} className="flex items-center text-black mb-4">
        <img src="/left-icon.jpg" alt="Back" className="h-6 w-6 mr-2" />
        Back
      </button>
      <h1 className="text-2xl text-black font-bold flex justify-center mb-5">Shopping Cart</h1>
      {cart.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {cart.map(product => (
            <div key={`${product.id}-${product.quantity}`} className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img src={product.product_image} alt={product.product_name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                <div>
                  <h2 className="text-lg text-black font-semibold">{product.product_name}</h2>
                  <p className="text-lg text-gray-800 font-bold">
                    ${product.product_price ? product.product_price.toFixed(2) : '0.00'} x {product.quantity}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <button 
                    onClick={() => decreaseQuantity(product.id)} 
                    className="bg-black px-3 py-1 rounded-l"
                  >
                    -
                  </button>
                  <input 
                    type="text" 
                    value={product.quantity} 
                    readOnly 
                    className="border-t border-b text-center text-black w-12 h-9" 
                  />
                  <button 
                    onClick={() => increaseQuantity(product.id)} 
                    className="bg-black px-3 py-1 rounded-r"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(product.id)} 
                  className="bg-red-500 text-white px-3 py-1 rounded mt-2 hover:bg-red-600 transition duration-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-red-500">Your cart is empty.</p>
      )}
      <div className="flex justify-between mt-10 border-t-2">
        <h2 className="text-xl text-black font-bold mt-5">Total: ${getTotal()}</h2>
        <button 
          onClick={handleCheckout} 
          className="bg-blue-500 text-white mt-5 px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Check Out
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart;
