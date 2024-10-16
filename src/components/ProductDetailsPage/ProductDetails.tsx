"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import fetchGraphQL from '@/utils/graphqlClient';
import Image from 'next/image';

type Product = {
  id: number;
  product_name: string;
  product_price: number;
  product_description: string;
  product_image: string;
};

type CartItem = Product & {
  quantity: number;
};

const ProductDetails = () => {
  const { addToCart } = useCart();
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProductDetails = async (id: number) => {
      const query = `
        query {
          products(where: { id: { _eq: ${id} } }) {
            id
            product_name
            product_description
            product_price
            product_image
          }
        }
      `;

      try {
        const response = await fetchGraphQL(query);
        const products = response.products;

        if (products.length > 0) {
          setProduct(products[0]); // Get the first product from the results

          // Check if product is in wishlist
          const wishlistResponse = await fetchGraphQL(`query { wishlist(where: { product_id: { _eq: ${products[0].id} } }) { id } }`);
          setIsInWishlist(wishlistResponse.wishlist.length > 0);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Error fetching product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails(Number(id));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = {
        ...product,
        quantity,
      };
      addToCart(cartItem);
      alert(`${product.product_name} has been added to your cart! Quantity: ${quantity}`);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
  
    if (!user) {
      alert("Please log in to add items to your wishlist.");
      return;
    }
  
    try {
      const response = await fetchGraphQL(`
        query {
          wishlist(where: { product_id: { _eq: ${product.id} }, user_id: { _eq: "${user.id}" } }) {
            id
          }
        }
      `);
      
      if (response && response.wishlist && response.wishlist.length > 0) {
        // ถ้ามีใน wishlist, ลบออก
        await fetchGraphQL(`
          mutation {
            delete_wishlist(where: { product_id: { _eq: ${product.id} }, user_id: { _eq: "${user.id}" } }) {
              affected_rows
            }
          }
        `);
        setIsInWishlist(false);
        alert(`${product.product_name} has been removed from your wishlist!`);
      } else {
        // ถ้าไม่มีใน wishlist, เพิ่มเข้าไป
        await fetchGraphQL(`
          mutation {
            insert_wishlist(objects: { product_id: ${product.id}, user_id: "${user.id}" }) {
              returning {
                id
              }
            }
          }
        `);
        setIsInWishlist(true);
        alert(`${product.product_name} has been added to your wishlist!`);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError('Error updating wishlist');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-600">Loading...</p>;
    }
    if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }
    if (product) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col">
          <button onClick={() => router.push('/product_catalog')} className="flex items-center text-black mb-4">
          <Image src="/left-icon.jpg" alt="Back" width={32} height={32} className="mr-2" />
            Back
          </button>
          <div className="flex items-center">
            <img src={product.product_image} alt={product.product_name} className="w-3/4 sm:w-1/2 md:w-1/3 h-auto object-cover rounded-lg mr-4" />
            <div className="flex-1 ml-6">
              <h1 className="text-3xl text-black font-bold mb-2">{product.product_name}</h1>
              <button 
                onClick={toggleWishlist} 
                className={`mr-4 ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`}>
                <img 
                  src={isInWishlist ? '/heart-filled.jpg' : '/heart-empty.jpg'} 
                  alt="Wishlist" 
                  className="w-6 h-6" 
                />
              </button>
              <p className="text-lg text-gray-800 font-semibold mb-4">${product.product_price.toFixed(2)}</p>
              <div className="flex items-center mb-4">
                <button onClick={handleAddToCart} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition duration-300 mr-4">
                  Add to Cart
                </button>
                <button 
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                  className="bg-black px-3 py-1 rounded-l">
                    -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className="border-t border-b text-center text-black w-12 h-9" />
                <button 
                  onClick={() => setQuantity((q) => q + 1)} 
                  className="bg-black px-3 py-1 rounded-r">
                    +
                </button>
              </div>
              <p className="text-gray-600">{product.product_description}</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      {renderContent()}
    </div>
  );
};

export default ProductDetails;
