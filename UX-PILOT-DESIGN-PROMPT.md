# UX Pilot Design Prompt — AgTradeGroup E-Commerce Platform

Copy and paste this entire prompt into UX Pilot (or any AI design tool) to generate UI mockups and design systems.

---

## Design Brief

Create a complete UI/UX design for **AgTradeGroup**, a modern e-commerce platform for plumbing, heating, construction materials, and professional tools. The business is based in Ferizaj, Kosovo and serves both retail customers and professional contractors (plumbers, installers, construction workers) across Kosovo.

## Target Audience

- **Primary:** Professional contractors — plumbers, HVAC installers, construction workers who need to order materials quickly on mobile while on job sites
- **Secondary:** Retail customers — homeowners doing renovations or construction projects
- **Geography:** Kosovo (primary city: Ferizaj)
- **Language:** English UI now, with future Albanian/Serbian localization

## Brand Identity

### Company Name
AgTradeGroup

### Tagline
"Plumbing, Heating & Construction Materials"

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Dark Blue) | `#1E3A5F` | Headers, navigation, primary backgrounds, footer |
| Primary Light | `#2B4C7E` | Hover states, secondary backgrounds |
| Primary Dark | `#152943` | Top bar, footer background |
| Accent (Orange) | `#F97316` | CTAs, badges, sale indicators, highlights, key interactive elements |
| Accent Hover | `#EA580C` | CTA hover states |
| Background | `#F8FAFC` | Page background (light gray) |
| Surface | `#FFFFFF` | Cards, forms, modals |
| Text Primary | `#0F172A` | Main text (near black) |
| Text Secondary | `#64748B` | Secondary text, labels |
| Success | `#22C55E` | In-stock indicators, confirmations |
| Warning | `#F59E0B` | Low stock, cautions |
| Danger | `#EF4444` | Out of stock, errors, sale badges |

### Typography
- **Headings:** Bold, strong hierarchy — use a modern sans-serif (Inter, system font)
- **Body:** Clean, highly readable — 14-16px base
- **Prices:** Bold, prominent — use accent color for discounted prices
- **Labels:** Medium weight, uppercase for small labels

### Design Style
- Modern industrial e-commerce
- Clean, professional, no-nonsense
- Contractor-friendly — prioritize speed and readability over decorative elements
- Large touch targets for mobile (minimum 44x44px)
- High contrast for outdoor/job site visibility

## Pages to Design

### 1. Homepage
Sections (top to bottom):
1. **Hero Banner** — Full-width dark blue gradient with bold headline "Professional Plumbing & Construction Materials", subtitle about quality products and free delivery, two CTAs ("Shop Now" in orange, "Contact Us" outlined)
2. **Free Delivery Banner** — Orange full-width strip: "Free Delivery in Ferizaj — Only 2€ for the rest of Kosovo!"
3. **Category Grid** — 2-column mobile, 5-column desktop. Each category has an icon emoji, name. Categories: Plumbing, Heating, Bathroom, Tools, Construction, Pipes, Valves, Pumps, Boilers, Floor Heating
4. **Featured Products** — Product grid (2-col mobile, 4-col desktop). Each card: product image, brand name, product name (2 lines max), price (show discount if applicable), discount badge, "Add to Cart" button, stock indicator
5. **Why Choose Us** — 4 feature cards with icons: Fast Delivery, Quality Products, Expert Support, Easy Ordering
6. **Customer Reviews** — 3 review cards on dark blue background with star ratings, quotes, customer names and roles
7. **WhatsApp CTA** — Green banner with message icon, "Need Help Choosing?" headline, "Chat on WhatsApp" button

### 2. Shop / Product Listing Page
- Breadcrumb navigation
- Page title (changes based on filter: "All Products", "Plumbing", "Search results for...")
- Left sidebar (desktop) / slide-out panel (mobile) with filters:
  - Categories (list with product counts)
  - Brands (list)
- Product grid: 2-col mobile, 3-col tablet, 4-col desktop
- Pagination at bottom
- Mobile: filter toggle button, full-screen filter overlay

