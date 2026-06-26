import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function Products() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const cat = searchParams.get('cat') || '';
  const minPrice = parseFloat(searchParams.get('min')) || 0;
  const maxPrice = parseFloat(searchParams.get('max')) || 0;
  const sort = searchParams.get('sort') || 'newest';
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const inStockOnly = searchParams.get('instock') === 'true';
  const pageSize = 12;

  useEffect(() => {
    Promise.all([
      base44.entities.Product.filter({ active: true }, '-created_date', 500).catch(() => []),
      base44.entities.Category.filter({ active: true }, 'sort_order', 50).catch(() => []),
    ]).then(([prods, cats]) => {
      setAllProducts(prods || []);
      setCategories(cats || []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (cat) {
      const category = categories.find(c => c.slug === cat);
      if (category) result = result.filter(p => p.category_id === category.id);
    }
    if (q) {
      const ql = q.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(ql) ||
        (p.short_description || '').toLowerCase().includes(ql) ||
        (p.sku || '').toLowerCase().includes(ql)
      );
    }
    if (minPrice > 0) result = result.filter(p => p.price >= minPrice);
    if (maxPrice > 0) result = result.filter(p => p.price <= maxPrice);
    if (inStockOnly) result = result.filter(p => !p.track_inventory || p.stock_qty > 0);

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'featured': result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return result;
  }, [allProducts, categories, cat, q, minPrice, maxPrice, inStockOnly, sort]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const activeCategory = categories.find(c => c.slug === cat);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      {/* Header */}
      <div className="mb-6">
        <nav className="text-sm text-muted-foreground mb-2">
          <Link to="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">{activeCategory ? activeCategory.name : 'All Products'}</span>
        </nav>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {q ? `Search: "${q}"` : activeCategory ? activeCategory.name : 'All Products'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-0 lg:top-20 left-0 z-40 h-full lg:h-auto w-72 bg-white lg:bg-transparent p-5 lg:p-0 overflow-y-auto transition-transform duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Categories</h3>
            <div className="space-y-1">
              <button onClick={() => updateParam('cat', '')}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!cat ? 'bg-brand text-white' : 'hover:bg-muted text-muted-foreground'}`}>
                All Categories
              </button>
              {categories.map(c => (
                <button key={c.id} onClick={() => updateParam('cat', c.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${cat === c.slug ? 'bg-brand text-white' : 'hover:bg-muted text-muted-foreground'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Price Range</h3>
            <div className="flex gap-2 items-center">
              <input type="number" placeholder="Min" defaultValue={minPrice || ''}
                onBlur={(e) => updateParam('min', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
              <span className="text-muted-foreground">—</span>
              <input type="number" placeholder="Max" defaultValue={maxPrice || ''}
                onBlur={(e) => updateParam('max', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
            </div>
          </div>

          {/* In stock */}
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => updateParam('instock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 rounded accent-brand" />
              <span className="text-sm">In stock only</span>
            </label>
          </div>

          <button onClick={() => setSearchParams({})}
            className="w-full py-2 text-sm border border-border rounded-lg hover:bg-muted transition">
            Clear All Filters
          </button>
        </aside>

        {showFilters && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setShowFilters(false)} />}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="hidden lg:block" />
            <select value={sort} onChange={(e) => updateParam('sort', e.target.value)}
              className="px-4 py-2 text-sm border border-border rounded-lg bg-white outline-none focus:border-brand cursor-pointer">
              <option value="newest">Newest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <button onClick={() => setSearchParams({})}
                className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paged.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => updateParam('page', String(currentPage - 1))} disabled={currentPage <= 1}
                className="p-2 border border-border rounded-lg hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => (
                <button key={i} onClick={() => updateParam('page', String(i + 1))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${currentPage === i + 1 ? 'bg-brand text-white' : 'border border-border hover:bg-muted'}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => updateParam('page', String(currentPage + 1))} disabled={currentPage >= totalPages}
                className="p-2 border border-border rounded-lg hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}