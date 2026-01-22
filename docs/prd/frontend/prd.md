# KiwiCar Frontend Application PRD

**Document Version:** 1.0
**Created:** January 2024
**Status:** Draft
**Product:** KiwiCar Web Application (Frontend)

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for the KiwiCar frontend web application — a React-based single-page application (SPA) that serves as the primary user interface for New Zealand's AI-powered used car marketplace.

### 1.2 Scope

This PRD covers:
- User authentication flows
- Car listing browsing and search
- Vehicle plate lookup functionality
- Car listing creation (seller flow)
- AI-powered features (pricing, descriptions)
- User dashboard and account management
- Favorites and price alerts

### 1.3 Out of Scope

- Landing/marketing page (see `/docs/prd/landing/prd.md`)
- Backend API implementation (see `/docs/prd/backend/prd.md`)
- Native mobile applications
- Admin dashboard

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5.0+ | Type safety |
| Vite | 5.0+ | Build tool |
| React Router | 6+ | Client-side routing |
| Tailwind CSS | 3.0+ | Styling |
| Zustand | Latest | Client state management |
| TanStack Query | v5 | Server state & caching |
| React Hook Form | Latest | Form handling |
| Zod | Latest | Schema validation |
| Axios | Latest | HTTP client |

### 2.1 Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |
| Vitest | Unit testing |
| Playwright | E2E testing |
| Storybook | Component documentation (optional) |

---

## 3. Information Architecture

```
KiwiCar App
├── / (Home - Listing Feed)
├── /search
│   └── ?make=&model=&minPrice=&maxPrice=&region=...
├── /listing/:id (Listing Detail)
├── /plate-check (Vehicle Lookup)
│   └── /plate-check/:plateNumber (Results)
├── /sell (Create Listing Flow)
│   ├── /sell/plate
│   ├── /sell/photos
│   ├── /sell/details
│   ├── /sell/pricing
│   └── /sell/preview
├── /auth
│   ├── /auth/login
│   ├── /auth/register
│   ├── /auth/forgot-password
│   └── /auth/reset-password
├── /account
│   ├── /account/profile
│   ├── /account/settings
│   └── /account/notifications
├── /my-listings (Seller Dashboard)
│   └── /my-listings/:id/edit
├── /favorites
├── /messages (P1)
│   └── /messages/:conversationId
└── /help
```

---

## 4. Functional Requirements

### 4.1 Authentication Module

#### 4.1.1 Registration

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-AUTH-001 | Email registration with verification | P0 |
| FE-AUTH-002 | NZ phone (+64) registration with SMS OTP | P0 |
| FE-AUTH-003 | Password strength indicator (min 8 chars, letters + numbers) | P0 |
| FE-AUTH-004 | Terms of service checkbox | P0 |
| FE-AUTH-005 | Form validation with clear error messages | P0 |
| FE-AUTH-006 | Google OAuth integration | P1 |
| FE-AUTH-007 | Facebook OAuth integration | P1 |

**Registration Flow:**
```
Enter email/phone → Validate format → Submit →
Receive OTP/verification link → Enter OTP/click link →
Set password → Complete profile → Redirect to home
```

#### 4.1.2 Login

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-AUTH-008 | Email + password login | P0 |
| FE-AUTH-009 | Phone + password login | P0 |
| FE-AUTH-010 | Phone + OTP quick login | P1 |
| FE-AUTH-011 | "Remember me" option (30 days) | P0 |
| FE-AUTH-012 | Show/hide password toggle | P0 |
| FE-AUTH-013 | Redirect to intended page after login | P0 |

#### 4.1.3 Password Reset

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-AUTH-014 | Request reset via email | P0 |
| FE-AUTH-015 | Request reset via phone OTP | P0 |
| FE-AUTH-016 | Reset link expiry display (24h) | P0 |
| FE-AUTH-017 | New password confirmation field | P0 |

#### 4.1.4 Session Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-AUTH-018 | Store JWT in httpOnly cookie (preferred) or secure storage | P0 |
| FE-AUTH-019 | Auto-refresh token before expiry | P0 |
| FE-AUTH-020 | Logout clears all session data | P0 |
| FE-AUTH-021 | Handle 401 responses globally (redirect to login) | P0 |

---

### 4.2 Listing Browse & Search

#### 4.2.1 Listing Feed (Home)

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-LIST-001 | Display paginated listing cards (20 per page) | P0 |
| FE-LIST-002 | Infinite scroll loading | P0 |
| FE-LIST-003 | Pull-to-refresh on mobile | P0 |
| FE-LIST-004 | Loading skeleton states | P0 |
| FE-LIST-005 | Empty state when no listings | P0 |

