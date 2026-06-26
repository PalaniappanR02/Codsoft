import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Minus, Plus, Truck, ShieldCheck, RotateCcw, Check } from 'lucide-react';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { useCart } from '@/lib/CartContext';
import { useWishlist } from '@/lib/WishlistContext';
import { formatCurrency } from '@/lib/format';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    setActiveTab('details');
    base44.entities.Product.filter({ slug, active: true }, '-created_date', 1)
      .then(async (prods) => {
        if (prods && prods.length > 0) {
          const p = prods[0];
          setProduct(p);
          setSelectedVariant(p.variants?.[0] || null);
          const [rel, revs] = await Promise.all([
            base44.entities.Product.filter({ active: true, category_id: p.category_id }, '-created_date', 5).catch(() => []),
            base44.entities.Review.filter({ product_id: p.id, status: 'approved' }, '-created_date', 50).catch(() => []),
          ]);
          setRelated((rel || []).filter(r => r.id !== p.id).slice(0, 4));
          setReviews(revs || []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 skeleton w-3/4 rounded" />
            <div className="h-6 skeleton w-1/3 rounded" />
            <div className="h-20 skeleton rounded" />
            <div className="h-12 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link to="/products" className="text-brand hover:underline">Browse all products →</Link>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock ?? product.stock_qty;
  const outOfStock = product.track_inventory && currentStock <= 0;
  const lowStock = product.track_inventory && currentStock > 0 && currentStock <= (product.low_stock_threshold || 5);
  const hasDiscount = product.compare_price && product.compare_price > currentPrice;
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleAddToCart = () => {
    if (outOfStock) { toast.error('Out of stock'); return; }
    addToCart(product, quantity, selectedVariant);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (outOfStock) { toast.error('Out of stock'); return; }
    addToCart(product, quantity, selectedVariant);
    navigate('/checkout');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await base44.entities.Review.create({
        product_id: product.id,
        product_name: product.name,
        customer_name: reviewForm.name,
        customer_email: reviewForm.email,
        rating: reviewForm.rating,
        title: reviewForm.title,
        body: reviewForm.body,
        status: 'pending',
      });
      toast.success('Review submitted for approval');
      setReviewForm({ name: '', email: '', rating: 5, title: '', body: '' });
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const images = product.images || [];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-page-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> / 
        <Link to="/products" className="hover:text-foreground"> Products</Link> / 
        <span className="text-foreground"> {product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-3 group">
            {images[activeImage] ? (
              <img src={images[activeImage]} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${activeImage === i ? 'border-brand' : 'border-border'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.featured && <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-black/80 rounded">FEATURED</span>}
            {product.category_name && <span className="px-2 py-0.5 text-[10px] font-medium text-brand bg-brand/10 rounded">{product.category_name}</span>}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={avgRating} size="sm" />
            <span className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-mono-price text-3xl font-bold">{formatCurrency(currentPrice, settings)}</span>
            {hasDiscount && (
              <span className="font-mono-price text-lg text-muted-foreground line-through">{formatCurrency(product.compare_price, settings)}</span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 text-xs font-bold text-white bg-brand rounded">
                Save {Math.round((1 - currentPrice / product.compare_price) * 100)}%
              </span>
            )}
          </div>

          {product.short_description && <p className="text-muted-foreground mb-4 leading-relaxed">{product.short_description}</p>}

          {/* Stock indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium mb-4 ${outOfStock ? 'bg-red-50 text-red-600' : lowStock ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
            {outOfStock ? <span>● Out of Stock</span> : lowStock ? <span>● Low Stock: {currentStock} left</span> : <span className="flex items-center gap-1"><Check className="w-4 h-4" /> In Stock</span>}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">{selectedVariant ? 'Select Option' : 'Select an option'}</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => {
                  const vStock = v.stock ?? 999;
                  const vOOS = vStock <= 0;
                  return (
                    <button key={v.id} onClick={() => setSelectedVariant(v)} disabled={vOOS}
                      className={`px-4 py-2 text-sm rounded-lg border-2 transition ${selectedVariant?.id === v.id ? 'border-brand bg-brand/5' : 'border-border'} ${vOOS ? 'opacity-40 cursor-not-allowed line-through' : 'hover:border-brand'}`}>
                      {v.label}
                      {v.price && v.price !== product.price && <span className="ml-1 text-muted-foreground">+{formatCurrency(v.price - product.price, settings)}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1 w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded transition">
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-mono-price font-semibold w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(currentStock || 99, quantity + 1))} className="p-2 hover:bg-white rounded transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-4">
            <button onClick={handleAddToCart} disabled={outOfStock}
              className="flex-1 py-3.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={outOfStock}
              className="flex-1 py-3.5 border-2 border-brand text-brand rounded-lg font-medium hover:bg-brand/5 transition disabled:opacity-40 disabled:cursor-not-allowed">
              Buy Now
            </button>
            <button onClick={handleWishlist}
              className="p-3.5 border border-border rounded-lg hover:bg-muted transition">
              <Heart className={`w-5 h-5 ${wished ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <Truck className="w-5 h-5 mx-auto text-brand mb-1" />
              <p className="text-xs text-muted-foreground">Free Shipping</p>
            </div>
            <div className="text-center">
              <RotateCcw className="w-5 h-5 mx-auto text-brand mb-1" />
              <p className="text-xs text-muted-foreground">Easy Returns</p>
            </div>
            <div className="text-center">
              <ShieldCheck className="w-5 h-5 mx-auto text-brand mb-1" />
              <p className="text-xs text-muted-foreground">Secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-border mb-6">
          {['details', 'specifications', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition border-b-2 ${activeTab === tab ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {tab}{tab === 'reviews' && ` (${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="prose prose-sm max-w-3xl">
            {product.description
              ? product.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed mb-4">{para}</p>
                ))
              : <p className="text-muted-foreground">No detailed description available.</p>}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="max-w-2xl">
            {product.attributes && Object.keys(product.attributes).length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                {Object.entries(product.attributes).map(([key, value], i) => (
                  <div key={key} className={`flex justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            ) : product.sku ? (
              <div className="space-y-2">
                <div className="flex justify-between py-2"><span className="text-sm text-muted-foreground">SKU</span><span className="text-sm font-medium font-mono-price">{product.sku}</span></div>
              </div>
            ) : <p className="text-muted-foreground">No specifications available.</p>}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Review list */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{r.customer_name}</span>
                        <StarRating rating={r.rating} size="xs" />
                      </div>
                      {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                      <p className="text-sm text-muted-foreground">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review form */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="Your name" value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    className="px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
                  <input type="email" required placeholder="Your email" value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Your rating</p>
                  <StarRating rating={reviewForm.rating} interactive size="md" onRate={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <input type="text" placeholder="Review title" value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand" />
                <textarea required placeholder="Write your review here..." rows="4" value={reviewForm.body}
                  onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-brand resize-none" />
                <button type="submit" disabled={submittingReview}
                  className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}