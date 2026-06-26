import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 animate-page-in">
      <div className="text-center">
        <h1 className="text-7xl sm:text-8xl font-bold text-brand mb-2" style={{ fontFamily: 'var(--font-heading)' }}>404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <Link to="/products" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition">
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}