**Listing Card Contents:**
- Cover image (lazy loaded)
- Title (Make Model Year)
- Price
- Mileage
- Location (Region)
- Days since posted
- Favorite button (heart icon)

#### 4.2.2 Search & Filters

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SEARCH-001 | Keyword search (make, model) | P0 |
| FE-SEARCH-002 | Brand/make filter (multi-select) | P0 |
| FE-SEARCH-003 | Model filter (dependent on make) | P0 |
| FE-SEARCH-004 | Price range filter (min-max slider) | P0 |
| FE-SEARCH-005 | Year range filter | P0 |
| FE-SEARCH-006 | Mileage range filter | P0 |
| FE-SEARCH-007 | Region filter (NZ regions) | P0 |
| FE-SEARCH-008 | Fuel type filter (Petrol/Diesel/Hybrid/Electric) | P1 |
| FE-SEARCH-009 | Transmission filter (Auto/Manual) | P1 |
| FE-SEARCH-010 | Body type filter | P1 |
| FE-SEARCH-011 | Persist filters in URL query params | P0 |
| FE-SEARCH-012 | Clear all filters button | P0 |
| FE-SEARCH-013 | Active filters display as chips | P0 |

#### 4.2.3 Sorting

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SORT-001 | Default (recommended) sorting | P0 |
| FE-SORT-002 | Price: Low to High | P0 |
| FE-SORT-003 | Price: High to Low | P0 |
| FE-SORT-004 | Newest first | P0 |
| FE-SORT-005 | Mileage: Low to High | P1 |

---

### 4.3 Listing Detail Page

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-DETAIL-001 | Image gallery with swipe/carousel | P0 |
| FE-DETAIL-002 | Fullscreen image viewer | P0 |
| FE-DETAIL-003 | Vehicle info section (make, model, year, mileage, etc.) | P0 |
| FE-DETAIL-004 | Seller description | P0 |
| FE-DETAIL-005 | Price display with AI estimate comparison | P0 |
| FE-DETAIL-006 | WOF/Rego status badges | P0 |
| FE-DETAIL-007 | Seller info card | P0 |
| FE-DETAIL-008 | "Contact Seller" button | P0 |
| FE-DETAIL-009 | Favorite/unfavorite button | P0 |
| FE-DETAIL-010 | Share button (copy link, social) | P1 |
| FE-DETAIL-011 | Report listing button | P1 |
| FE-DETAIL-012 | Similar listings section | P2 |
| FE-DETAIL-013 | AI condition analysis display | P1 |
| FE-DETAIL-014 | Price history chart (if price changed) | P1 |

**Contact Options:**
- Show phone number (if seller enabled)
- "Send Message" button (opens messaging, P1)
- WhatsApp link (optional)

---

### 4.4 Plate Lookup

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-PLATE-001 | Plate number input with NZ format validation | P0 |
| FE-PLATE-002 | Search button with loading state | P0 |
| FE-PLATE-003 | Display vehicle info results | P0 |
| FE-PLATE-004 | Show WOF status and expiry date | P0 |
| FE-PLATE-005 | Show Rego status and expiry date | P0 |
| FE-PLATE-006 | Show odometer reading history | P0 |
| FE-PLATE-007 | Show first registration date | P0 |
| FE-PLATE-008 | Query limit display (3/day guest, 10/day logged in) | P0 |
| FE-PLATE-009 | Login prompt when limit reached | P0 |
| FE-PLATE-010 | Error handling for invalid/not found plates | P0 |
| FE-PLATE-011 | "List this car" CTA for sellers | P0 |

**Results Display:**
```
┌─────────────────────────────────────────┐
│  ABC123                                 │
│  2018 Toyota Corolla GX                 │
├─────────────────────────────────────────┤
│  WOF: ✅ Valid until 15 Mar 2024       │
│  Rego: ✅ Valid until 22 Jun 2024      │
│  First Registered: 12 Jan 2018          │
│  Odometer: 68,542 km (recorded 10/2023) │
│  Engine: 1800cc Petrol                  │
│  Body: Sedan, Silver                    │
├─────────────────────────────────────────┤
│  [ List This Car for Sale ]             │
└─────────────────────────────────────────┘
```

---

### 4.5 Sell Car Flow (Listing Creation)

#### 4.5.1 Step 1: Enter Plate Number

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-001 | Plate number input with validation | P0 |
| FE-SELL-002 | Auto-fetch vehicle info from NZTA | P0 |
| FE-SELL-003 | Display fetched info for confirmation | P0 |
| FE-SELL-004 | Allow editing of auto-filled fields | P0 |
| FE-SELL-005 | Manual entry fallback if plate lookup fails | P1 |

