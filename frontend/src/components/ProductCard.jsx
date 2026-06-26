import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { formatCurrency } from '@/lib/format';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { settings } = useSettings();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const wished = isWishlisted(product.id);
  const outOfStock = product.track_inventory && product.stock_qty <= 0;
  const lowStock = product.track_inventory && product.stock_qty > 0 && product.stock_qty <= (product.low_stock_threshold || 5);
  const hasDiscount = product.compare_price && product.compare_price > product.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) { toast.error('Out of stock'); return; }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative bg-white rounded-lg border border-border overflow-hidden card-hover-lift">
        <div className="aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <span className="text-5xl">📦</span>
            </div>
          )}
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-brand rounded">
              -{Math.round((1 - product.price / product.compare_price) * 100)}%
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-black/80 rounded">FEATURED</span>
          )}
          {outOfStock && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">SOLD OUT</span>
          )}
        </div>

        <button onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white transition">
          <Heart className={`w-4 h-4 ${wished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-price text-base font-semibold text-foreground">
                {formatCurrency(product.price, settings)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through font-mono-price">
                  {formatCurrency(product.compare_price, settings)}
                </span>
              )}
            </div>
            <button onClick={handleAddToCart} disabled={outOfStock}
              className="p-2 bg-brand text-white rounded-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
          {lowStock && <p className="text-[11px] text-amber-600 mt-1 font-medium">Only {product.stock_qty} left</p>}
        </div>
      </div>
    </Link>
  );
}