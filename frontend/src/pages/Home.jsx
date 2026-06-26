import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Headphones, CreditCard, Mail } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import toast from 'react-hot-toast';

export default function Home() {
  const { settings } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.filter({ active: true, featured: true }, '-created_date', 8).catch(() => []),
      base44.entities.Product.filter({ active: true }, '-created_date', 8).catch(() => []),
      base44.entities.Category.filter({ active: true }, 'sort_order', 6).catch(() => []),
    ]).then(([featured, latest, cats]) => {
      setFeaturedProducts(featured || []);
      setNewArrivals(latest || []);
      setCategories(cats || []);
    }).finally(() => setLoading(false));
  }, []);

  const trustBadges = [
    { icon: Truck, title: 'Free Shipping', desc: `On orders over ${settings.currency_symbol}${settings.free_shipping_threshold || 100}` },
    { icon: CreditCard, title: 'Cash on Delivery', desc: 'Pay when you receive' },
    { icon: ShieldCheck, title: 'Quality Guaranteed', desc: 'Premium products only' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
  ];

  const heroImage = settings.hero_image || 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1200&q=80';

  const handleNewsletter = (e) => {
    e.preventDefault();
    toast.success('Thanks for subscribing!');
    e.target.reset();
  };

  return (
    <div className="animate-page-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/5" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-brand/10 text-brand rounded-full mb-4">
                {settings.tagline}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {settings.hero_title}
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
                {settings.hero_subtitle}
              </p>
              <div className="flex gap-3">
                <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition shadow-md">
                  {settings.hero_cta_text || 'Shop Now'} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/products?sort=newest" className="inline-flex items-center px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition">
                  New Arrivals
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src={heroImage} alt={settings.store_name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Trusted Store</p>
                    <p className="text-xs text-muted-foreground">Premium quality</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-border bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                  <badge.icon className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{badge.title}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Shop by Category</h2>
            <Link to="/products" className="text-sm text-brand hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?cat=${cat.slug}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-muted card-hover-lift">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand/10 to-brand/5" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
                  {cat.description && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{cat.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">Featured Products</h2>
          <Link to="/products" className="text-sm text-brand hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">New Arrivals</h2>
          <Link to="/products?sort=newest" className="text-sm text-brand hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white border-t border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-6">Subscribe to get updates on new products, special offers, and more.</p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" required placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg border border-border bg-background outline-none focus:border-brand transition" />
              <button type="submit" className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition whitespace-nowrap">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}