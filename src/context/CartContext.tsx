"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import fetchGraphQL from '@/utils/graphqlClient';
import { useAuth } from '@/context/AuthContext';

type Product = {
  id: number;
  product_price: number;
  product_name: string | undefined;
  product_image: string | undefined;
  quantity: number;
};

type CartContextType = {
  cart: Product[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  increaseQuantity: (id: number) => Promise<void>;
  decreaseQuantity: (id: number) => Promise<void>;
  getTotal: () => string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (product: Product) => {
    if (!userId) {
      console.error("User ID is required to add to cart");
      return;
    }
    
    const existingProduct = cart.find((item) => item.id === product.id);
    const newQuantity = existingProduct ? existingProduct.quantity + 1 : 1;

    setCart((prevCart) => {
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: newQuantity }];
      }
    });

    const mutation = `
      mutation InsertCart($object: cart_insert_input!) {
        insert_cart(objects: [$object]) {
          returning {
            id
          }
        }
      }
    `;

    const variables = {
      object: {
        product_id: product.id,
        quantity: newQuantity,
        product_price: product.product_price,
        user_id: userId,
      },
    };

    console.log('variables:', variables);

    try {
      const response = await fetchGraphQL(mutation, variables);
      console.log('Insert response:', response);
    } catch (error) {
      console.error('Error inserting product to cart in Hasura:', error);
    }
  };

  console.log('Current cart:', cart);

  const removeFromCart = async (product_id: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.id !== product_id);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      console.log('Updated removeFromCart cart:', updatedCart);
      return updatedCart;
    });
  
    const mutation = `
      mutation DeleteCartByProduct($product_id: Int!, $user_id: Int!) {
        delete_cart(where: {product_id: {_eq: $product_id}, user_id: {_eq: $user_id}}) {
          affected_rows
        }
      }
    `;
  
    const variables = { product_id, user_id: userId };
    console.log('removeFromCart variables:', variables);
  
    try {
      const response = await fetchGraphQL(mutation, variables);
      console.log('Delete response:', response);
    } catch (error) {
      console.error('Error deleting product from cart in Hasura:', error);
    }
  };
  
  const increaseQuantity = async (product_id: number) => {
    if (!userId) return;
    const currentProduct = cart.find(item => item.id === product_id);
    if (!currentProduct) return;
  
    const newQuantity = currentProduct.quantity + 1;
  
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.id === product_id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      console.log('Updated increaseQuantity cart:', updatedCart);
      return updatedCart;
    });
  
    const mutation = `
      mutation UpdateCartQuantity($product_id: Int!, $user_id: Int!, $quantity: Int!) {
        update_cart(where: {product_id: {_eq: $product_id}, user_id: {_eq: $user_id}}, _set: {quantity: $quantity}) {
          affected_rows
        }
      }
    `;
  
    const variables = { product_id, user_id: userId, quantity: newQuantity };
    console.log('increaseQuantity variables:', variables);
  
    try {
      const response = await fetchGraphQL(mutation, variables);
      console.log('Update response:', response);
    } catch (error) {
      console.error('Error updating product quantity in Hasura:', error);
    }
  };  

  const decreaseQuantity = async (product_id: number) => {
    if (!userId) return;
    const currentProduct = cart.find(item => item.id === product_id);
    if (!currentProduct) return;
  
    if (currentProduct.quantity > 1) {
      const newQuantity = currentProduct.quantity - 1;
  
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) =>
          item.id === product_id ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        console.log('Updated decreaseQuantity cart:', updatedCart);
        return updatedCart;
      });
  
      const mutation = `
        mutation UpdateCartQuantity($product_id: Int!, $user_id: Int!, $quantity: Int!) {
          update_cart(where: {product_id: {_eq: $product_id}, user_id: {_eq: $user_id}}, _set: {quantity: $quantity}) {
            affected_rows
          }
        }
      `;
  
      const variables = { product_id, user_id: userId, quantity: newQuantity };
      console.log('decreaseQuantity variables:', variables);
  
      try {
        const response = await fetchGraphQL(mutation, variables);
        console.log('Update response:', response);
      } catch (error) {
        console.error('Error updating product quantity in Hasura:', error);
      }
    } else {
      await removeFromCart(product_id);
    }
  };  

  const getTotal = () => {
    return cart.reduce((total, product) => {
      const price = product.product_price;
      const quantity = product.quantity;
      return total + price * quantity;
    }, 0).toFixed(2);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, getTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
