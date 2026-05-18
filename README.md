# AgTradeGroup E-Commerce Platform

A modern, production-ready, web-based e-commerce platform for a plumbing, heating, construction materials, and tools business. Optimized for mobile ordering by plumbers, installers, and construction workers in Kosovo.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black) ![Express](https://img.shields.io/badge/Express-5-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-purple)

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose v2
- Git

### Installation

```bash
# 1. Clone or navigate to the project
cd agtradegroup

# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your values (at minimum, change JWT secrets)
# Use: openssl rand -hex 64 for JWT_SECRET and JWT_REFRESH_SECRET

# 4. Build and start all services
docker compose up -d --build

# 5. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 6. Seed database with sample data
docker compose exec backend npx prisma db seed

# 7. Open in browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/v1/health
# Admin Panel: http://localhost:3000/admin
```

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agtradegroup.com | Admin123! |
| Staff | staff@agtradegroup.com | Admin123! |
| Customer | customer@gmail.com | Admin123! |

### Common Commands

```bash
# View logs
docker compose logs -f

# View backend logs only
docker compose logs -f backend

# Stop all services
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Run Prisma Studio (database GUI)
docker compose exec backend npx prisma studio

# Stop and delete all data (WARNING: destructive!)
docker compose down -v
```

## 📁 Project Structure

```
agtradegroup/
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Environment template
├── MASTER.md                   # Full architecture document
├── backend/                    # Express.js API
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Sample data
│   └── src/
│       ├── index.ts            # Express entry point
│       ├── config/             # Database, Redis, env
│       ├── middleware/         # Auth, validation, upload
│       ├── modules/            # Feature modules
│       │   ├── auth/           # JWT authentication
│       │   ├── products/       # Product CRUD + search
│       │   ├── categories/     # Category management
│       │   ├── brands/         # Brand management
│       │   ├── orders/         # Order processing
│       │   ├── cart/           # Shopping cart
│       │   └── admin/          # Admin dashboard API
│       └── utils/              # Email, invoice, shipping
├── frontend/                   # Next.js storefront
│   ├── Dockerfile
│   └── src/
│       ├── app/                # Pages (App Router)
│       │   ├── page.tsx        # Homepage
│       │   ├── shop/           # Product listing
│       │   ├── products/[slug]/# Product detail
│       │   ├── cart/           # Shopping cart
│       │   ├── checkout/       # Checkout flow
│       │   ├── account/        # Customer account
│       │   ├── admin/          # Admin dashboard
│       │   ├── about/          # About page
│       │   ├── contact/        # Contact page
│       │   └── delivery/       # Delivery info
│       ├── components/         # React components
│       ├── store/              # Zustand cart store
│       ├── lib/                # API client, auth helpers
│       └── utils/              # Formatters, helpers
```

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Cache | Redis 7 |
| Auth | JWT + Refresh Tokens |
| Containerization | Docker + Docker Compose |

### Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js storefront + admin |
| Backend | 3001 | Express REST API |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching layer |

## 🛒 Features

### Customer Features
- ✅ Browse products with search & filtering
- ✅ Category and brand navigation
- ✅ Product detail pages with specs
- ✅ Shopping cart (persisted in localStorage)
- ✅ Guest checkout + registered user checkout
- ✅ Automatic shipping calculation (Free in Ferizaj, 2€ elsewhere)
- ✅ Cash on Delivery & Bank Transfer payment
- ✅ Order tracking with tracking number
- ✅ Customer account with order history
- ✅ Mobile-first responsive design
- ✅ WhatsApp floating contact button

### Admin Features
- ✅ Dashboard with analytics overview
- ✅ Product management (CRUD)
- ✅ Category management (nested)
- ✅ Order management with status updates
- ✅ Customer management with role assignment
- ✅ Inventory tracking with low stock alerts
- ✅ Promotion management
- ✅ Secure admin authentication

### Technical Features
- ✅ REST API with versioning (`/api/v1/`)
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (Admin, Staff, Customer)
- ✅ Redis caching for products, categories, brands
- ✅ Rate limiting on API endpoints
- ✅ Zod validation on all inputs
- ✅ Transaction-safe checkout with stock reservation
- ✅ PDF invoice generation
- ✅ Email notifications (configurable SMTP)
- ✅ Soft deletes for audit trails
- ✅ SEO-friendly URLs
- ✅ Open Graph metadata support

## 🔌 API Endpoints

### Public
- `GET /api/v1/health` — Health check
- `GET /api/v1/products` — List products (with filters)
- `GET /api/v1/products/featured` — Featured products
- `GET /api/v1/products/slug/:slug` — Product detail
- `GET /api/v1/products/slug/:slug/related` — Related products
- `GET /api/v1/categories` — Category tree
- `GET /api/v1/brands` — All brands
- `GET /api/v1/promotions` — Active promotions
- `GET /api/v1/orders/track/:trackingNumber` — Track order

### Authentication
- `POST /api/v1/auth/register` — Create account
- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/refresh` — Refresh token
- `POST /api/v1/auth/logout` — Logout
- `POST /api/v1/auth/forgot-password` — Request reset
- `POST /api/v1/auth/reset-password` — Reset password
- `GET /api/v1/auth/me` — Get current user

### Customer (Authenticated)
- `GET /api/v1/cart` — Get cart
- `POST /api/v1/cart/items` — Add to cart
- `PUT /api/v1/cart/items/:id` — Update quantity
- `DELETE /api/v1/cart/items/:id` — Remove item
- `POST /api/v1/orders` — Create order
- `GET /api/v1/orders` — User's orders
- `GET /api/v1/orders/:id` — Order detail
- `GET /api/v1/orders/invoice/:id` — Download PDF invoice

### Admin (Admin/Staff Only)
- `GET /api/v1/admin/dashboard` — Analytics
- `GET /api/v1/admin/orders` — All orders
- `PUT /api/v1/orders/:id/status` — Update order status
- `POST /api/v1/products` — Create product
- `PUT /api/v1/products/:id` — Update product
- `DELETE /api/v1/products/:id` — Delete product
- `GET /api/v1/admin/customers` — All customers
- `PUT /api/v1/admin/customers/:id/role` — Update role
- `GET /api/v1/admin/inventory` — Stock overview
- `PUT /api/v1/admin/inventory/:id` — Update stock
- `GET /api/v1/admin/inventory/low-stock` — Low stock alerts
- `POST/PUT/DELETE /api/v1/admin/promotions` — Manage promotions

## 🚢 Shipping Rules

| City | Delivery Fee |
|------|-------------|
| Ferizaj | FREE (0 EUR) |
| All other Kosovo cities | 2.00 EUR |

Automatically calculated during checkout based on selected city.

## 🎨 Design System

### Color Palette
- **Primary (Dark Blue):** `#1E3A5F` — Headers, primary backgrounds
- **Accent (Orange):** `#F97316` — CTAs, badges, highlights
- **Background:** `#F8FAFC` — Page background
- **Success:** `#22C55E` — In stock, success states
- **Warning:** `#F59E0B` — Low stock alerts
- **Danger:** `#EF4444` — Out of stock, errors

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run dev              # Start dev server with hot reload
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Production server
```

### Environment Variables

See `.env.example` for all available variables. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `SMTP_HOST` | SMTP server for emails | (optional) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact number | 38344123456 |
| `FREE_DELIVERY_CITY` | City with free delivery | Ferizaj |
| `STANDARD_DELIVERY_FEE` | Fee for other cities | 2 |

## 📊 Database Schema

Key entities:
- **Users** — Customers, staff, admins (role-based)
- **Products** — With variants, specs (JSONB), images
- **Categories** — Hierarchical (parent/child)
- **Brands** — Product manufacturers
- **Orders** — With items, status tracking
- **Cart Items** — User or session-based
- **Addresses** — Saved customer addresses
- **Inventory Logs** — Stock change history
- **Promotions** — Discount codes and campaigns
- **Reviews** — Product reviews (approval system)

## 🔒 Security

- Password hashing with bcrypt (12 rounds)
- JWT with short-lived access tokens (15 min)
- Refresh token rotation and revocation
- Rate limiting on auth endpoints (10 req/15 min)
- General rate limiting (100 req/15 min)
- Helmet.js security headers
- Zod input validation
- CORS configuration
- Soft deletes for audit trails

## 📈 Future Enhancements

- [ ] Online payment gateway (Stripe, local providers)
- [ ] Multi-language (Albanian/Serbian/English)
- [ ] Product reviews and ratings
- [ ] Bulk order pricing for contractors
- [ ] ERP integration (REST API ready)
- [ ] Push notifications for order updates
- [ ] Advanced analytics dashboard
- [ ] Export orders to CSV/PDF
- [ ] Barcode scanner for warehouse
- [ ] Mobile app (React Native)

## 📄 License

Private — AgTradeGroup. All rights reserved.

## 📞 Support

- 📞 +383 44 123 456
- 📧 info@agtradegroup.com
- 📍 Ferizaj, Kosovo