### 3. Product Detail Page
- Breadcrumb: Home > Shop > Category > Product Name
- Two-column layout (desktop): left = images, right = product info
- Image gallery: large main image + thumbnail strip below
- Product info: brand name (small), product name (large h1), short description, price (large, show discount + original price + % off badge), stock status (green/red), quantity selector (+/-), "Add to Cart" button (large, orange)
- Feature icons: Truck (delivery), Shield (quality)
- Technical specs table (key-value pairs in 2-column grid)
- SKU at bottom
- Related Products section below (4-card grid)

### 4. Shopping Cart Page
- Cart title with item count
- List of cart items: thumbnail image, product name, SKU, price, quantity selector (+/-), remove button (trash icon)
- Order summary sidebar (sticky on desktop): subtotal, shipping (show FREE for Ferizaj), total (large), "Proceed to Checkout" button (large, orange), "Clear Cart" link
- Empty cart state: cart icon, "Your cart is empty" message, "Continue Shopping" button

### 5. Checkout Page
- Back to cart link
- Form sections in cards:
  - Contact Information: name, email, phone (2-col grid)
  - Delivery Address: city dropdown (Kosovo cities), ZIP, street address (2-col grid)
  - Payment Method: radio buttons — Cash on Delivery, Bank Transfer (with descriptions)
  - Order Notes: textarea (optional)
- Order summary sidebar: item list with quantities and prices, subtotal, shipping (dynamic based on city), total (large), city-based free delivery message
- Place Order button (full-width, large, orange) — shows total amount

### 6. Customer Account Page
- Welcome header with logout button
- Two-column layout:
  - Left: Profile card (name, email, phone)
  - Right: Recent Orders list — each order: order number, date, status badge (color-coded), item count, total, "Track Order" link
- Empty state: "No orders yet" with "Start Shopping" link

### 7. Order Tracking Page
- Title: "Track Your Order"
- Search bar: "Enter order number or tracking number" + Track button
- Order found: order number, tracking number, status badge
- Progress tracker: horizontal timeline with 5 steps (Order Placed → Confirmed → Processing → Shipped → Delivered), current step highlighted in orange, completed steps filled, future steps gray
- Order details: items list, pricing breakdown, delivery address, payment method

### 8. Login Page
- Centered card on light background
- Logo/brand at top
- Email/Phone input, Password input
- Login button (full-width, orange)
- "Don't have an account? Register" link

### 9. Register Page
- Centered card
- First Name + Last Name (side by side), Email, Phone, Password, Confirm Password
- Create Account button (full-width, orange)
- "Already have an account? Login" link

### 10. About Us Page
- Breadcrumb
- Large title
- Company description paragraph
- "Our Mission" section
- "What We Offer" — checklist with checkmark icons
- "Why Choose Us" — 4 feature cards in 2-col grid
- Contact info at bottom

### 11. Contact Page
- Breadcrumb
- Two-column layout:
  - Left: Contact info cards — Phone (with hours), Email (with response time), Address, WhatsApp (with link)
  - Right: Contact form — Name, Email, Phone, Message (textarea), Send button
- Success state after submission

### 12. Delivery Information Page
- Breadcrumb
- Large orange banner: "Free Delivery in Ferizaj!" with truck icon
- Two cards: Delivery Rates (Ferizaj = FREE in green, Rest of Kosovo = 2 EUR), Delivery Times (same day for Ferizaj, 1-2 days for others)
- Coverage area grid: list of all Kosovo cities with Ferizaj highlighted green as FREE
- FAQ section with accordion-style questions

### 13. Admin Dashboard
- Sidebar navigation (dark blue): Dashboard, Products, Categories, Orders, Customers, Settings, Logout
- Top bar: hamburger (mobile), user name, "View Store" link
- Stats cards (4-column grid): Total Revenue, Total Orders, Total Customers, Total Products — each with icon, large number, label
- Two-column section below:
  - Low Stock Alerts (warning icon, list of products with stock count in red/orange)
  - Recent Orders (list with order number, customer name, total, status)
- Orders by Status section: count cards for each status

### 14. Admin Products Page
- Title + "Add Product" button
- Search bar
- Data table: Product name, SKU, Price, Stock (highlighted if low), Category, Actions (edit/delete icons)
- Mobile: card-based layout instead of table

