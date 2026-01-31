# KiwiCar Frontend - Implementation Status

**Last Updated:** 2026-01-29
**Overall Progress:** ~90%

---

## Quick Start

```bash
cd kiwicar-frontend
pnpm install
pnpm dev
```

---

## Implementation Decisions

| Decision | Choice |
|----------|--------|
| API Strategy | Mock data only (hardcoded with fake delays) |
| UI Components | shadcn/ui (Radix primitives + Tailwind) |
| Auth Handling | Mock logged-in state (user always authenticated) |
| Messaging | Skipped (P1 feature) |

---

## Completed

### Project Setup
- [x] Vite + React 18 + TypeScript scaffold
- [x] Path alias `@/` configured
- [x] Tailwind CSS 4 with brand colors (green: `#16a34a`)
- [x] All dependencies installed

### Dependencies Installed
```json
{
  "react-router-dom": "^7.x",
  "zustand": "^5.x",
  "@tanstack/react-query": "^5.x",
  "react-hook-form": "^7.x",
  "zod": "^4.x",
  "axios": "^1.x",
  "tailwindcss": "^4.x",
  "lucide-react": "latest",
  "react-intersection-observer": "latest",
  "@radix-ui/*": "various (for shadcn/ui)"
}
```

### Types & Data
- [x] `src/types/index.ts` - All interfaces (Listing, User, VehicleInfo, SearchFilters, etc.)
- [x] `src/data/mock.ts` - 12 sample listings, mock user, vehicle lookups
- [x] NZ regions and car makes/models constants

### Stores (Zustand)
- [x] `src/stores/auth.ts` - Mock authentication state (always logged in)
- [x] `src/stores/favorites.ts` - Favorites management with localStorage persistence
- [x] `src/stores/sell.ts` - Sell flow draft with localStorage persistence

### Hooks
- [x] `src/hooks/usePlateCheck.ts` - Plate validation, vehicle lookup, AI pricing/description
- [x] `src/hooks/useListings.ts` - TanStack Query hook with filtering, sorting, pagination, and single listing fetch

### UI Components (shadcn/ui style)
- [x] Button, Input, Card, Badge
- [x] Select, Dialog, Checkbox, Label
- [x] Skeleton, Tabs, Textarea
- [x] Separator, Dropdown Menu
- [x] Avatar, Switch, Slider, Tooltip

### Utilities
- [x] `src/lib/utils.ts` - cn(), formatPrice(), formatMileage(), formatDate(), getDaysAgo(), delay()

### Pages
- [x] `HomePage.tsx` - Hero section, search bar, infinite scroll listings
- [x] `SearchPage.tsx` - Filters (make, model, price, year, region), sorting, infinite scroll
- [x] `ListingDetailPage.tsx` - Full listing view with image gallery, vehicle info, seller contact, favorites
- [x] `PlateCheckPage.tsx` - Plate input, vehicle lookup results, WOF/Rego status
- [x] `SellPage.tsx` - Complete 5-step wizard:
  - [x] Step 1: Enter plate number (auto-fetch vehicle info)
  - [x] Step 2: Upload photos (drag-drop, reorder, min 3 max 10)
  - [x] Step 3: AI description generation (editable)
  - [x] Step 4: Set price (AI recommendation, visual range indicator)
  - [x] Step 5: Preview & publish (success dialog)
- [x] `FavoritesPage.tsx` - Saved listings with price alerts, price change indicators
- [x] `MyListingsPage.tsx` - Seller dashboard (active/sold/removed, view counts, quick actions)
- [x] `NotFoundPage.tsx` - 404 page

### Layout Components
- [x] `Navbar.tsx` - Desktop top nav, logo, search, user dropdown
- [x] `MobileNav.tsx` - Bottom navigation (Home, Search, Sell, Favorites, Account)
- [x] `Footer.tsx` - Links, copyright
- [x] `Layout.tsx` - Main layout wrapper with navbar and footer

### Common Components
- [x] `ListingCard.tsx` - Card with image, title, price, mileage, location, favorite button
- [x] `ListingCardSkeleton.tsx` - Loading skeleton
- [x] `EmptyState.tsx` - Empty state with icon, message, CTA
- [x] `ImageGallery.tsx` - Image carousel with fullscreen viewer

