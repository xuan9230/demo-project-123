# KiwiCar Backend API PRD

**Document Version:** 2.0 (MVP Simplified)
**Created:** January 2024
**Last Updated:** February 2026
**Status:** In Progress - MVP Planning
**Product:** KiwiCar Backend API Server

---

## Document Change Log

| Date | Version | Changes | Updated By |
|------|---------|---------|------------|
| Jan 2024 | 1.0 | Initial PRD with full feature set | - |
| Jan 2026 | 2.0 | Simplified for MVP: Supabase integration, removed Redis/Docker/background jobs | Claude Code |
| Feb 2026 | 2.1 | Auth moved fully to Supabase client on frontend; backend auth endpoints removed | Claude Code |

## Implementation Progress

### ✅ Completed
- [x] PRD updated for MVP approach
- [x] Tech stack simplified (Supabase + Express)
- [x] Database schema designed (PostgreSQL + RLS)
- [x] Authentication strategy defined (Supabase Auth)
- [x] API endpoints documented
- [x] Backend project initialization (Express + TypeScript scaffold)
- [x] Environment setup (env validation + .env.example)
- [x] Supabase client integration (server-side)
- [x] Auth middleware implementation (JWT verification)
- [x] Base server setup (/api/v1 router, health check, error handler)
- [x] Route modules wired with MVP + P1 stubs

### 🚧 In Progress
- [ ] Supabase project creation
 - [ ] Confirm Supabase RLS policies for profiles, listings, favorites

### 📋 Pending (MVP)
- [ ] Database table creation in Supabase
- [ ] API route handlers (listings, vehicles, favorites, AI)
- [ ] NZTA API integration
- [ ] OpenAI API integration
- [ ] Image upload handling (Supabase Storage)
- [ ] Input validation with Zod
- [ ] Logging setup with Winston
- [ ] Manual API testing

### 🔮 Future Enhancements (Post-MVP)
- [ ] Redis caching
- [ ] Comprehensive rate limiting
- [ ] Background jobs (price alerts, cache cleanup)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring & error tracking (Sentry)
- [ ] Automated testing (unit + integration)
- [ ] Load testing
- [ ] Messages feature (P1)

---

## MVP Quick Reference

**Current Phase:** Planning & Setup
**Approach:** Lean MVP - Simple & Productive
**Deployment:** Local development only (no Docker)

**Key Decisions:**
- ✅ **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- ✅ **Frontend handles auth directly** via Supabase client SDK (no backend auth endpoints)
- ✅ **No Redis caching** (use database queries directly)
- ✅ **No rate limiting** (rely on Supabase built-in limits)
- ✅ **No background jobs** (manual triggers for now)
- ✅ **No Docker/CI/CD** (run Express locally with `pnpm dev`)
- ✅ **Manual testing** (Postman/Thunder Client)

**Next Steps:**
1. Create Supabase project
2. Set up Express TypeScript project structure
3. Implement auth middleware (JWT verification only)
4. Create database tables + RLS policies in Supabase
5. Build core API endpoints (listings, vehicles, favorites, AI)

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for the KiwiCar backend API server — a Node.js/TypeScript Express application that provides RESTful APIs for the KiwiCar used car marketplace platform.

### 1.2 Scope

This PRD covers:
- RESTful API design and endpoints
- Authentication via Supabase Auth
- Data models and database schema (Supabase PostgreSQL)
- External service integrations (NZTA, AI)
- File storage and image handling (Supabase Storage)
- Security requirements

### 1.3 Out of Scope (MVP)

- Frontend implementation (see `/docs/prd/frontend/prd.md`)
- Landing page (see `/docs/prd/landing/prd.md`)
- Admin dashboard APIs (future phase)
- Mobile push notifications (future phase)
- Redis caching and performance optimization (future phase)
- Background jobs and scheduled tasks (future phase)
- Comprehensive rate limiting (future phase)
- Docker containerization (future phase)
- CI/CD pipeline (future phase)
- Production deployment (future phase)

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime environment |
| TypeScript | 5.0+ | Type safety |
| Express.js | 4.x | Web framework |
| Supabase | Latest | Database (PostgreSQL) & Auth |
| @supabase/supabase-js | Latest | Supabase client SDK |
| Multer | - | File upload handling |
| Winston | - | Logging |
| Zod | - | Request validation |

