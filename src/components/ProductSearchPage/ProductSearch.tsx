"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import fetchGraphQL from '@/utils/graphqlClient';
import Image from 'next/image';

type Product = {
  id: number;
  product_name: string;
  product_price: number;
  product_image: string;
};

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm) {
      setLoading(true);
      try {
        const query = `
          query {
            products(where: { product_name: { _ilike: "%${searchTerm}%" } }) {
              id
              product_name
              product_price
              product_image
            }
          }
        `;
        
        const response = await fetchGraphQL(query);
        const filteredProducts: Product[] = response.products;
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddToCart = (product: Product) => {
    alert(`${product.product_name} has been added to your cart!`);
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSearch} className="flex items-center bg-white rounded-lg shadow-sm p-2 mb-5">
        <button onClick={() => router.push('/product_catalog')} className="flex items-center text-gray-700 mr-5 ml-3 hover:text-gray-400 transition duration-300">
          <Image src="/left-icon.jpg" alt="Back" width={24} height={24} className="mr-2" />
        </button>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..."
          className="text-black flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring focus:ring-gray-400"
        />
        <button type="submit" className="bg-white px-4 rounded-r-lg transition duration-300 flex items-center h-12">
          <img src="/search-icon.jpg" alt="Search" className="h-6 w-7" />
        </button>
      </form>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white">
          {products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white"> 
                <Link href={`/product/${product.id}`} className="block">
                  <div className="flex justify-center items-center">
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-40 h-40 object-cover rounded-lg mt-2"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl text-gray-800 font-semibold mb-2">{product.product_name}</h2>
                    <p className="text-lg text-gray-800 font-bold">${product.product_price.toFixed(2)}</p>
                  </div>
                </Link>
                <div className="p-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-300 w-full"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="flex justify-center text-gray-600">No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
