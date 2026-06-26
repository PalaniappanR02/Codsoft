import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const WishlistContext = createContext(null);

const STORAGE_KEY = 'shopeasy_wishlist';

function loadWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(loadWishlist);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggleWishlist = useCallback((product) => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.filter(i => i.product_id !== product.id);
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] || '',
      }];
    });
  }, []);

  const isWishlisted = useCallback((productId) => {
    return items.some(i => i.product_id === productId);
  }, [items]);

  const removeWishlist = useCallback((productId) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  }, []);

  return (
    <WishlistContext.Provider value={{
      items,
      wishlistCount: items.length,
      toggleWishlist,
      isWishlisted,
      removeWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
}