import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { debounce } from '@/lib/format';
import { base44 } from '@/api/apiClient';

export default function Navbar() {
  const { settings } = useSettings();
  const { cartCount, openCart, bounceTrigger } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    base44.entities.Category.filter({ active: true }, 'sort_order', 10)
      .then(setCategories)
      .catch(() => {});
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(async (q) => {
      if (q.length < 2) { setSearchResults([]); return; }
      try {
        const results = await base44.entities.Product.filter({ active: true }, '-created_date', 50);
        const filtered = results.filter(p =>
          p.name.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 6);
        setSearchResults(filtered);
      } catch { setSearchResults([]); }
    }, 300),
    []
  );

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-[1100] bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.store_name} className="h-8 lg:h-10 w-auto" />
              ) : (
                <span className="text-xl lg:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  {settings.store_name}
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Home</Link>
              <Link to="/products" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Shop All</Link>
              {categories.slice(0, 4).map(cat => (
                <Link key={cat.id} to={`/products?cat=${cat.slug}`} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Search (desktop) */}
            <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); debouncedSearch(e.target.value); setShowSearch(true); }}
                    onFocus={() => setShowSearch(true)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/50 rounded-lg border border-transparent focus:border-brand focus:bg-white transition outline-none"
                  />
                </div>
              </form>
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-border overflow-hidden z-50">
                  {searchResults.map(p => (
                    <Link key={p.id} to={`/product/${p.slug}`} onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition border-b border-border last:border-0">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">${p.price}</p>
                      </div>
                    </Link>
                  ))}
                  <button onClick={handleSearch} className="w-full p-2 text-sm text-brand hover:bg-muted font-medium">
                    View all results →
                  </button>
                </div>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <Link to="/search" className="md:hidden p-2.5 hover:bg-muted rounded-lg transition">
                <Search className="w-5 h-5" />
              </Link>
              <Link to="/account?tab=wishlist" className="relative p-2.5 hover:bg-muted rounded-lg transition">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-brand rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button onClick={openCart} className="relative p-2.5 hover:bg-muted rounded-lg transition">
                <ShoppingCart key={bounceTrigger} className={`w-5 h-5 ${bounceTrigger > 0 ? 'animate-cart-bounce' : ''}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold text-white bg-brand rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2.5 hover:bg-muted rounded-lg transition">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[1300] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto animate-drawer-in">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 text-sm bg-muted/50 rounded-lg outline-none" />
              </div>
            </form>
            <nav className="space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-muted font-medium">Home</Link>
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-muted font-medium">Shop All</Link>
              {categories.map(cat => (
                <Link key={cat.id} to={`/products?cat=${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground">
                  {cat.name}
                </Link>
              ))}
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-lg hover:bg-muted font-medium">My Account</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}