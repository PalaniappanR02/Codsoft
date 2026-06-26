import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Ticket, Star, Boxes, Settings, Menu, X, Store } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { path: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { settings } = useSettings();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.store_name} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {settings.store_name}
              </span>
            )}
          </Link>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Store className="w-3 h-3" /> Admin Panel
          </p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-brand text-white shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold">
              {navItems.find(n => n.end ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'Admin'}
            </h1>
          </div>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition hidden sm:block">
            View Store →
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 2500, style: { borderRadius: '8px', fontSize: '14px' } }} />
    </div>
  );
}