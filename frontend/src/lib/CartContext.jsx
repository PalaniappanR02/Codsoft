import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'shopeasy_cart';
const COUPON_KEY = 'shopeasy_coupon';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadCoupon() {
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(loadCoupon);
  const [bounceTrigger, setBounceTrigger] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
  }, [appliedCoupon]);

  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    const itemId = variant ? `${product.id}-${variant.id}` : `${product.id}-default`;
    setItems(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.map(i =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      const newItem = {
        id: itemId,
        product_id: product.id,
        name: product.name,
        slug: product.slug,
        price: variant ? variant.price || product.price : product.price,
        image: product.images?.[0] || '',
        quantity,
        variant_id: variant?.id || null,
        variant_label: variant?.label || null,
        stock_qty: product.stock_qty,
        track_inventory: product.track_inventory,
      };
      return [...prev, newItem];
    });
    setBounceTrigger(t => t + 1);
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQty = useCallback((itemId, quantity) => {
    if (quantity < 1) return;
    setItems(prev =>
      prev.map(i => {
        if (i.id === itemId) {
          const maxQty = i.track_inventory ? i.stock_qty : 999;
          return { ...i, quantity: Math.min(quantity, maxQty) };
        }
        return i;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const applyCoupon = useCallback((coupon) => {
    setAppliedCoupon(coupon);
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discount = 0;
  let shippingFee = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round((subtotal * appliedCoupon.value / 100) * 100) / 100;
    } else if (appliedCoupon.type === 'flat') {
      discount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  return (
    <CartContext.Provider value={{
      items,
      cartCount,
      subtotal,
      discount,
      shippingFee,
      appliedCoupon,
      isCartOpen,
      bounceTrigger,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      openCart,
      closeCart,
      applyCoupon,
      removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}