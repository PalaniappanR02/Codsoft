import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency, formatDate, statusColors } from '@/lib/format';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const { settings } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      base44.entities.Order.get(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link to="/products" className="text-brand hover:underline">Browse products →</Link>
      </div>
    );
  }

  const estimatedDelivery = new Date(order.created_date);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-12 animate-page-in">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your purchase. Your order has been placed successfully.</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <Package className="w-4 h-4 text-brand" />
          <span className="text-sm font-medium">Order Number:</span>
          <span className="font-mono-price text-sm font-bold">{order.order_number}</span>
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0">
                  {item.image_url && <img src={item.image_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.product_name}</p>
                  {item.variant_label && <p className="text-xs text-muted-foreground">{item.variant_label}</p>}
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono-price text-sm font-medium">{formatCurrency(item.total_price, settings)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono-price">{formatCurrency(order.subtotal, settings)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-sm"><span className="text-green-600">Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span><span className="font-mono-price text-green-600">−{formatCurrency(order.discount, settings)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span className="font-mono-price">{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee, settings)}</span></div>
          {order.tax > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono-price">{formatCurrency(order.tax, settings)}</span></div>}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="font-mono-price text-lg font-bold">{formatCurrency(order.total, settings)}</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Payment:</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Shipping & delivery */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-brand" />
            <h3 className="font-semibold text-sm">Shipping Address</h3>
          </div>
          <div className="text-sm text-muted-foreground space-y-0.5">
            <p className="font-medium text-foreground">{order.customer_name}</p>
            <p>{order.shipping_address?.line1}</p>
            {order.shipping_address?.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}</p>
            <p>{order.shipping_address?.country}</p>
            <p className="pt-1">{order.customer_phone}</p>
          </div>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-brand" />
            <h3 className="font-semibold text-sm">Estimated Delivery</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Order placed on {formatDate(order.created_date)}</p>
          <p className="text-lg font-semibold text-brand">{formatDate(estimatedDelivery.toISOString())}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors(order.status)}`}>{order.status}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/products" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/account?tab=orders" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition">
          Track My Order
        </Link>
      </div>
    </div>
  );
}