### 2.1 Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |
| Vitest | Unit testing |
| Supertest | API integration testing |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Express.js Application                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Middleware                           │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │   │
│  │  │ CORS   │ │ Auth   │ │ Logger │ │ Error  │            │   │
│  │  │        │ │ Supabase│ │        │ │ Handler│            │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       Routes                              │   │
│  │  /users  /listings  /vehicles  /favorites  /ai           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Services                             │   │
│  │  AuthService  ListingService  VehicleService  AIService  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Supabase Client                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                   ┌──────────────────────┐
                   │      Supabase        │
                   │  ┌────────────────┐  │
                   │  │   PostgreSQL   │  │
                   │  │    Database    │  │
                   │  └────────────────┘  │
                   │  ┌────────────────┐  │
                   │  │      Auth      │  │
                   │  └────────────────┘  │
                   │  ┌────────────────┐  │
                   │  │    Storage     │  │
                   │  └────────────────┘  │
                   └──────────────────────┘
```

---

## 4. API Design

### 4.1 Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:3001/api/v1` |
| Staging | `https://api.staging.kiwicar.co.nz/api/v1` |
| Production | `https://api.kiwicar.co.nz/api/v1` |

### 4.2 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 4.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 5. API Endpoints

### 5.1 Authentication

**Note:** Authentication is handled by Supabase Auth. The frontend uses the Supabase client SDK directly for auth operations (sign up, sign in, password reset). **No backend `/auth` endpoints are required for MVP.** The backend API only verifies Supabase JWT tokens for protected routes.

**Supabase Auth Features Used:**
- Email/password authentication
- Email verification
- Password reset
- JWT token management
- Session handling

**Backend Middleware (JWT verification only):**
The Express app will have an auth middleware that:
1. Extracts JWT token from `Authorization: Bearer <token>` header
2. Verifies token with Supabase using `supabase.auth.getUser(token)`
3. Attaches user info to `req.user` for protected routes

**Protected Routes:**
All routes requiring authentication will use the auth middleware:
- `GET /users/me`
- `PUT /users/me`
- `POST /listings`
- `PUT /listings/:id`
- `DELETE /listings/:id`
- `GET /favorites`
- `POST /favorites`
- `GET /messages/conversations` (P1)
- `GET /messages/conversations/:id` (P1)
- etc.

---

### 5.2 Users

**MVP Note:** User profile reads/writes happen directly via Supabase from the frontend (RLS-enforced `profiles` table). Backend `/users/*` endpoints are optional and can be deferred to post‑MVP.

#### GET /users/me (Optional, Post‑MVP)

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": "+64211234567",
    "nickname": "JohnDoe",
    "avatar": "https://...",
    "region": "Auckland",
    "showPhone": true,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### PUT /users/me (Optional, Post‑MVP)

Update current user profile.

**Request Body:**
```json
{
  "nickname": "NewNickname",
  "region": "Wellington",
  "showPhone": false
}
```

---

#### PUT /users/me/password (Not needed; handled by Supabase Auth)

Change password.

**Request Body:**
```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

---

#### POST /users/me/avatar (Optional, Post‑MVP)

Upload avatar image.

**Request:** `multipart/form-data` with `avatar` file field

---

#### DELETE /users/me (Optional, Post‑MVP)

Request account deletion.

---

### 5.3 Listings

#### GET /listings

Get paginated listings with filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |
| search | string | Keyword search |
| make | string | Car make (comma-separated for multiple) |
| model | string | Car model |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| minYear | number | Minimum year |
| maxYear | number | Maximum year |
| minMileage | number | Minimum mileage |
| maxMileage | number | Maximum mileage |
| region | string | NZ region |
| fuelType | string | petrol, diesel, hybrid, electric |
| transmission | string | auto, manual |
| bodyType | string | sedan, suv, hatchback, etc. |
| sort | string | price_asc, price_desc, newest, mileage_asc |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "2018 Toyota Corolla GX",
      "price": 18500,
      "year": 2018,
      "mileage": 65000,
      "region": "Auckland",
      "coverImage": "https://...",
      "createdAt": "2024-01-10T10:00:00Z",
      "isFavorited": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

#### GET /listings/:id

Get listing details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plateNumber": "ABC123",
    "make": "Toyota",
    "model": "Corolla",
    "variant": "GX",
    "year": 2018,
    "mileage": 65000,
    "price": 18500,
    "priceNegotiable": true,
    "description": "...",
    "aiDescription": "...",
    "aiPriceMin": 16000,
    "aiPriceMax": 20000,
    "aiPriceRecommended": 18000,
    "fuelType": "petrol",
    "transmission": "auto",
    "bodyType": "sedan",
    "color": "silver",
    "engineCC": 1800,
    "region": "Auckland",
    "status": "active",
    "wofExpiry": "2024-06-15",
    "regoExpiry": "2024-09-20",
    "images": [
      { "id": "uuid", "url": "https://...", "order": 1 }
    ],
    "seller": {
      "id": "uuid",
      "nickname": "JohnDoe",
      "avatar": "https://...",
      "phone": "+64211234567",  // null if hidden
      "memberSince": "2023-06-01"
    },
    "viewCount": 245,
    "favoriteCount": 12,
    "isFavorited": true,
    "priceHistory": [
      { "price": 19500, "changedAt": "2024-01-05" },
      { "price": 18500, "changedAt": "2024-01-15" }
    ],
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

#### POST /listings

Create a new listing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plateNumber": "ABC123",
  "make": "Toyota",
  "model": "Corolla",
  "variant": "GX",
  "year": 2018,
  "mileage": 65000,
  "price": 18500,
  "priceNegotiable": true,
  "description": "...",
  "fuelType": "petrol",
  "transmission": "auto",
  "bodyType": "sedan",
  "color": "silver",
  "engineCC": 1800,
  "region": "Auckland",
  "imageIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "active",
    ...
  }
}
```

