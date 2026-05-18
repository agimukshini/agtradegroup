# AgTradeGroup E-Commerce Platform — Master Project File

## Project Overview

A modern, production-ready, web-based e-commerce platform for a plumbing, heating, construction materials, and tools business based in Kosovo. Optimized for mobile ordering by plumbers, installers, and construction workers.

**Target Customers:** Retail buyers + Contractors (B2B and B2C)
**Primary Market:** Kosovo (Ferizaj as primary delivery city)
**Deployment:** Self-hosted Docker containers on private server infrastructure

---

## Architecture Recommendations

### Why Express over NestJS for this project:
- **Simpler learning curve** for future maintenance by local developers
- **Faster initial development** — less boilerplate, more flexible routing
- **Sufficient for e-commerce scale** — NestJS shines in enterprise microservices, but this is a monolith that can scale later
- **Easier Docker image size** — fewer dependencies, smaller footprint

### Recommended Additions to Original Spec:

1. **Redis for caching & sessions** — Product listings, category trees, and cart sessions benefit massively from Redis. Essential for mobile performance.

2. **API versioning** (`/api/v1/...`) — Prepare for future ERP integration by versioning the API from day one.

3. **Rate limiting** — Protect against abuse on auth endpoints and order submission.

4. **File upload middleware** — Multer with local volume storage for product images, with automatic image optimization (sharp library).

5. **Transaction-based checkout** — Use PostgreSQL transactions for stock reservation during checkout to prevent overselling.

6. **Soft deletes** — Products, orders, and customers use `deletedAt` instead of hard deletes for audit trails.

7. **Currency: EUR** — Hardcoded throughout (Kosovo uses Euro).

8. **Phone number as primary identifier** — Contractors often prefer phone-based login. Include phone field in auth.

9. **WhatsApp Business integration** — Floating button + order confirmation via WhatsApp API.

10. **Invoice generation** — PDF invoice generation per order (contractors need invoices for accounting).

### Tech Stack Final Decision:

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + React 19 |
| Styling | Tailwind CSS 4 |
| Backend | Node.js + Express 5 |
| Database | PostgreSQL 16 |
| ORM | Prisma 6 |
| Cache | Redis 7 |
| Auth | JWT + Refresh Tokens + bcrypt |
| File Storage | Local Docker volume + sharp image processing |
| Containerization | Docker + Docker Compose v2 |
| Email | Nodemailer (SMTP configurable) |
| PDF Generation | PDFKit for invoices |
| Validation | Zod (shared between frontend and backend) |

---

## Project Structure

