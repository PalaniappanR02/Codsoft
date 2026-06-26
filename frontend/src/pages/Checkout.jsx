import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useCart } from '@/lib/CartContext';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency, generateOrderNumber } from '@/lib/format';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, subtotal, discount, appliedCoupon, clearCart } = useCart();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    line1: '', line2: '', city: '', state: '', pincode: '', country: 'IN',
    notes: '',
  });

  const isFreeShippingCoupon = appliedCoupon?.type === 'free_shipping';
  const shippingFee = isFreeShippingCoupon || subtotal >= (settings.free_shipping_threshold || 100) ? 0 : (settings.flat_shipping_fee || 10);
  const tax = Math.round((subtotal - discount) * ((settings.tax_rate || 0) / 100) * 100) / 100;
  const total = Math.max(0, subtotal - discount + shippingFee + tax);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link to="/products" className="text-brand hover:underline">Browse products →</Link>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) { toast.error('Please enter your name'); return false; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Please enter a valid email'); return false; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) { toast.error('Please enter a valid phone number'); return false; }
    if (!form.line1.trim()) { toast.error('Please enter your address'); return false; }
    if (!form.city.trim()) { toast.error('Please enter your city'); return false; }
    if (!form.state.trim()) { toast.error('Please enter your state'); return false; }
    if (!form.pincode.trim()) { toast.error('Please enter your pincode'); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;
    setPlacing(true);
    try {
      const order = await base44.entities.Order.create({
        order_number: generateOrderNumber(),
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'cod',
        subtotal,
        discount,
        shipping_fee: shippingFee,
        tax,
        total,
        coupon_code: appliedCoupon?.code || null,
        shipping_address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        items: items.map(i => ({
          product_id: i.product_id,
          product_name: i.name,
          variant_id: i.variant_id,
          variant_label: i.variant_label,
          quantity: i.quantity,
          unit_price: i.price,
          total_price: i.price * i.quantity,
          image_url: i.image,
        })),
        notes: form.notes || null,
      });

      // Increment coupon usage
      if (appliedCoupon) {
        base44.entities.Coupon.update(appliedCoupon.id, { used_count: (appliedCoupon.used_count || 0) + 1 }).catch(() => {});
      }

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation?order=${order.id}`);
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Contact info */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Contact Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand sm:col-span-2" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone number" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Shipping Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input name="line1" value={form.line1} onChange={handleChange} placeholder="Address line 1" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand sm:col-span-2" />
              <input name="line2" value={form.line2} onChange={handleChange} placeholder="Address line 2 (optional)"
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand sm:col-span-2" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <input name="state" value={form.state} onChange={handleChange} placeholder="State / Province" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode / ZIP" required
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <select name="country" value={form.country} onChange={handleChange}
                className="px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand bg-white">
                <option value="IN">India</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="AE">UAE</option>
                <option value="SG">Singapore</option>
              </select>
            </div>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Order notes (optional)" rows="2"
              className="w-full mt-3 px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand resize-none" />
          </div>

          {/* Payment */}
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Payment Method
            </h2>
            <div className="border-2 border-brand rounded-lg p-4 flex items-center gap-3 bg-brand/5">
              <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay in cash when your order arrives</p>
              </div>
              <Check className="w-5 h-5 text-brand" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20 bg-white border border-border rounded-xl p-5 space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0 relative">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.variant_label && <p className="text-xs text-muted-foreground truncate">{item.variant_label}</p>}
                  </div>
                  <span className="font-mono-price text-sm font-medium">{formatCurrency(item.price * item.quantity, settings)}</span>
                </div>
              ))}
            </div>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded-lg">
                <span className="text-green-700">Coupon: {appliedCoupon.code}</span>
                <span className="text-green-600 font-mono-price">−{formatCurrency(discount, settings)}</span>
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-price">{formatCurrency(subtotal, settings)}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="font-mono-price text-green-600">−{formatCurrency(discount, settings)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-mono-price">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee, settings)}</span></div>
              {tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono-price">{formatCurrency(tax, settings)}</span></div>}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="font-semibold">Total</span>
              <span className="font-mono-price text-xl font-bold">{formatCurrency(total, settings)}</span>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing}
              className="w-full py-3.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {placing ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</> : 'Place Order'}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</span>
              <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}