---

#### PUT /listings/:id

Update a listing.

**Headers:** `Authorization: Bearer <token>`

**Business Rules:**
- Only owner can update
- Price change triggers price alert notifications

---

#### DELETE /listings/:id

Delete a listing.

**Headers:** `Authorization: Bearer <token>`

---

#### PUT /listings/:id/status

Update listing status.

**Request Body:**
```json
{
  "status": "sold"  // active, sold, removed
}
```

---

#### POST /listings/:id/view

Record a view (for analytics).

---

### 5.4 Images

#### POST /images/upload

Upload images for listing.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data` with `images` field (max 10 files)

**Response (201):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "url": "https://..." }
  ]
}
```

**Business Rules:**
- Max 10 images per request
- Max 5MB per image
- Server-side compression to max 2MB
- Supported formats: JPEG, PNG, WebP

---

### 5.5 Vehicles (Plate Lookup)

#### GET /vehicles/:plateNumber

Get vehicle information by plate number.

**Headers:** `Authorization: Bearer <token>` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plateNumber": "ABC123",
    "make": "Toyota",
    "model": "Corolla",
    "variant": "GX",
    "year": 2018,
    "firstRegistered": "2018-01-15",
    "wofStatus": "valid",
    "wofExpiry": "2024-06-15",
    "regoStatus": "valid",
    "regoExpiry": "2024-09-20",
    "odometerReadings": [
      { "reading": 65000, "date": "2023-10-15" },
      { "reading": 58000, "date": "2022-10-10" }
    ],
    "engineCC": 1800,
    "fuelType": "petrol",
    "bodyStyle": "sedan",
    "color": "silver",
    "cached": true,
    "cachedAt": "2024-01-20T10:00:00Z"
  },
  "meta": {
    "queriesRemaining": 9,
    "dailyLimit": 10
  }
}
```

**Rate Limits:**
| User Type | Daily Limit |
|-----------|-------------|
| Guest | 3 |
| Logged In | 10 |

---

### 5.6 Favorites

#### GET /favorites

Get user's favorited listings.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "listingId": "uuid",
      "listing": { ... },
      "priceAlert": true,
      "targetPrice": 15000,
      "priceChanged": true,
      "originalPrice": 18500,
      "currentPrice": 17000,
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ]
}
```

---

#### POST /favorites

Add listing to favorites.

**Request Body:**
```json
{
  "listingId": "uuid",
  "priceAlert": true,
  "targetPrice": 15000  // optional
}
```

---

#### PUT /favorites/:id

Update favorite settings.

**Request Body:**
```json
{
  "priceAlert": false,
  "targetPrice": null
}
```

---

#### DELETE /favorites/:id

Remove from favorites.

---

### 5.7 AI Services

#### POST /ai/generate-description