```
agtradegroup/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── docs/
│   └── API.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts                  # Express app entry
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── redis.ts
│   │   │   └── env.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification
│   │   │   ├── rateLimiter.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── upload.ts             # Multer + sharp
│   │   │   └── validate.ts           # Zod validation
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── products/
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.routes.ts
│   │   │   │   └── products.validation.ts
│   │   │   ├── categories/
│   │   │   │   ├── categories.controller.ts
│   │   │   │   ├── categories.service.ts
│   │   │   │   └── categories.routes.ts
│   │   │   ├── brands/
│   │   │   │   ├── brands.controller.ts
│   │   │   │   ├── brands.service.ts
│   │   │   │   └── brands.routes.ts
│   │   │   ├── orders/
│   │   │   │   ├── orders.controller.ts
│   │   │   │   ├── orders.service.ts
│   │   │   │   ├── orders.routes.ts
│   │   │   │   └── orders.validation.ts
│   │   │   ├── customers/
│   │   │   │   ├── customers.controller.ts
│   │   │   │   ├── customers.service.ts
│   │   │   │   └── customers.routes.ts
│   │   │   ├── cart/
│   │   │   │   ├── cart.controller.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   └── cart.routes.ts
│   │   │   ├── inventory/
│   │   │   │   ├── inventory.controller.ts
│   │   │   │   ├── inventory.service.ts
│   │   │   │   └── inventory.routes.ts
│   │   │   ├── promotions/
│   │   │   │   ├── promotions.controller.ts
│   │   │   │   ├── promotions.service.ts
│   │   │   │   └── promotions.routes.ts
│   │   │   ├── addresses/
│   │   │   │   ├── addresses.controller.ts
│   │   │   │   ├── addresses.service.ts
│   │   │   │   └── addresses.routes.ts
│   │   │   └── admin/
│   │   │       ├── admin.controller.ts
│   │   │       ├── admin.service.ts
│   │   │       └── admin.routes.ts
│   │   ├── utils/
│   │   │   ├── email.ts
│   │   │   ├── invoice.ts
│   │   │   ├── shipping.ts
│   │   │   └── helpers.ts
│   │   └── types/
│   │       └── index.ts
│   └── uploads/                      # Product images (Docker volume)
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Homepage
│       │   ├── globals.css
│       │   ├── shop/
│       │   │   └── page.tsx          # Shop/Category listing
│       │   ├── products/
│       │   │   └── [slug]/
│       │   │       └── page.tsx      # Product detail
│       │   ├── cart/
│       │   │   └── page.tsx
│       │   ├── checkout/
│       │   │   └── page.tsx
│       │   ├── account/
│       │   │   ├── page.tsx          # Account dashboard
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── register/
│       │   │   │   └── page.tsx
│       │   │   ├── orders/
│       │   │   │   └── page.tsx
│       │   │   └── tracking/
│       │   │       └── page.tsx
│       │   ├── about/
│       │   │   └── page.tsx
│       │   ├── contact/
│       │   │   └── page.tsx
│       │   ├── delivery/
│       │   │   └── page.tsx
│       │   ├── admin/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx          # Admin dashboard
│       │   │   ├── login/
│       │   │   │   └── page.tsx
│       │   │   ├── products/
│       │   │   │   └── page.tsx
│       │   │   ├── categories/
│       │   │   │   └── page.tsx
│       │   │   ├── orders/
│       │   │   │   └── page.tsx
│       │   │   ├── customers/
│       │   │   │   └── page.tsx
│       │   │   └── settings/
│       │   │       └── page.tsx
│       │   ├── api/                  # Next.js API routes (proxy)
│       │   │   ├── [...proxy]/
│       │   │   │   └── route.ts
│       │   │   └── sitemap/
│       │   │       └── route.ts
│       │   └── robots.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── MobileNav.tsx
│       │   │   └── AdminLayout.tsx
│       │   ├── product/
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ProductGrid.tsx
│       │   │   ├── ProductFilters.tsx
│       │   │   ├── ProductImages.tsx
│       │   │   └── RelatedProducts.tsx
│       │   ├── cart/
│       │   │   ├── CartItem.tsx
│       │   │   ├── CartSummary.tsx
│       │   │   └── StickyCart.tsx
│       │   ├── checkout/
│       │   │   ├── CheckoutForm.tsx
│       │   │   ├── ShippingCalculator.tsx
│       │   │   └── PaymentMethod.tsx
│       │   ├── auth/
│       │   │   ├── LoginForm.tsx
│       │   │   ├── RegisterForm.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── common/
│       │   │   ├── SearchBar.tsx
│       │   │   ├── WhatsAppButton.tsx
│       │   │   ├── Breadcrumbs.tsx
│       │   │   ├── Pagination.tsx
│       │   │   └── Loading.tsx
│       │   └── admin/
│       │       ├── DashboardStats.tsx
│       │       ├── ProductForm.tsx
│       │       ├── OrderTable.tsx
│       │       ├── InventoryAlert.tsx
│       │       └── CustomerTable.tsx
│       ├── lib/
│       │   ├── api.ts                # API client
│       │   ├── auth.ts               # Auth helpers
│       │   ├── cart.ts               # Cart state (Zustand)
│       │   └── shipping.ts           # Shipping calculator
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useCart.ts
│       │   └── useDebounce.ts
│       ├── store/
│       │   └── cartStore.ts          # Zustand store
│       ├── types/
│       │   └── index.ts
│       └── utils/
│           └── formatters.ts
```

