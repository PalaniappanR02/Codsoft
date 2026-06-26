# E-Market — White-Label Ecommerce Store

A complete, production-ready white-label ecommerce store with an admin panel. Built with React + Tailwind CSS + Vite.

## Tech Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Charts**: Recharts
- **Icons**: lucide-react
- **Toasts**: react-hot-toast

## Prerequisites

- Node.js 20+
- npm or yarn

## Getting Started

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Project Structure

```
├── src/
│   ├── api/                 # API client setup
│   ├── components/          # Shared UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CartDrawer.jsx
│   │   ├── StorefrontLayout.jsx
│   │   ├── AdminLayout.jsx
│   │   └── ui/              # shadcn/ui components
│   ├── pages/               # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderConfirmation.jsx
│   │   ├── Search.jsx
│   │   ├── Account.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── ProductsAdmin.jsx
│   │       ├── CategoriesAdmin.jsx
│   │       ├── OrdersAdmin.jsx
│   │       ├── CouponsAdmin.jsx
│   │       ├── ReviewsAdmin.jsx
│   │       ├── InventoryAdmin.jsx
│   │       └── SettingsAdmin.jsx
│   ├── libs/                # Utilities and context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   ├── WishlistContext.jsx
│   │   ├── SettingsContext.jsx
│   │   └── format.js
│   ├── hooks/
│   ├── utils/
│   └── entities/            # Data model schemas
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features

### Storefront
- **Homepage** — Hero banner, featured categories, featured products, new arrivals, trust badges, newsletter signup
- **Product Listing** — Filter by category, price range, in-stock; sort; pagination; skeleton loaders
- **Product Detail** — Image gallery, variant selector, add to cart / buy now, wishlist, stock indicators, reviews
- **Cart** — Quantity steppers, coupon code application, order summary with discount/shipping/tax
- **Checkout** — Shipping address form, Cash on Delivery payment, order confirmation
- **Search** — Live search dropdown, dedicated search results page
- **Account** — Profile management, order lookup, wishlist

### Admin Panel (`/admin`)
- **Dashboard** — Revenue chart, KPI cards, recent orders, low-stock alerts
- **Products** — Full CRUD with image upload, variants, tags, SEO fields
- **Categories** — CRUD with image upload and sort order
- **Orders** — Filterable table, status updates, tracking numbers
- **Inventory** — Bulk stock update, low-stock highlighting
- **Coupons** — Percentage/flat/free-shipping coupons, usage limits, date ranges
- **Reviews** — Approve/reject/delete moderation
- **Settings** — Full white-label config: branding, colors, hero, currency, contact, socials, shipping, tax

### White-Label System
All branding is data-driven from Store Settings:
- Store name, logo, favicon
- Brand colors applied as CSS variables at runtime
- Currency symbol and position
- Hero section content
- Footer social links and contact info

## License

White-label product. Customize and resell freely.