### 15. Admin Orders Page
- Title + status filter dropdown
- Data table: Order #, Customer, City, Total, Status (dropdown to update), Date, View link
- Status badges with colors

### 16. Admin Customers Page
- Title
- Data table: Name, Email, Phone, Role (dropdown to update), Registered date

### 17. Admin Categories Page
- Title + "Add Category" button
- Add/Edit form modal or inline: Name, Slug, Description, Parent Category dropdown, Sort Order
- Data table: Name (with hierarchy indentation), Slug, Parent, Sort, Actions

### 18. Admin Settings Page
- Multiple form sections: Store Settings, Shipping Settings, Inventory Alerts
- Each section in its own card with Save button
- Success message toast

## Mobile-First Requirements

### Critical Mobile UX Rules
1. **Sticky cart icon** in header with item count badge (always visible)
2. **Large CTA buttons** — minimum 48px height, full-width on mobile
3. **Bottom sheet filters** on shop page instead of sidebar
4. **Sticky "Add to Cart"** button on product detail page (fixed at bottom on scroll)
5. **WhatsApp floating button** — bottom-right, always visible, green
6. **Touch targets** — minimum 44x44px for all interactive elements
7. **Readable prices** — minimum 16px for price on product cards
8. **Simplified navigation** — hamburger menu with full-screen overlay
9. **Quick reorder** — contractors often reorder the same items; make past orders easily accessible

### Responsive Breakpoints
- **Mobile:** 320px - 640px (1-2 column grids)
- **Tablet:** 641px - 1024px (3 column grids, collapsible sidebar)
- **Desktop:** 1025px+ (4 column grids, full sidebar)

## Component Library to Design

### Core Components
- Product Card (with image, name, brand, price, discount badge, add to cart button, stock indicator)
- Primary Button (orange, large, with hover state)
- Secondary Button (outlined)
- Input Field (with label, focus ring in orange)
- Select/Dropdown
- Badge/Tag (for status, discounts, stock)
- Card (white, rounded corners, subtle shadow)
- Breadcrumbs
- Pagination
- Loading Spinner (orange)
- Empty State (icon + message + CTA)
- Toast/Alert (success, error, warning)

### Navigation Components
- Header (with logo, nav links, search toggle, account icon, cart icon with badge, hamburger)
- Footer (4-column: company info, quick links, categories, delivery info)
- Mobile Navigation (full-screen overlay)
- Admin Sidebar (dark, with icons)

### Form Components
- Text Input
- Textarea
- Select/Dropdown
- Radio Button Group (for payment methods)
- Quantity Selector (+ number -)
- Search Bar (with search icon button)

## Design Deliverables Expected

1. **Homepage** — Desktop and Mobile views
2. **Shop Page** — Desktop (with sidebar) and Mobile (with filter overlay)
3. **Product Detail Page** — Desktop and Mobile
4. **Cart Page** — Desktop and Mobile
5. **Checkout Page** — Desktop and Mobile
6. **Account Page** — Desktop and Mobile
7. **Order Tracking** — Desktop and Mobile
8. **Admin Dashboard** — Desktop view
9. **Admin Products/Orders Tables** — Desktop view
10. **Component Library** — All reusable components with states (default, hover, active, disabled)
11. **Design Tokens** — Colors, typography scale, spacing system, border radius values
12. **Interaction Specifications** — How filters open on mobile, how the cart slides, how modals work

## Design Inspiration References

- Toolstation / Screwfix (UK construction supply)
- Grainger (industrial supplies)
- Home Depot Pro (contractor experience)
- Zoro Tools

Key takeaway from these: prioritize **speed**, **clarity**, and **efficiency** over visual flair. Contractors need to find and order products quickly, often in distracting environments.

## Notes

- The design should feel **professional and industrial**, not luxury or lifestyle
- Orange is used **sparingly** — only for CTAs, sale badges, and key highlights
- Dark blue conveys **trust and professionalism**
- White space is important — avoid cluttered layouts
- Product images should be prominent — large cards, clear thumbnails
- Prices should always be **immediately visible** — this is a price-sensitive market
- The WhatsApp button is critical — many customers will prefer chat over forms
