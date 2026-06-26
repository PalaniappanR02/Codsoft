import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/apiClient';
import { hexToHsl } from './format';

const SettingsContext = createContext(null);

export const DEFAULT_SETTINGS = {
  store_name: 'ShopEasy',
  company_name: 'ShopEasy Inc.',
  tagline: 'Quality products, delivered to you',
  logo_url: '',
  favicon_url: '',
  primary_color: '#4F46E5',
  secondary_color: '#7C3AED',
  accent_color: '#EC4899',
  currency_code: 'INR',
  currency_symbol: '₹',
  currency_position: 'before',
  support_email: 'support@shopeasy.com',
  support_phone: '',
  address: '',
  meta_description: 'Premium online store for quality products',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  linkedin_url: '',
  hero_title: 'Discover Premium Products',
  hero_subtitle: 'Curated quality, delivered with care. Shop our exclusive collection today.',
  hero_image: '',
  hero_cta_text: 'Shop Now',
  free_shipping_threshold: 100,
  flat_shipping_fee: 10,
  tax_rate: 0,
  maintenance_mode: 'live',
  configured: true,
};

function applySettingsToDOM(settings) {
  // Document title
  if (settings.store_name) {
    document.title = settings.store_name;
  }

  // Meta description
  const metaDesc = document.querySelector('#meta-description');
  if (metaDesc && settings.meta_description) {
    metaDesc.setAttribute('content', settings.meta_description);
  }

  // Favicon
  if (settings.favicon_url) {
    const favicon = document.querySelector('#favicon');
    if (favicon) {
      favicon.href = settings.favicon_url;
    }
  }

  // Brand colors → CSS variables
  const root = document.documentElement;
  if (settings.primary_color) {
    root.style.setProperty('--brand-primary', settings.primary_color);
    const hsl = hexToHsl(settings.primary_color);
    if (hsl) root.style.setProperty('--primary', hsl);
    if (hsl) root.style.setProperty('--ring', hsl);
  }
  if (settings.secondary_color) {
    root.style.setProperty('--brand-secondary', settings.secondary_color);
  }
  if (settings.accent_color) {
    root.style.setProperty('--brand-accent', settings.accent_color);
  }

  // Open Graph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', settings.store_name || 'ShopEasy');

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', settings.meta_description || '');
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const rows = await base44.entities.StoreSettings.list();
      if (rows && rows.length > 0) {
        const s = { ...DEFAULT_SETTINGS, ...rows[0] };
        setSettings(s);
        setConfigured(s.configured !== false && s.maintenance_mode !== 'not_configured');
        applySettingsToDOM(s);
        window.__STORE = s;
      } else {
        setConfigured(false);
        window.__STORE = { ...DEFAULT_SETTINGS, configured: false, maintenance_mode: 'not_configured' };
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const refresh = useCallback(() => {
    return fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ settings, loading, configured, refresh }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return { settings: DEFAULT_SETTINGS, loading: false, configured: true, refresh: () => {} };
  }
  return ctx;
}