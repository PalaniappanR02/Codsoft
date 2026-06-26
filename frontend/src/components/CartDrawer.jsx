import React from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQty, removeFromCart, subtotal } = useCart();
  const { settings } = useSettings();

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[1200]" onClick={closeCart} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[1200] animate-drawer-in flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:bg-muted rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/products" onClick={closeCart}
                className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/30 transition">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    {item.variant_label && <p className="text-xs text-muted-foreground">{item.variant_label}</p>}
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1 hover:bg-white rounded transition">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1 hover:bg-white rounded transition">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-mono-price text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity, settings)}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-muted-foreground hover:text-red-500 transition self-start">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-mono-price text-lg font-semibold">{formatCurrency(subtotal, settings)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Shipping & taxes calculated at checkout</p>
            <div className="flex gap-2">
              <Link to="/cart" onClick={closeCart}
                className="flex-1 py-3 text-center border border-border rounded-lg font-medium hover:bg-muted transition text-sm">
                View Cart
              </Link>
              <Link to="/checkout" onClick={closeCart}
                className="flex-1 py-3 text-center bg-brand text-white rounded-lg font-medium hover:opacity-90 transition text-sm">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}