#### 4.5.2 Step 2: Upload Photos

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-006 | Photo upload (max 10 images) | P0 |
| FE-SELL-007 | Drag-and-drop support (desktop) | P1 |
| FE-SELL-008 | Camera capture (mobile) | P0 |
| FE-SELL-009 | Photo reordering (drag to reorder) | P1 |
| FE-SELL-010 | First photo = cover image indicator | P0 |
| FE-SELL-011 | Minimum 3 photos required | P0 |
| FE-SELL-012 | Client-side image compression (max 2MB each) | P0 |
| FE-SELL-013 | Upload progress indicator | P0 |
| FE-SELL-014 | Delete uploaded photo | P0 |
| FE-SELL-015 | Recommended angles guide | P2 |

#### 4.5.3 Step 3: AI Description Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-016 | "Generate Description" button | P0 |
| FE-SELL-017 | Loading state during AI generation | P0 |
| FE-SELL-018 | Display AI-generated description | P0 |
| FE-SELL-019 | Editable description text area | P0 |
| FE-SELL-020 | "Regenerate" button | P1 |
| FE-SELL-021 | Character count display | P0 |
| FE-SELL-022 | Language toggle (English/Chinese) | P1 |

#### 4.5.4 Step 4: Set Price

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-023 | Price input field (NZD) | P0 |
| FE-SELL-024 | Display AI suggested price range (min-recommended-max) | P0 |
| FE-SELL-025 | Visual indicator if price is below/within/above range | P0 |
| FE-SELL-026 | "Price Negotiable" checkbox | P1 |
| FE-SELL-027 | Pricing explanation tooltip | P1 |

#### 4.5.5 Step 5: Preview & Publish

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-028 | Full preview of listing as buyers will see it | P0 |
| FE-SELL-029 | Edit buttons to go back to previous steps | P0 |
| FE-SELL-030 | "Publish" button | P0 |
| FE-SELL-031 | Success modal with share options | P0 |
| FE-SELL-032 | Save as draft functionality | P1 |

#### 4.5.6 Flow Navigation

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-SELL-033 | Step indicator (1/5, 2/5, etc.) | P0 |
| FE-SELL-034 | Back button to previous step | P0 |
| FE-SELL-035 | Unsaved changes warning on navigation away | P0 |
| FE-SELL-036 | Persist draft in local storage | P1 |

---

### 4.6 Favorites & Price Alerts

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-FAV-001 | Favorites list page | P0 |
| FE-FAV-002 | Add/remove favorite from listing card | P0 |
| FE-FAV-003 | Add/remove favorite from detail page | P0 |
| FE-FAV-004 | Show price change indicator on favorites | P1 |
| FE-FAV-005 | Enable price alert toggle per favorite | P0 |
| FE-FAV-006 | Set target price for alert | P1 |
| FE-FAV-007 | "Listing no longer available" indicator | P1 |
| FE-FAV-008 | Empty favorites state | P0 |
| FE-FAV-009 | Login prompt for guests trying to favorite | P0 |

---

### 4.7 Seller Dashboard (My Listings)

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-DASH-001 | List of user's listings | P0 |
| FE-DASH-002 | Status badge (Active/Sold/Removed) | P0 |
| FE-DASH-003 | Edit listing button | P0 |
| FE-DASH-004 | Mark as sold action | P0 |
| FE-DASH-005 | Remove/delete listing action | P0 |
| FE-DASH-006 | Change price action (triggers price alerts) | P0 |
| FE-DASH-007 | View count per listing | P1 |
| FE-DASH-008 | Favorite count per listing | P1 |
| FE-DASH-009 | Empty state for no listings | P0 |
| FE-DASH-010 | "Create new listing" CTA | P0 |

---

### 4.8 User Account

#### 4.8.1 Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-ACCT-001 | View/edit nickname | P0 |
| FE-ACCT-002 | Avatar upload | P1 |
| FE-ACCT-003 | Region selection | P0 |
| FE-ACCT-004 | Phone number display (masked) | P0 |
| FE-ACCT-005 | Email display | P0 |
| FE-ACCT-006 | Change password | P0 |

#### 4.8.2 Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-ACCT-007 | Contact visibility (show/hide phone on listings) | P0 |
| FE-ACCT-008 | Email notification preferences | P0 |
| FE-ACCT-009 | Delete account request | P1 |

---

