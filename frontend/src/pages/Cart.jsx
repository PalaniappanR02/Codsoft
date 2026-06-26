import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useCart } from '@/lib/CartContext';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal, appliedCoupon, applyCoupon, removeCoupon, discount } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const coupons = await base44.entities.Coupon.filter({ active: true }, '-created_date', 100);
      const coupon = coupons?.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
      if (!coupon) { toast.error('Invalid coupon code'); return; }
      if (coupon.min_order && subtotal < coupon.min_order) {
        toast.error(`Minimum order of ${formatCurrency(coupon.min_order, settings)} required`); return;
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error('This coupon has expired'); return;
      }
      if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
        toast.error('This coupon is not yet active'); return;
      }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error('This coupon has reached its usage limit'); return;
      }
      applyCoupon(coupon);
      toast.success(`Coupon "${coupon.code}" applied!`);
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const isFreeShippingCoupon = appliedCoupon?.type === 'free_shipping';
  const shippingFee = isFreeShippingCoupon || subtotal >= (settings.free_shipping_threshold || 100) ? 0 : (settings.flat_shipping_fee || 10);
  const tax = Math.round((subtotal - discount) * ((settings.tax_rate || 0) / 100) * 100) / 100;
  const total = Math.max(0, subtotal - discount + shippingFee + tax);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center animate-page-in">
        <ShoppingBag className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 p-4 bg-white border border-border rounded-xl">
              <Link to={`/product/${item.slug}`} className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">📦</div>}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.slug}`} className="font-medium text-sm sm:text-base hover:text-brand transition line-clamp-2">{item.name}</Link>
                {item.variant_label && <p className="text-xs text-muted-foreground mt-0.5">{item.variant_label}</p>}
                <p className="font-mono-price text-sm font-semibold mt-1">{formatCurrency(item.price, settings)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="p-1.5 hover:bg-white rounded transition"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="p-1.5 hover:bg-white rounded transition"><Plus className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono-price font-semibold">{formatCurrency(item.price * item.quantity, settings)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-brand hover:underline mt-2">← Continue Shopping</Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="bg-white border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            {/* Coupon */}
            <div>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">{appliedCoupon.code}</span>
                  </div>
                  <button onClick={() => { removeCoupon(); setCouponCode(''); }} className="p-1 hover:bg-green-100 rounded"><X className="w-3 h-3 text-green-600" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand uppercase" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition disabled:opacity-50">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-price font-medium">{formatCurrency(subtotal, settings)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="font-mono-price font-medium text-green-600">−{formatCurrency(discount, settings)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-mono-price font-medium">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee, settings)}</span></div>
              {tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono-price font-medium">{formatCurrency(tax, settings)}</span></div>}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-mono-price text-xl font-bold">{formatCurrency(total, settings)}</span>
            </div>

            <button onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
              <span>💳 Cash on Delivery available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}