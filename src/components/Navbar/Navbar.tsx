"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

type Product = {
  id: number;
  product_price: number;
  quantity: number;
};

const Navbar = () => {
  const router = useRouter();
  const { cart } = useCart();
  const { user } = useAuth();

  const totalItemsInCart = cart.reduce((total: number, item: Product) => total + item.quantity, 0);

  return (
    <nav className="flex items-center justify-between p-5 bg-gray-100 shadow border-b-2">
      {/* Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
        <img src="/logo.jpg" alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-4 text-black">
        <button onClick={() => router.push('/')} className="text-lg">Home</button>
        <button onClick={() => router.push('/product_catalog')} className="text-lg">Products</button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center">
        <button onClick={() => router.push('/product_search')} className="bg-white p-2 rounded-full border-2 w-60">
          <img src="/search-icon.jpg" alt="Search" className="h-6 w-8" />
        </button>
      </div>

      {/* User Profile and Cart */}
      <div className="flex items-center space-x-4">
        <button onClick={() => router.push('/shopping_cart')} className="relative">
          <img src="/cart-icon.jpg" alt="Cart" className="h-6 w-8" />
          {totalItemsInCart > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {totalItemsInCart}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button onClick={() => router.push('/account')} className="flex items-center space-x-2">
          <img src="/profile-icon.jpg" alt="Profile" className="h-8 w-8 rounded-full" />
          {user ? (
            <span className="text-black">{`${user.firstname} ${user.lastname}`}</span>
          ) : (
            <span className="text-black">Guest</span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
