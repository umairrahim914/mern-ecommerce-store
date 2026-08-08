import { createContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Re-fetch the cart whenever login state changes (login, logout, page load)
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, variantId, quantity) => {
    const { data } = await axiosInstance.post('/cart/items', { productId, variantId, quantity });
    setCart(data);
    return data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const { data } = await axiosInstance.put(`/cart/items/${itemId}`, { quantity });
    setCart(data);
    return data;
  };

  const removeCartItem = async (itemId) => {
    const { data } = await axiosInstance.delete(`/cart/items/${itemId}`);
    setCart(data);
    return data;
  };

  const clearCartLocally = () => {
    // Used right after a successful order — avoids an extra API round trip
    // when we already know the cart is now empty
    setCart((prev) => (prev ? { ...prev, items: [] } : prev));
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, itemCount, fetchCart, addToCart, updateCartItem, removeCartItem, clearCartLocally }}
    >
      {children}
    </CartContext.Provider>
  );
};