Generate AI description for listing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": 2018,
  "mileage": 65000,
  "fuelType": "petrol",
  "transmission": "auto",
  "color": "silver",
  "imageUrls": ["https://..."],
  "language": "en"  // or "zh"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "description": "Well-maintained 2018 Toyota Corolla GX with...",
    "highlights": [
      "Low mileage for age",
      "Full service history",
      "Reliable and economical"
    ]
  }
}
```

---

#### GET /ai/pricing

Get AI pricing suggestion.

**Query Parameters:**
- make, model, year, mileage, region (all required)
- fuelType, transmission, bodyType (optional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "minPrice": 16000,
    "recommendedPrice": 18000,
    "maxPrice": 20000,
    "confidence": 0.85,
    "comparables": 45,
    "marketTrend": "stable",
    "factors": [
      { "factor": "Low mileage", "impact": "+$1,500" },
      { "factor": "High demand model", "impact": "+$500" }
    ]
  }
}
```

---

### 5.8 Messages (P1)

#### GET /messages/conversations

Get all conversations.

---

#### GET /messages/conversations/:id

Get messages in a conversation.

---

#### POST /messages/conversations

Start new conversation.

**Request Body:**
```json
{
  "listingId": "uuid",
  "message": "Hi, is this car still available?"
}
```

---

#### POST /messages/conversations/:id/messages

Send message in conversation.

---

---

## 6. Data Models

### 6.1 Database Schema (Supabase PostgreSQL)

**Note:** User authentication is handled by Supabase Auth (`auth.users` table). We create a `profiles` table linked to Supabase auth users.

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  nickname TEXT NOT NULL,
  avatar TEXT,
  region TEXT NOT NULL DEFAULT 'Auckland',
  show_phone_on_listings BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  plate_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT false,
  description TEXT NOT NULL,
  ai_description TEXT,
  ai_price_min DECIMAL(10, 2),
  ai_price_max DECIMAL(10, 2),
  ai_price_rec DECIMAL(10, 2),

  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  transmission TEXT NOT NULL CHECK (transmission IN ('auto', 'manual')),
  body_type TEXT,
  color TEXT,
  engine_cc INTEGER,
  region TEXT NOT NULL,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  wof_expiry DATE,
  rego_expiry DATE,

  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_listings_status_created ON listings(status, created_at);
CREATE INDEX idx_listings_make_model ON listings(make, model);
CREATE INDEX idx_listings_region ON listings(region);
CREATE INDEX idx_listings_price ON listings(price);

-- Listing images table
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history table
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price_alert BOOLEAN DEFAULT false,
  target_price DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Vehicle cache table