### 4.9 Messaging (P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FE-MSG-001 | Conversation list | P1 |
| FE-MSG-002 | Chat interface per conversation | P1 |
| FE-MSG-003 | Link conversation to listing | P1 |
| FE-MSG-004 | Unread message indicator | P1 |
| FE-MSG-005 | Send text messages | P1 |
| FE-MSG-006 | Send images | P2 |
| FE-MSG-007 | Real-time updates (WebSocket) | P2 |

---

## 5. UI/UX Requirements

### 5.1 Responsive Design

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav |
| Tablet | 640px - 1024px | Two column grid |
| Desktop | > 1024px | Three column grid, side nav |

### 5.2 Navigation

**Mobile Navigation (Bottom Bar):**
- Home (Feed)
- Search
- Sell (+)
- Favorites
- Account

**Desktop Navigation (Top Bar):**
- Logo (links to home)
- Search bar
- "Sell Your Car" button
- Favorites icon
- Account dropdown

### 5.3 Loading States

| State | Implementation |
|-------|----------------|
| Initial page load | Skeleton screens |
| Data fetching | Spinner or skeleton |
| Form submission | Button loading state, disable interactions |
| Image loading | Placeholder with blur-up |

### 5.4 Error States

| Error Type | Handling |
|------------|----------|
| Network error | Toast notification + retry button |
| 404 Not Found | Custom 404 page |
| 500 Server Error | Error page with contact support option |
| Form validation | Inline field errors |
| Auth errors | Clear message + action (login/retry) |

### 5.5 Empty States

All list views should have designed empty states with:
- Relevant illustration
- Helpful message
- Primary action CTA

---

## 6. Performance Requirements

| Metric | Target |
|--------|--------|
| Lighthouse Performance Score | > 90 |
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.5s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Bundle Size (initial) | < 200KB gzipped |

### 6.1 Optimization Strategies

- Code splitting by route
- Lazy load images with intersection observer
- Preload critical assets
- Service worker for offline capability (P2)
- CDN for static assets
- React Query caching for API responses

---

## 7. Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| WCAG Level | AA compliance |
| Keyboard Navigation | Full support |
| Screen Reader | Proper ARIA labels |
| Color Contrast | Minimum 4.5:1 ratio |
| Focus Indicators | Visible focus states |
| Alt Text | All images |

---

## 8. Testing Requirements

### 8.1 Unit Tests

- All utility functions
- Custom hooks
- Form validation logic
- State management stores

### 8.2 Integration Tests

- Authentication flows
- Listing creation flow
- Search and filter functionality

### 8.3 E2E Tests (Playwright)

- User registration
- User login
- Browse listings
- Create listing (full flow)
- Favorite a listing
- Plate lookup

---

## 9. Analytics Events

| Event Name | Trigger | Properties |
|------------|---------|------------|
| `page_view` | Route change | page_path |
| `search` | Search executed | query, filters |
| `listing_view` | Detail page viewed | listing_id, price |
| `listing_favorite` | Favorite added | listing_id |
| `listing_share` | Share button clicked | listing_id, method |
| `listing_created` | New listing published | listing_id, category |
| `plate_lookup` | Plate search performed | success/fail |
| `signup` | Registration completed | method (email/phone/social) |
| `login` | Login completed | method |

---

## 10. Environment Configuration

| Environment | API Base URL | Features |
|-------------|--------------|----------|
| Development | http://localhost:3001 | All features, mock data available |
| Staging | https://api.staging.kiwicar.co.nz | All features |
| Production | https://api.kiwicar.co.nz | Production features only |

### 10.1 Environment Variables

```env
VITE_API_BASE_URL=
VITE_GA_TRACKING_ID=
VITE_SENTRY_DSN=
VITE_GOOGLE_OAUTH_CLIENT_ID=
VITE_FACEBOOK_APP_ID=
```

---

## 11. Deployment

| Aspect | Specification |
|--------|---------------|
| Hosting | Vercel / Cloudflare Pages / AWS Amplify |
| CI/CD | GitHub Actions |
| Preview Deployments | Per pull request |
| Production Deployment | On merge to main |
| CDN | Cloudflare / Vercel Edge |

---

## 12. Dependencies on Backend

This frontend requires the following backend API endpoints (see Backend PRD):

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /auth/me`
- `GET /listings`
- `GET /listings/:id`
- `POST /listings`
- `PUT /listings/:id`
- `DELETE /listings/:id`
- `GET /vehicles/:plateNumber`
- `POST /ai/generate-description`
- `GET /ai/pricing`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites/:id`
- `GET /users/me`
- `PUT /users/me`

---

*Document End*
