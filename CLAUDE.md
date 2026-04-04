# B2B Marketplace — Greek Food & Beverage

A B2B marketplace connecting Greek restaurants/bars with food & beverage suppliers. Replaces WhatsApp/Viber ordering with a proper webshop experience.

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Auth:** NextAuth.js (Auth.js) v5 with Prisma adapter — email/password
- **Database:** Supabase Postgres (connection string only — no Supabase JS client for DB)
- **ORM & Migrations:** Prisma
- **Storage:** Supabase Storage behind `lib/storage` abstraction (swappable to S3/Cloudinary)
- **UI:** shadcn/ui + Tailwind CSS v4 + Manrope (display) + Inter (body) fonts
- **Client State:** Zustand (cart, UI state)
- **i18n:** next-intl (English `en` + Greek `el`)
- **Charts:** Recharts
- **Maps:** Leaflet + react-leaflet
- **Package Manager:** npm
- **Deployment:** Vercel

## Project Structure

```
b2b/
├── prisma/
│   ├── schema.prisma          # Data model
│   └── migrations/            # Prisma migrations
├── public/
│   └── locales/               # i18n JSON files (not used by next-intl, kept for assets)
├── src/
│   ├── app/
│   │   ├── [locale]/          # next-intl locale wrapper
│   │   │   ├── (auth)/        # Login, register
│   │   │   ├── (buyer)/       # Marketplace, catalog, orders, favorites, checkout
│   │   │   ├── (supplier)/    # Dashboard, inventory, orders, settings
│   │   │   └── (admin)/       # Category management
│   │   └── api/               # API Routes (REST-style)
│   │       ├── auth/          # NextAuth endpoints
│   │       ├── products/
│   │       ├── orders/
│   │       ├── reviews/
│   │       ├── categories/
│   │       ├── suppliers/
│   │       ├── favorites/
│   │       └── upload/
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/            # Sidebars, navbars, footers
│   │   ├── buyer/             # Buyer-specific components
│   │   ├── supplier/          # Supplier-specific components
│   │   └── shared/            # Shared components (product cards, etc.)
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── storage.ts         # Storage abstraction (Supabase Storage behind interface)
│   │   ├── utils.ts           # General utilities
│   │   └── validations/       # Zod schemas for API validation
│   ├── stores/
│   │   ├── cart-store.ts      # Zustand cart store
│   │   └── ui-store.ts        # Zustand UI store (sidebar, modals, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── messages/              # next-intl translation JSON files
│       ├── en.json
│       └── el.json
├── Design/                    # Design mockups and DESIGN.md
├── CLAUDE.md                  # This file
├── .env.local                 # Environment variables (not committed)
└── package.json
```

## Architecture Principles

### API Routes as Backend Layer
All mutations go through `/api/*` routes. These routes:
- Validate input with Zod
- Check authentication via `getServerSession()`
- Check authorization (role-based)
- Use Prisma for DB access
- Return JSON responses

This makes future extraction to a standalone backend straightforward.

### Storage Abstraction
`lib/storage.ts` exports a `StorageService` interface with methods like `upload()`, `getUrl()`, `delete()`. The default implementation uses Supabase Storage. To swap providers, implement the same interface with S3/Cloudinary.

### Authentication & Authorization
- NextAuth.js v5 with Prisma adapter
- Email/password credentials provider
- Three roles: `BUYER`, `SUPPLIER`, `ADMIN` — set at registration, immutable
- API routes check role via session before processing
- Middleware protects route groups: `/(buyer)` requires BUYER, `/(supplier)` requires SUPPLIER, `/(admin)` requires ADMIN

### i18n
- next-intl with `[locale]` dynamic segment
- Default locale: `en`, supported: `en`, `el`
- All user-facing strings in `src/messages/{locale}.json`
- API error messages are locale-aware

## Data Model Overview

- **User** — email, password hash, role (BUYER/SUPPLIER/ADMIN), profile info
- **SupplierProfile** — business name, description, logo, contact, location (lat/lng)
- **BuyerProfile** — business name, business type, delivery address
- **Category** — name (translatable), slug, icon
- **Product** — title, description, images[], video?, category, supplier
- **ProductVariant** — dimension label (e.g., "500ml"), price, stock, sku
- **Order** — buyer, status, total, delivery address, created_at
- **OrderGroup** — order, supplier (sub-group per supplier within an order)
- **OrderItem** — order group, product variant, quantity, unit price
- **Review** — author (buyer), target (product or supplier), rating, comment
- **Favorite** — user, target (product or supplier)

## Design System — "Digital Sommelier"

Follow `Design/aegean_pro/DESIGN.md` for the full spec. Key rules:
- **No 1px borders** for sectioning — use background color shifts
- **Surface hierarchy:** base (#f8f9fa) → container-low (#f3f4f5) → white (#ffffff)
- **Primary:** Aegean blue (#003461), **Secondary:** Olive green
- **CTA buttons:** Gradient from #003461 to #004b87 at 135deg
- **Typography:** Manrope for headlines, Inter for body/data
- **No pure black text** — use #191c1d
- **Shadows:** Tinted ambient shadows with primary color, not standard drop shadows
- **Input fields:** Minimal, surface-container-high background, ghost border on focus
- **Food imagery:** 0.5rem border radius
- **White space over borders** — always

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx prisma migrate dev    # Run migrations
npx prisma generate       # Regenerate Prisma client
npx prisma studio         # Visual DB browser
```

## Environment Variables

```
DATABASE_URL=              # Supabase Postgres connection string
DIRECT_URL=                # Supabase direct connection (for migrations)
NEXTAUTH_SECRET=           # Random secret for NextAuth
NEXTAUTH_URL=              # http://localhost:3000 in dev
SUPABASE_URL=              # Supabase project URL (for storage only)
SUPABASE_SERVICE_KEY=      # Supabase service role key (for storage only)
```

## MVP Scope

### In MVP
- Product browsing, search (LIKE/contains), cart, checkout (no real payment — stock decrements)
- Registration as BUYER or SUPPLIER (email/password)
- Supplier: add/edit products with variants, inventory management, sales dashboard (Recharts)
- Buyer: browse marketplace, supplier catalogs, order history, favorites, quick reorder
- Reviews & ratings (products and suppliers)
- Admin: category CRUD
- Supplier profile page with map
- Full i18n (EN/EL)
- Mobile responsive

### Post-MVP (not implemented, placeholder buttons only where noted)
- Real payment integration
- Chat between buyer/supplier
- Invoices (fake "Invoices" button in nav only)
- Supplier certifications & badges
- Bulk product upload
- Delivery scheduling
- Email notifications
- Statement feature
- Separate backend service extraction

## Conventions

- Use `async` Server Components for initial data loading where possible
- All form submissions go through API routes, not Server Actions
- Validate all API inputs with Zod schemas in `lib/validations/`
- Use Prisma transactions for operations that touch multiple tables (e.g., order placement + stock decrement)
- Keep components small and composable
- Co-locate component-specific types with the component
- Use barrel exports sparingly — only for `components/ui/`
- Name files in kebab-case
- Name components in PascalCase
- Branding is generic "B2B" — no hardcoded marketplace name (use i18n key `app.name`)