CREATE TABLE vehicle_cache (
  plate_number TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  year INTEGER NOT NULL,
  first_registered DATE,
  wof_status TEXT NOT NULL,
  wof_expiry DATE,
  rego_status TEXT NOT NULL,
  rego_expiry DATE,
  odometer_readings JSONB,
  engine_cc INTEGER,
  fuel_type TEXT,
  body_style TEXT,
  color TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicle_cache_fetched ON vehicle_cache(fetched_at);

-- Messages table (P1 feature)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_receiver_unread ON messages(receiver_id, is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (examples)
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read active listings
CREATE POLICY "Anyone can read active listings" ON listings
  FOR SELECT USING (status = 'active');

-- Users can create their own listings
CREATE POLICY "Users can create own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);
```

---

## 7. External Integrations

### 7.1 NZTA Vehicle API

| Item | Details |
|------|---------|
| Purpose | Fetch official vehicle information |
| Data | WOF, Rego, odometer, vehicle specs |
| Caching | 24 hours in VehicleCache table |
| Fallback | Return cached data if API unavailable |

### 7.2 OpenAI API

| Endpoint | Purpose |
|----------|---------|
| Chat Completions | Generate listing descriptions |
| Vision | Analyze car images (future) |

### 7.3 Supabase Storage

| Bucket | Content |
|--------|---------|
| kiwicar-images | Listing images |
| kiwicar-avatars | User avatars |

**Image Processing:**
- Resize to max 1920px width
- Compress to max 2MB
- Generate thumbnail (400px)
- Convert to WebP format

**Note:** Email/SMS services are handled by Supabase Auth (email verification, password reset, etc.)

---

## 8. Security Requirements

### 8.1 Authentication

| Requirement | Implementation |
|-------------|----------------|
| Password Hashing | Handled by Supabase Auth (bcrypt) |
| JWT Access Token | Supabase JWT, verified on each request |
| Refresh Token | Managed by Supabase Auth |
| Token Verification | `supabase.auth.getUser(token)` |

### 8.2 Rate Limiting (Future Enhancement)

For MVP, rely on Supabase's built-in rate limiting. Future implementation:

| Endpoint | Limit |
|----------|-------|
| GET /vehicles/:plate | 3/day (guest), 10/day (user) |
| POST /ai/* | 20/hour per user |
| General API | 100/minute per user |

### 8.3 Input Validation

- All inputs validated with Zod schemas
- SQL injection prevention via Supabase client parameterized queries
- XSS prevention via output encoding
- File upload validation (type, size)

### 8.4 Data Protection

| Data | Protection |
|------|------------|
| Passwords | Handled by Supabase Auth |
| Phone/Email | Masked in public responses |
| JWT secrets | Managed by Supabase |
| Database | Encrypted at rest, TLS in transit (Supabase) |
| Row Level Security | Enabled on all tables |

### 8.5 CORS Configuration

```typescript
{
  origin: [
    'http://localhost:5173',  // Frontend dev
    'http://localhost:3000',  // Landing page dev
    'https://kiwicar.co.nz',
    'https://www.kiwicar.co.nz'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}
```

---

## 9. Background Jobs (Future Enhancement)

**Note:** For MVP, background jobs are not implemented. Future enhancements can include:
- Price alert checking (every 15 minutes)
- Vehicle cache cleanup (daily)
- Stale listing reminders (daily)
- Analytics aggregation (daily)

---

## 10. Logging & Monitoring

### 10.1 Logging (Winston)

| Level | Usage |
|-------|-------|
| error | Exceptions, failed operations |
| warn | Deprecations, issues |
| info | API requests, important events |
| debug | Detailed debugging (dev only) |

**Log Format:**
```json
{
  "timestamp": "2024-01-20T10:00:00Z",
  "level": "info",
  "message": "Listing created",
  "requestId": "uuid",
  "userId": "uuid",
  "listingId": "uuid",
  "duration": 145
}
```

### 10.2 Health Check

**GET /health**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "supabase": "connected"
}
```

### 10.3 Monitoring (Future Enhancement)

For MVP, use basic console logging. Future enhancements:
- Error tracking (Sentry)
- Application metrics (request count, latency, error rate)
- Database query performance

---

## 11. Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# External APIs
NZTA_API_KEY=
NZTA_API_URL=

OPENAI_API_KEY=

# CORS
FRONTEND_URL=http://localhost:5173
LANDING_URL=http://localhost:3000
```

---

## 12. Deployment

### 12.1 Local Development (MVP)

For MVP, run the Express server locally:

```bash
cd kiwicar-backend
pnpm install
pnpm dev  # Start dev server with hot reload
```

**Prerequisites:**
- Node.js 20 LTS
- pnpm
- Supabase project created

### 12.2 Production Deployment (Future)

When ready to deploy to production:

| Component | Service Options |
|-----------|----------------|
| API Server | Railway / Render / Vercel |
| Database | Supabase (included) |
| Storage | Supabase Storage (included) |

### 12.3 Database Migrations

- Use Supabase migrations (SQL files)
- Apply migrations via Supabase CLI or Dashboard
- Track migrations in version control

---

## 13. Performance Requirements (Future)

For MVP, focus on functionality over performance. Future targets:

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 500ms |
| Database Query Time (avg) | < 100ms |
| Concurrent Users | 100+ |

---

## 14. Testing Requirements

### 14.1 Unit Tests (MVP)

- Critical service layer functions
- Validation schemas
- Utility functions

### 14.2 Integration Tests (Future)

- API endpoint responses
- Database operations
- External service mocks

### 14.3 Manual Testing (MVP)

- Test all API endpoints with Postman/Thunder Client
- Verify auth flow works correctly
- Test file uploads

---

## 15. MVP Simplifications Summary

This MVP version simplifies the original PRD:

1. **Authentication**: Use Supabase Auth instead of custom JWT/bcrypt implementation
2. **Database**: PostgreSQL via Supabase instead of MySQL with Prisma
3. **Caching**: No Redis caching (future enhancement)
4. **Rate Limiting**: Rely on Supabase built-in limits (future enhancement)
5. **Background Jobs**: No scheduled jobs (future enhancement)
6. **Email/SMS**: Handled by Supabase Auth
7. **Deployment**: Local development only, no Docker/CI/CD
8. **Monitoring**: Basic console logging instead of Sentry
9. **Testing**: Manual testing focus instead of comprehensive test suite

This allows rapid development of core features while maintaining ability to scale later.

---

*Document End*
