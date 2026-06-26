import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Store pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Search from './pages/Search';
import Account from './pages/Account';
import NotFound from './pages/NotFound';
// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import InventoryAdmin from './pages/admin/InventoryAdmin';
import CouponsAdmin from './pages/admin/CouponsAdmin';
import ReviewsAdmin from './pages/admin/ReviewsAdmin';
import SettingsAdmin from './pages/admin/SettingsAdmin';
// Layouts & Providers
import StorefrontLayout from './components/StorefrontLayout';
import AdminLayout from './components/AdminLayout';
import { SettingsProvider } from './lib/SettingsContext';
import { CartProvider } from './lib/CartContext';
import { WishlistProvider } from './lib/WishlistContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <SettingsProvider>
      <CartProvider>
        <WishlistProvider>
          <Routes>
            {/* Storefront */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/search" element={<Search />} />
              <Route path="/account" element={<Account />} />
            </Route>
            {/* Admin */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/products" element={<ProductsAdmin />} />
              <Route path="/admin/categories" element={<CategoriesAdmin />} />
              <Route path="/admin/orders" element={<OrdersAdmin />} />
              <Route path="/admin/inventory" element={<InventoryAdmin />} />
              <Route path="/admin/coupons" element={<CouponsAdmin />} />
              <Route path="/admin/reviews" element={<ReviewsAdmin />} />
              <Route path="/admin/settings" element={<SettingsAdmin />} />
            </Route>
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </SettingsProvider>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App