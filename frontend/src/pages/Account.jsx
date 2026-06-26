import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { User, Package, Heart, Mail, Phone, MapPin, Trash2, Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { useWishlist } from '@/lib/WishlistContext';
import { formatCurrency, formatDate, statusColors } from '@/lib/format';
import toast from 'react-hot-toast';

export default function Account() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings } = useSettings();
  const { items: wishlistItems, removeWishlist } = useWishlist();
  const tab = searchParams.get('tab') || 'profile';

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('shopeasy_profile') || '{}'); } catch { return {}; }
  });
  const [email, setEmail] = useState(profile.email || '');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('shopeasy_profile', JSON.stringify(profile));
    toast.success('Profile saved');
  };

  const handleSearchOrders = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoadingOrders(true);
    setSearched(true);
    try {
      const results = await base44.entities.Order.filter({ customer_email: email.trim() }, '-created_date', 50);
      setOrders(results || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSearchParams({ tab: t.id })}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${tab === t.id ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.id === 'wishlist' && wishlistItems.length > 0 && <span className="px-1.5 py-0.5 text-[10px] bg-brand text-white rounded-full">{wishlistItems.length}</span>}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="max-w-lg">
          <div className="bg-white border border-border rounded-xl p-5">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Full Name</label>
                <input type="text" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your@email.com" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input type="tel" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Your phone number" className="w-full px-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              </div>
              <button type="submit" className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders tab */}
      {tab === 'orders' && (
        <div className="max-w-3xl">
          <div className="bg-white border border-border rounded-xl p-5 mb-4">
            <h2 className="text-lg font-semibold mb-3">Track Your Orders</h2>
            <p className="text-sm text-muted-foreground mb-3">Enter your email to view your order history</p>
            <form onSubmit={handleSearchOrders} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              </div>
              <button type="submit" disabled={loadingOrders}
                className="px-5 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
                {loadingOrders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search
              </button>
            </form>
          </div>

          {searched && !loadingOrders && (
            orders.length === 0 ? (
              <div className="bg-white border border-border rounded-xl p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground">No orders found for this email.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-mono-price text-sm font-bold">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.created_date)}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors(order.status)}`}>{order.status}</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{item.quantity}×</span>
                          <span className="flex-1 truncate">{item.product_name}</span>
                          <span className="font-mono-price font-medium">{formatCurrency(item.total_price, settings)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-mono-price font-bold">{formatCurrency(order.total, settings)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {tab === 'wishlist' && (
        <div>
          {wishlistItems.length === 0 ? (
            <div className="bg-white border border-border rounded-xl p-8 text-center">
              <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Your wishlist is empty</p>
              <Link to="/products" className="text-brand hover:underline">Browse products →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistItems.map(item => (
                <div key={item.product_id} className="bg-white rounded-lg border border-border overflow-hidden card-hover-lift">
                  <Link to={`/product/${item.slug}`}>
                    <div className="aspect-square bg-muted overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">📦</div>}
                    </div>
                  </Link>
                  <div className="p-3">
                    <Link to={`/product/${item.slug}`} className="text-sm font-medium line-clamp-2 hover:text-brand transition">{item.name}</Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-mono-price text-sm font-semibold">{formatCurrency(item.price, settings)}</span>
                      <button onClick={() => { removeWishlist(item.product_id); toast.success('Removed from wishlist'); }}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}