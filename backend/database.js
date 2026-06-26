// database.js — uses lowdb (pure JSON file, no C++ compilation needed)
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const adapter = new FileSync(path.join(__dirname, 'emarket.json'));
const db = low(adapter);

// ── Default structure ─────────────────────────────────────────
db.defaults({
  users: [],
  store_settings: [],
  categories: [],
  products: [],
  orders: [],
  coupons: [],
  reviews: [],
}).write();

// ── Seed default store settings ───────────────────────────────
if (db.get('store_settings').size().value() === 0) {
  db.get('store_settings').push({
    id: uuidv4(),
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
    created_date: new Date().toISOString(),
  }).write();
  console.log('✅ Default store settings seeded');
}

// ── Seed sample categories & products ────────────────────────
if (db.get('categories').size().value() === 0) {
  const catElectronics = uuidv4();
  const catClothing    = uuidv4();
  const catHome        = uuidv4();

  db.get('categories').push(
    { id: catElectronics, name: 'Electronics',   slug: 'electronics',  description: 'Gadgets and tech', image_url: '', sort_order: 1, active: true,  created_date: new Date().toISOString() },
    { id: catClothing,    name: 'Clothing',       slug: 'clothing',     description: 'Fashion and apparel', image_url: '', sort_order: 2, active: true, created_date: new Date().toISOString() },
    { id: catHome,        name: 'Home & Garden',  slug: 'home-garden',  description: 'For your home', image_url: '', sort_order: 3, active: true, created_date: new Date().toISOString() }
  ).write();

  db.get('products').push(
    {
      id: uuidv4(), name: 'Wireless Headphones', slug: 'wireless-headphones',
      description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
      price: 79.99, compare_price: 129.99, cost_price: 0,
      category_id: catElectronics,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
      tags: ['audio', 'wireless', 'headphones'], variants: [], sku: 'WH-001',
      track_inventory: true, stock_qty: 50, low_stock_threshold: 5,
      featured: true, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Smart Watch', slug: 'smart-watch',
      description: 'Feature-packed smartwatch with health tracking, GPS, and 7-day battery.',
      price: 149.99, compare_price: 199.99, cost_price: 0,
      category_id: catElectronics,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'],
      tags: ['watch', 'smart', 'fitness'], variants: [], sku: 'SW-001',
      track_inventory: true, stock_qty: 30, low_stock_threshold: 5,
      featured: true, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Classic T-Shirt', slug: 'classic-t-shirt',
      description: 'Comfortable 100% cotton everyday t-shirt. Available in multiple sizes.',
      price: 24.99, compare_price: 39.99, cost_price: 0,
      category_id: catClothing,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'],
      tags: ['clothing', 'casual', 'cotton'], variants: [], sku: 'TS-001',
      track_inventory: true, stock_qty: 100, low_stock_threshold: 10,
      featured: true, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Desk Lamp', slug: 'desk-lamp',
      description: 'Modern LED desk lamp with 5 brightness levels and USB charging port.',
      price: 34.99, compare_price: 49.99, cost_price: 0,
      category_id: catHome,
      images: ['https://images.unsplash.com/photo-1573297888837-daef10be4b36?w=600'],
      tags: ['home', 'lighting', 'led'], variants: [], sku: 'DL-001',
      track_inventory: true, stock_qty: 75, low_stock_threshold: 5,
      featured: false, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Running Shoes', slug: 'running-shoes',
      description: 'Lightweight running shoes with cushioned sole for everyday training.',
      price: 89.99, compare_price: 119.99, cost_price: 0,
      category_id: catClothing,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'],
      tags: ['shoes', 'sports', 'running'], variants: [], sku: 'RS-001',
      track_inventory: true, stock_qty: 60, low_stock_threshold: 5,
      featured: true, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    },
    {
      id: uuidv4(), name: 'Coffee Maker', slug: 'coffee-maker',
      description: '12-cup programmable coffee maker with built-in grinder and keep-warm plate.',
      price: 59.99, compare_price: 89.99, cost_price: 0,
      category_id: catHome,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600'],
      tags: ['kitchen', 'coffee', 'home'], variants: [], sku: 'CM-001',
      track_inventory: true, stock_qty: 40, low_stock_threshold: 5,
      featured: false, active: true, weight: 0,
      seo_title: '', seo_description: '', created_date: new Date().toISOString(),
    }
  ).write();

  console.log('✅ Sample categories and products seeded');
}

module.exports = db;
