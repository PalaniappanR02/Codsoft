import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Youtube, Linkedin, MapPin, Mail, Phone } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  const year = new Date().getFullYear();

  const socials = [
    { url: settings.instagram_url, icon: Instagram, label: 'Instagram' },
    { url: settings.facebook_url, icon: Facebook, label: 'Facebook' },
    { url: settings.twitter_url, icon: Twitter, label: 'Twitter' },
    { url: settings.youtube_url, icon: Youtube, label: 'YouTube' },
    { url: settings.linkedin_url, icon: Linkedin, label: 'LinkedIn' },
  ].filter(s => s.url);

  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              {settings.store_name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{settings.tagline}</p>
            {socials.length > 0 && (
              <div className="flex gap-2">
                {socials.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted hover:bg-brand hover:text-white transition" aria-label={s.label}>
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-muted-foreground hover:text-foreground transition">All Products</Link></li>
              <li><Link to="/products?sort=newest" className="text-muted-foreground hover:text-foreground transition">New Arrivals</Link></li>
              <li><Link to="/search" className="text-muted-foreground hover:text-foreground transition">Search</Link></li>
              <li><Link to="/cart" className="text-muted-foreground hover:text-foreground transition">Cart</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account" className="text-muted-foreground hover:text-foreground transition">My Account</Link></li>
              <li><Link to="/account?tab=orders" className="text-muted-foreground hover:text-foreground transition">My Orders</Link></li>
              <li><Link to="/account?tab=wishlist" className="text-muted-foreground hover:text-foreground transition">Wishlist</Link></li>
              <li><Link to="/account?tab=addresses" className="text-muted-foreground hover:text-foreground transition">Addresses</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">Contact</h4>
            <ul className="space-y-2 text-sm">
              {settings.support_email && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <a href={`mailto:${settings.support_email}`} className="hover:text-foreground transition">{settings.support_email}</a>
                </li>
              )}
              {settings.support_phone && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  <a href={`tel:${settings.support_phone}`} className="hover:text-foreground transition">{settings.support_phone}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} {settings.company_name || settings.store_name}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Cash on Delivery available</span>
            <span>•</span>
            <span>{settings.currency_code || 'INR'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}