### Entry Point
- [x] `main.tsx` - QueryClientProvider configured
- [x] `App.tsx` - Complete routing setup

---

## Remaining TODO

### Pages
- [ ] `AccountPage.tsx` - User profile and settings (tabs for profile, settings, password change)

### Optional Enhancements (P1/P2 features)
- [ ] Messaging feature (P1) - Chat interface for buyer-seller communication
- [ ] OAuth integrations (P1) - Google/Facebook login
- [ ] Phone OTP login (P1)
- [ ] Image upload to S3/R2 (currently using mock URLs)
- [ ] Real-time notifications (P2)
- [ ] Service worker for offline capability (P2)

---

## File Structure

```
kiwicar-frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # ✅ shadcn/ui components (Button, Input, Card, Dialog, etc.)
│   │   ├── layout/       # ✅ Navbar, Footer, Layout
│   │   └── common/       # ✅ ListingCard, EmptyState, ImageGallery
│   ├── pages/
│   │   ├── home/         # ✅ HomePage.tsx
│   │   ├── search/       # ✅ SearchPage.tsx
│   │   ├── listing/      # ✅ ListingDetailPage.tsx
│   │   ├── plate-check/  # ✅ PlateCheckPage.tsx
│   │   ├── sell/         # ✅ SellPage.tsx + 5 step components
│   │   │   └── steps/    # ✅ Step1-5 components
│   │   ├── favorites/    # ✅ FavoritesPage.tsx
│   │   ├── my-listings/  # ✅ MyListingsPage.tsx
│   │   ├── account/      # ❌ AccountPage.tsx (TODO)
│   │   └── NotFoundPage.tsx  # ✅ 404 page
│   ├── hooks/            # ✅ usePlateCheck, useListings
│   ├── stores/           # ✅ auth.ts, favorites.ts, sell.ts
│   ├── lib/              # ✅ utils.ts
│   ├── data/             # ✅ mock.ts (12 listings, users, vehicles)
│   ├── types/            # ✅ index.ts (all TypeScript interfaces)
│   ├── App.tsx           # ✅ Complete routing
│   ├── main.tsx          # ✅ QueryClientProvider configured
│   └── index.css         # ✅ Tailwind + theme
```

Legend: ✅ Done | ❌ Not started

---

## Next Steps (Priority Order)

1. **AccountPage** - User profile and settings page (only major page remaining)
2. **Polish & Testing** - Add loading states, error handling refinements
3. **Accessibility** - ARIA labels, keyboard navigation improvements
4. **Performance** - Code splitting, lazy loading optimization
5. **Integration** - Connect to real backend API when available

---

## Notes for Next Developer

### Data & API
- Mock data is in `src/data/mock.ts` - 12 sample listings, mock users, vehicle lookups
- All API calls use `delay()` from utils to simulate network latency (300-1500ms)
- User is always "logged in" with mock user from `mockUser` in mock.ts (per requirements)

### State Management
- **Zustand stores:**
  - `auth.ts` - User authentication (mock state)
  - `favorites.ts` - Favorites with localStorage persistence
  - `sell.ts` - Sell flow draft with localStorage persistence
- **TanStack Query** - Server state management for listings, vehicle lookups

### UI Components
- All components use shadcn/ui (Radix primitives + Tailwind)
- Import from `@/components/ui/` (Button, Input, Card, Dialog, etc.)
- Path alias `@/` maps to `src/`

### Key Features Implemented
- ✅ Infinite scroll listings with filters and sorting
- ✅ Full listing detail view with image gallery
- ✅ Vehicle plate lookup (NZTA mock data)
- ✅ Complete 5-step sell wizard with AI features
- ✅ Favorites with price alerts
- ✅ Seller dashboard with listing management
- ✅ Responsive design (mobile bottom nav, desktop top nav)

### Still TODO
- AccountPage (profile, settings, password change)
- Real image upload (currently using mock URLs)
- Messaging feature (P1)
- OAuth integrations (P1)

### Running the App
```bash
cd kiwicar-frontend
pnpm install
pnpm dev  # Runs on http://localhost:5173
```
