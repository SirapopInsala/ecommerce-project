"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import fetchGraphQL from '@/utils/graphqlClient';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const Account = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchWishlistCount = async () => {
        const query = `
          query WishlistCount($userId: uuid!) {
            wishlist_aggregate(where: { user_id: { _eq: $userId } }) {
              aggregate {
                count
              }
            }
          }
        `;
        const variables = {
          userId: user?.id,
        };

        try {
          const response = await fetchGraphQL(query, variables);
          const count = response?.wishlist_aggregate?.aggregate?.count || 0;
          setWishlistCount(count);
        } catch (error) {
          console.error('Error fetching wishlist count:', error);
        }
      };

      fetchWishlistCount();
    }
  }, [user]);

  const handleLogout = async () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return <p className="text-black text-center bg-white h-screen">Loading...</p>;
  }

  return (
    <div className="p-5 bg-white h-screen shadow-md">
      {/* Profile Section */}
      <div className="flex items-center mb-6">
        <Image 
          src="/profile-icon.jpg" 
          alt="Profile" 
          width={64}
          height={64}
          className="rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl text-black font-bold">{user.firstname} {user.lastname}</h2>
          <button 
            onClick={() => router.push('/account/wishlist')}
            className="text-gray-600"
          >
            {wishlistCount} wishlist
          </button>
        </div>
        {/* Logout Button */}
        <div className="ml-5">
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* My Orders Section */}
      <div className="mt-5 text-black flex justify-between">
        <h1 className="text-xl">My Orders</h1>
        <div className="flex">
          <button 
            onClick={() => router.push('/account/order_history')}
            className="flex items-center bg-white text-xl text-black rounded hover:bg-gray-100 transition duration-300 mb-3"
          >
            View All Orders History
            <Image src="/right-icon.jpg" alt="order_history" width={20} height={20} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mt-10 flex space-x-4">
        <button 
          onClick={() => router.push('/account/my_orders')}
          className="flex flex-col items-center bg-white text-black px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 mb-4 text-center"
        >
          <Image src="/billing-icon.jpg" alt="Orders_Summary" width={80} height={80} priority={true} className="mb-2" />
          Orders Summary
        </button>
        <button 
          onClick={() => router.push('/account/my_orders')}
          className="flex flex-col items-center bg-white text-black px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 mb-4 text-center"
        >
          <Image src="/receive-icon.jpg" alt="To_Receive" width={80} height={80} priority={true} className="mb-2" />
          To Receive
        </button>
      </div>

      
    </div>
  );
};

export default Account;
