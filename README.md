# E-Market — Full Stack Ecommerce Platform

A complete white-label ecommerce store with admin panel, built with React + Node.js.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router  
**Backend:** Node.js, Express, LowDB (JSON file database)  
**Auth:** JWT + bcrypt  

## Project Structure
E-Market/

├── backend/    → Node.js REST API (port 4000)

└── frontend/   → React storefront + admin (port 5173)
## Getting Started

### 1. Backend
```bash
cd backend
npm install
node create-admin.js
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

**Admin panel:** http://localhost:5173/admin  
**Login:** admin@shopeasy.com / Admin@123

## Features

- 🛍️ Storefront with product listing, search, cart, checkout
- 🔐 Auth — register, login, OTP verify, forgot password
- 📦 Admin panel — products, categories, orders, inventory, coupons, reviews
- 🎨 White-label — change store name, logo, colors from admin settings
- 📁 Image upload support