---

## Database Schema (Prisma)

Core entities and relationships — full schema in `backend/prisma/schema.prisma`.

### Key Design Decisions:

- **Soft deletes** on products, customers, orders
- **Slug-based URLs** for SEO (`/products/pvc-pipe-20mm`)
- **JSONB** for technical specifications (flexible per-product attributes)
- **Enum for order status** — PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **Enum for user role** — ADMIN, STAFF, CUSTOMER
- **Transaction-safe checkout** with stock reservation
- **Index on SKU, barcode, slug** for fast lookups

---

## API Endpoints (v1)

### Authentication
- `POST /api/v1/auth/register` — Create customer account
- `POST /api/v1/auth/login` — Login (email or phone)
- `POST /api/v1/auth/refresh` — Refresh JWT token
- `POST /api/v1/auth/logout` — Invalidate refresh token
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Reset password with token

### Products
- `GET /api/v1/products` — List with pagination, filters, search
- `GET /api/v1/products/:slug` — Get product detail
- `GET /api/v1/products/:slug/related` — Related products
- `GET /api/v1/products/featured` — Featured products
- `GET /api/v1/products/low-stock` — Low stock (admin)

### Categories
- `GET /api/v1/categories` — Category tree
- `GET /api/v1/categories/:slug` — Category detail + products
- `POST /api/v1/categories` — Create (admin)
- `PUT /api/v1/categories/:id` — Update (admin)
- `DELETE /api/v1/categories/:id` — Soft delete (admin)

### Brands
- `GET /api/v1/brands` — List all brands
- `POST /api/v1/brands` — Create (admin)
- `PUT /api/v1/brands/:id` — Update (admin)

### Cart
- `GET /api/v1/cart` — Get cart (session or user)
- `POST /api/v1/cart/items` — Add to cart
- `PUT /api/v1/cart/items/:id` — Update quantity
- `DELETE /api/v1/cart/items/:id` — Remove from cart
- `DELETE /api/v1/cart` — Clear cart

### Orders
- `POST /api/v1/orders` — Create order (checkout)
- `GET /api/v1/orders` — List user orders
- `GET /api/v1/orders/:id` — Order detail
- `GET /api/v1/orders/track/:trackingNumber` — Public tracking
- `PUT /api/v1/orders/:id/status` — Update status (admin)
- `GET /api/v1/orders/invoice/:id` — Download PDF invoice

### Customers (Admin)
- `GET /api/v1/admin/customers` — List all customers
- `GET /api/v1/admin/customers/:id` — Customer detail
- `PUT /api/v1/admin/customers/:id/role` — Update role

### Inventory (Admin)
- `GET /api/v1/admin/inventory` — Stock overview
- `PUT /api/v1/admin/inventory/:id` — Update stock
- `GET /api/v1/admin/inventory/low-stock` — Low stock alerts

### Promotions (Admin)
- `GET /api/v1/promotions` — Active promotions (public)
- `POST /api/v1/admin/promotions` — Create (admin)
- `PUT /api/v1/admin/promotions/:id` — Update (admin)
- `DELETE /api/v1/admin/promotions/:id` — Delete (admin)

### Admin Dashboard
- `GET /api/v1/admin/dashboard` — Analytics overview
- `GET /api/v1/admin/orders` — All orders with filters
- `GET /api/v1/admin/products` — All products with filters

---

## Shipping Rules

| City | Delivery Fee |
|------|-------------|
| Ferizaj | FREE (0 EUR) |
| All other Kosovo cities | 2.00 EUR |

