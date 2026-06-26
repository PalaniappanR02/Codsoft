# ShopEasy — White-Label Ecommerce Store

A complete, production-ready white-label ecommerce store with an admin panel. React + Tailwind CSS. Cash on Delivery payments.

## Features

### Storefront
- **Homepage** — Hero banner, featured categories, featured products, new arrivals, trust badges, newsletter signup
- **Product Listing** — Filter by category, price range, in-stock; sort by price/newest/featured; pagination; skeleton loaders
- **Product Detail** — Image gallery with thumbnails, variant selector, quantity stepper, add to cart / buy now, wishlist, stock indicators, tabbed details (description, specifications, reviews), review submission form, related products
- **Cart** — Quantity steppers, coupon code application, order summary with discount/shipping/tax calculation, mini-cart drawer
- **Checkout** — Guest checkout with shipping address form, Cash on Delivery payment, order confirmation page with order number and estimated delivery
- **Search** — Live search dropdown in navbar, dedicated search page with results grid
- **Account** — Profile management, order lookup by email, wishlist management

### Admin Panel
- **Dashboard** — Revenue chart (7-day), KPI cards (revenue, orders today, products, pending), recent orders table, low-stock alerts
- **Products** — Full CRUD with image upload, category assignment, variants, tags, SEO fields, featured/active toggles
- **Categories** — CRUD with image upload, sort order, active toggle
- **Orders** — Filterable order table, detail modal with customer info, items, totals, status update, tracking number
- **Inventory** — Bulk stock update, low-stock highlighting, sorted by stock level
- **Coupons** — Percentage/flat/free-shipping coupons, usage limits, date ranges, active toggle, usage stats
- **Reviews** — Pending/approved/rejected tabs, approve/reject/delete
- **Settings** — Full white-label configuration: store name, logo, favicon, brand colors (live preview), hero section, currency, contact info, social links, shipping rates, tax rate

### White-Label System
All branding is data-driven from the `StoreSettings` entity:
- Store name, logo, favicon applied to `document.title`, `<meta>`, favicon link
- Brand colors applied as CSS variables at runtime (`--brand-primary`, `--brand-secondary`, `--brand-accent`)
- Currency symbol and position from settings
- Hero section content from settings
- Footer social links, contact info from settings
- Navbar links from active categories

## Admin Access

Visit `/admin` to access the admin panel. From there you can:
1. Configure your store branding at **Settings**
2. Manage products, categories, and inventory
3. Process orders and update shipping status
4. Create and manage discount coupons
5. Moderate customer reviews

## White-Label / Resale Instructions

To white-label this store for a new client:

1. **Store Settings** — Go to `/admin/settings` and configure:
   - Store name, company name, tagline
   - Logo and favicon
   - Brand colors (primary, secondary, accent — live preview)
   - Hero section (title, subtitle, image, CTA text)
   - Currency (code, symbol, position)
   - Contact info (email, phone, address)
   - Social media links
   - Shipping rates and tax rate

2. **Product Catalog** — Add your own products via `/admin/products`.

No code changes needed for branding — all driven by settings.

## Project Structure

```
├── components/          # Shared UI components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProductCard.jsx
│   ├── CartDrawer.jsx
│   ├── StorefrontLayout.jsx
│   ├── AdminLayout.jsx
│   └── admin/
│       └── AdminModal.jsx
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── OrderConfirmation.jsx
│   ├── Search.jsx
│   ├── Account.jsx
│   ├── NotFound.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── ProductsAdmin.jsx
│       ├── CategoriesAdmin.jsx
│       ├── OrdersAdmin.jsx
│       ├── CouponsAdmin.jsx
│       ├── ReviewsAdmin.jsx
│       ├── InventoryAdmin.jsx
│       └── SettingsAdmin.jsx
├── libs/                # Utilities and context providers
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   ├── WishlistContext.jsx
│   ├── SettingsContext.jsx
│   └── format.js
├── entities/            # Data models
└── App.jsx              # Router + providers
```
