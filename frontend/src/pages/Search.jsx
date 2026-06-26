import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, PackageSearch } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(q);
    if (q) {
      setLoading(true);
      base44.entities.Product.filter({ active: true }, '-created_date', 500)
        .then(prods => {
          const ql = q.toLowerCase();
          setResults((prods || []).filter(p =>
            p.name.toLowerCase().includes(ql) ||
            (p.short_description || '').toLowerCase().includes(ql) ||
            (p.description || '').toLowerCase().includes(ql) ||
            (p.sku || '').toLowerCase().includes(ql) ||
            (p.tags || []).some(t => t.toLowerCase().includes(ql))
          ));
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [q]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-6">Search Products</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for products..."
            className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-border rounded-lg outline-none focus:border-brand transition" />
        </div>
      </form>

      {q && (
        <p className="text-sm text-muted-foreground mb-4">
          {loading ? 'Searching...' : `${results.length} result${results.length !== 1 ? 's' : ''} for "${q}"`}
        </p>
      )}

      {!q && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchIcon className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Start typing to search for products</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : results.length === 0 && q ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground">Try different keywords or browse all products</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}