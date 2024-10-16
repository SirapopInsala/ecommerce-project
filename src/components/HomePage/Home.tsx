"use client";

import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-gray-100 to-blue-100">
        <h1 className="text-5xl font-extrabold mb-8 text-gray-800">
          Welcome to Our <br />
          <span className="text-blue-500">E-Commerce</span> Website
        </h1>
        <p className="text-lg mb-6 text-gray-600">
          Discover the best products at unbeatable prices.
        </p>
        <button
          onClick={handleLoginClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
        >
          SHOP NOW
        </button>
      </div>

      <div
        className="w-1/2 h-full bg-cover"
        style={{ backgroundImage: 'url("/home.jpg")' }}
      ></div>
    </div>
  );
};

export default Home;
