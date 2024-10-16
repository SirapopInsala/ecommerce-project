"use client";

import { useEffect, useState } from 'react';
import fetchGraphQL from '@/utils/graphqlClient';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

type WishlistItem = {
  id: number;
  product: {
    id: number;
    product_name: string;
    product_image: string;
    product_price: number;
    quantity: number;
  };
};

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();
  const router = useRouter();

  const query = `
    query GetWishlist {
      wishlist {
        id
        user_id
        product {
          id
          product_name
          product_image
          product_price
        }
      }
    }
  `;

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await fetchGraphQL(query);
        setWishlistItems(data.wishlist);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [query]);

  const handleAddToCart = (product: WishlistItem['product']) => {
    addToCart(product);
  };

  if (loading) {
    return <p className="text-center text-lg font-medium text-gray-600">Loading wishlist...</p>;
  }

  if (wishlistItems.length === 0) {
    return <p className="text-center text-lg font-medium text-gray-600">Your wishlist is empty.</p>;
  }

  return (
    <div className="p-5 h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col text-black">
      <div className="flex items-center mb-5">
        <button onClick={() => router.push('/account')} className="flex items-center text-gray-700 mr-5 hover:text-gray-500 transition duration-300">
          <Image src="/left-icon.jpg" alt="Back" width={32} height={32} priority={false} className="mr-3" />
          <span className="text-lg font-semibold">Back to Account</span>
        </button>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Your Wishlist</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {wishlistItems.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-lg transition transform hover:-translate-y-1 hover:shadow-xl flex">
            {/* image */}
            <div className="relative h-40 w-40 flex-shrink-0 mr-6">
              <img
                src={item.product.product_image}
                alt={item.product.product_name}
                className="h-full w-full object-cover rounded-md"
              />
            </div>

            {/* product */}
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{item.product.product_name}</h2>
                <p className="text-gray-600 mt-2">${item.product.product_price.toFixed(2)}</p>
              </div>
              <button 
                onClick={() => handleAddToCart(item.product)} 
                className="self-start mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition duration-300"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
