"use client";

import Account from '@/components/AccountPage/Account';
import { useRouter } from 'next/navigation';

const AccountPage = () => {

    const router = useRouter();

    return (
        <div>
            <div className="flex mr-10 bg-white border-b-2 w-full">
                <button onClick={() => router.push('/product_catalog')} className="flex items-center text-gray-700 mr-5 ml-3 hover:text-gray-400 transition duration-300 mb-4 mt-4">
                    <img src="/left-icon.jpg" alt="Back" className="h-6 w-6 mr-2" />
                </button>
                <h1 className="text-xl text-black text-center font-bold mb-4 mt-4">My Account</h1>
            </div>
            <Account />
        </div>
    );
};

export default AccountPage;