Calculated automatically during checkout based on delivery city selection.

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#1E3A5F` | Dark blue — headers, primary backgrounds |
| `primary-light` | `#2B4C7E` | Lighter blue — hover states |
| `accent` | `#F97316` | Orange — CTAs, badges, highlights |
| `accent-hover` | `#EA580C` | Darker orange — CTA hover |
| `background` | `#F8FAFC` | Light gray — page background |
| `surface` | `#FFFFFF` | White — cards, forms |
| `text-primary` | `#0F172A` | Near black — main text |
| `text-secondary` | `#64748B` | Gray — secondary text |
| `success` | `#22C55E` | Green — in stock, success |
| `warning` | `#F59E0B` | Amber — low stock |
| `danger` | `#EF4444` | Red — out of stock, errors |

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@db:5432/agtradegroup?schema=public
REDIS_URL=redis://redis:6379
JWT_SECRET=<generate-random-64-char-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate-random-64-char-string>
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@agtradegroup.com
SMTP_PASSWORD=<smtp-password>
FROM_EMAIL=noreply@agtradegroup.com
BASE_URL=https://agtradegroup.com
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=5242880
FREE_DELIVERY_CITY=Ferizaj
STANDARD_DELIVERY_FEE=2
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_BASE_URL=https://agtradegroup.com
NEXT_PUBLIC_WHATSAPP_NUMBER=383XXXXXXXXX
NEXT_PUBLIC_FREE_DELIVERY_CITY=Ferizaj
NEXT_PUBLIC_DELIVERY_FEE=2
NEXT_PUBLIC_CURRENCY=EUR
```

---

## Docker Compose Services

| Service | Image | Port | Volume |
|---------|-------|------|--------|
| `frontend` | Custom (Next.js) | 3000:3000 | - |
| `backend` | Custom (Express) | 3001:3001 | uploads:/app/uploads |
| `db` | postgres:16 | 5432:5432 | db_data:/var/lib/postgresql/data |
| `redis` | redis:7-alpine | 6379:6379 | redis_data:/data |

---

## Build & Run Commands

```bash
# First-time setup
cp .env.example .env
# Edit .env with your values

# Build and start all services
docker compose up -d --build

# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Seed database with sample data
docker compose exec backend npx prisma db seed

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

---

## Development Phases

### Phase 1: Foundation (Current)
- [x] Master project file (this document)
- [ ] Docker Compose + Dockerfiles
- [ ] Prisma schema + seed data
- [ ] Backend Express boilerplate

### Phase 2: Core Backend
- [ ] Authentication system (JWT + refresh)
- [ ] Products CRUD + search/filter
- [ ] Categories + Brands
- [ ] Cart system
- [ ] Order system with transactions

### Phase 3: Frontend Storefront
- [ ] Next.js app setup + Tailwind
- [ ] Homepage with all sections
- [ ] Shop + Category pages
- [ ] Product detail page
- [ ] Cart + Checkout flow

### Phase 4: Customer Features
- [ ] Auth pages (login, register, reset)
- [ ] Account dashboard
- [ ] Order tracking
- [ ] Address management

### Phase 5: Admin Dashboard
- [ ] Admin auth + layout
- [ ] Product management
- [ ] Order management
- [ ] Customer management
- [ ] Inventory alerts
- [ ] Analytics dashboard

### Phase 6: Polish
- [ ] SEO (sitemap, robots, metadata)
- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] WhatsApp integration
- [ ] Performance optimization
- [ ] README documentation

---

## Notes for Future Development

- **ERP Integration:** API is designed with versioning and clean REST patterns. ERP systems can integrate via the REST API or direct database access.
- **Payment Gateway Ready:** Checkout system designed to add online payment (Stripe, local Kosovo providers) alongside existing Cash on Delivery and Bank Transfer.
- **Multi-language Ready:** Database schema supports i18n fields. Future: add Albanian/Serbian language toggle.
- **Scalability:** Redis caching layer allows horizontal scaling. Database connection pooling handles increased load.
