"use client";

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import fetchGraphQL from '@/utils/graphqlClient';
import Link from 'next/link';
import Image from 'next/image';

type Product = {
  id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_description: string;
};

type CartProduct = Product & {
  quantity: number;
};

const ProductCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToCart } = useCart();

  const fetchProductsFromHasura = async () => {
    const query = `
      query {
        products {
          id
          product_name
          product_description
          product_price
          product_image
          
        }
      }
    `;
    
    const response = await fetchGraphQL(query);
    console.log('GraphQL Response:', response);
    return response;
    
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetchProductsFromHasura();
        console.log('GraphQL Response:', response);
  
        if (response && response.products) {
          const products = response.products;
          if (Array.isArray(products) && products.length > 0) {
            setProducts(products);
          } else {
            console.error('No products found or invalid data structure:', products);
          }
        } else {
          console.error('Invalid response structure:', response);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);  

  return (
    <div className="p-5 bg-gray-100">
      <h1 className="text-4xl text-center text-gray-800 font-bold mb-8">Product Catalog</h1>
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
              <Link href={`/product/${product.id}`} className="block">
                <div className="flex justify-center items-center">
                  <Image
                    src={product.product_image}
                    alt={product.product_name}
                    width={150}
                    height={150}
                    className="object-cover rounded-lg mt-2"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl text-gray-800 font-semibold mb-2 line-clamp-2">
                    {product.product_name}
                  </h2>
                  <p className="text-lg text-gray-800 font-bold">${product.product_price.toFixed(2)}</p>
                </div>
              </Link>
              <div className="p-4">
                <button
                  onClick={() => addToCart({ ...product, quantity: 1 } as CartProduct)}
                  className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors duration-300 w-full"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
