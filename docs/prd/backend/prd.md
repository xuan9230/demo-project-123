# KiwiCar Backend API PRD

**Document Version:** 1.0
**Created:** January 2024
**Status:** Draft
**Product:** KiwiCar Backend API Server

---

## 1. Overview

### 1.1 Purpose

This document defines the requirements for the KiwiCar backend API server — a Node.js/TypeScript Express application that provides RESTful APIs for the KiwiCar used car marketplace platform.

### 1.2 Scope

This PRD covers:
- RESTful API design and endpoints
- Authentication and authorization
- Data models and database schema
- External service integrations (NZTA, AI, Email/SMS)
- File storage and image handling
- Caching strategy
- Security requirements

### 1.3 Out of Scope

- Frontend implementation (see `/docs/prd/frontend/prd.md`)
- Landing page (see `/docs/prd/landing/prd.md`)
- Admin dashboard APIs (future phase)
- Mobile push notifications (future phase)

---

## 2. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20 LTS | Runtime environment |
| TypeScript | 5.0+ | Type safety |
| Express.js | 4.x | Web framework |
| Prisma | Latest | ORM |
| MySQL | 8.0+ | Primary database |
| Redis | 7+ | Caching, sessions, rate limiting |
| JWT | - | Authentication tokens |
| bcrypt | - | Password hashing |
| Multer | - | File upload handling |
| Winston | - | Logging |
| node-cron | - | Scheduled tasks |
| Zod | - | Request validation |

### 2.1 Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | Code linting |
| Prettier | Code formatting |
| Vitest | Unit testing |
| Supertest | API integration testing |
| Docker | Containerization |
| Docker Compose | Local development environment |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Express.js Application                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Middleware                           │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │   │
│  │  │ CORS   │ │ Auth   │ │ Rate   │ │ Logger │ │ Error  │  │   │
│  │  │        │ │ JWT    │ │ Limit  │ │        │ │ Handler│  │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                       Routes                              │   │
│  │  /auth  /users  /listings  /vehicles  /favorites  /ai    │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Services                             │   │
│  │  AuthService  ListingService  VehicleService  AIService  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Prisma ORM                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐        ┌──────────┐        ┌──────────┐
   │  MySQL   │        │  Redis   │        │ S3 / R2  │
   │ Database │        │  Cache   │        │ Storage  │
   └──────────┘        └──────────┘        └──────────┘
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

#### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",  // required if no phone
  "phone": "+64211234567",      // required if no email
  "password": "securePass123",
  "nickname": "JohnDoe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "message": "Verification code sent"
  }
}
```

**Business Rules:**
- Either email or phone required
- Password: min 8 chars, must contain letter and number
- Phone must be valid NZ format (+64)
- Duplicate email/phone returns 409

---

#### POST /auth/verify

Verify email or phone with OTP.

**Request Body:**
```json
{
  "email": "user@example.com",  // or phone
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": { ... }
  }
}
```

---

#### POST /auth/login

Login with credentials.

**Request Body:**
```json
{
  "email": "user@example.com",  // or phone
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "JohnDoe",
      "avatar": "url",
      "region": "Auckland"
    }
  }
}
```

---

#### POST /auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

#### POST /auth/logout

Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

#### POST /auth/forgot-password

Request password reset.

**Request Body:**
```json
{
  "email": "user@example.com"  // or phone
}
```

---

#### POST /auth/reset-password

Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newSecurePass123"
}
```

---

### 5.2 Users

#### GET /users/me

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

#### PUT /users/me

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

#### PUT /users/me/password

Change password.

**Request Body:**
```json
{
  "currentPassword": "oldPass123",
  "newPassword": "newPass456"
}
```

---

#### POST /users/me/avatar

Upload avatar image.

**Request:** `multipart/form-data` with `avatar` file field

---

#### DELETE /users/me

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

### 6.1 Prisma Schema

```prisma
model User {
  id            String    @id @default(uuid())
  email         String?   @unique
  phone         String?   @unique
  passwordHash  String
  nickname      String
  avatar        String?
  region        String?
  showPhone     Boolean   @default(true)
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  listings      Listing[]
  favorites     Favorite[]
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
}

model Listing {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  plateNumber     String
  make            String
  model           String
  variant         String?
  year            Int
  mileage         Int
  price           Decimal   @db.Decimal(10, 2)
  priceNegotiable Boolean   @default(false)
  description     String    @db.Text
  aiDescription   String?   @db.Text
  aiPriceMin      Decimal?  @db.Decimal(10, 2)
  aiPriceMax      Decimal?  @db.Decimal(10, 2)
  aiPriceRec      Decimal?  @db.Decimal(10, 2)

  fuelType        FuelType
  transmission    Transmission
  bodyType        String?
  color           String?
  engineCC        Int?
  region          String

  status          ListingStatus @default(ACTIVE)
  wofExpiry       DateTime?
  regoExpiry      DateTime?

  viewCount       Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  images          ListingImage[]
  priceHistory    PriceHistory[]
  favorites       Favorite[]

  @@index([status, createdAt])
  @@index([make, model])
  @@index([region])
  @@index([price])
}

model ListingImage {
  id        String   @id @default(uuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  url       String
  order     Int
  createdAt DateTime @default(now())
}

model PriceHistory {
  id        String   @id @default(uuid())
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  price     Decimal  @db.Decimal(10, 2)
  changedAt DateTime @default(now())
}

model Favorite {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  listingId   String
  listing     Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  priceAlert  Boolean  @default(false)
  targetPrice Decimal? @db.Decimal(10, 2)
  createdAt   DateTime @default(now())

  @@unique([userId, listingId])
}

model VehicleCache {
  plateNumber      String   @id
  make             String
  model            String
  variant          String?
  year             Int
  firstRegistered  DateTime?
  wofStatus        String
  wofExpiry        DateTime?
  regoStatus       String
  regoExpiry       DateTime?
  odometerReadings Json
  engineCC         Int?
  fuelType         String?
  bodyStyle        String?
  color            String?
  fetchedAt        DateTime @default(now())

  @@index([fetchedAt])
}

model Message {
  id           String   @id @default(uuid())
  senderId     String
  sender       User     @relation("SentMessages", fields: [senderId], references: [id])
  receiverId   String
  receiver     User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
  listingId    String?
  content      String   @db.Text
  isRead       Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([senderId, receiverId])
  @@index([receiverId, isRead])
}

model VerificationCode {
  id        String   @id @default(uuid())
  target    String   // email or phone
  code      String
  type      VerificationType
  expiresAt DateTime
  attempts  Int      @default(0)
  createdAt DateTime @default(now())

  @@index([target, type])
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  ELECTRIC
}

enum Transmission {
  AUTO
  MANUAL
}

enum ListingStatus {
  ACTIVE
  SOLD
  REMOVED
}

enum VerificationType {
  REGISTRATION
  LOGIN
  PASSWORD_RESET
}
```

---

## 7. External Integrations

### 7.1 NZTA Vehicle API

| Item | Details |
|------|---------|
| Purpose | Fetch official vehicle information |
| Data | WOF, Rego, odometer, vehicle specs |
| Caching | 24 hours in Redis + VehicleCache table |
| Fallback | Return cached data if API unavailable |

### 7.2 Email Service (SendGrid/Mailgun)

| Template | Trigger |
|----------|---------|
| Verification Code | Registration, login OTP |
| Password Reset | Forgot password request |
| Price Drop Alert | Favorited listing price reduced |
| Welcome Email | Successful registration |

### 7.3 SMS Service (Twilio/AWS SNS)

| Template | Trigger |
|----------|---------|
| OTP Code | Phone registration, login |
| Password Reset OTP | Phone-based reset |

### 7.4 OpenAI API

| Endpoint | Purpose |
|----------|---------|
| Chat Completions | Generate listing descriptions |
| Vision | Analyze car images (P1) |

### 7.5 Cloud Storage (S3/R2)

| Bucket | Content |
|--------|---------|
| kiwicar-images | Listing images |
| kiwicar-avatars | User avatars |

**Image Processing:**
- Resize to max 1920px width
- Compress to max 2MB
- Generate thumbnail (400px)
- Convert to WebP format

---

## 8. Security Requirements

### 8.1 Authentication

| Requirement | Implementation |
|-------------|----------------|
| Password Hashing | bcrypt with cost factor 12 |
| JWT Access Token | 1 hour expiry, RS256 |
| Refresh Token | 30 days expiry, stored in DB |
| Token Refresh | Silent refresh before expiry |

### 8.2 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 5/minute per IP |
| POST /auth/register | 3/minute per IP |
| POST /auth/verify | 5/minute per target |
| GET /vehicles/:plate | 3/day (guest), 10/day (user) |
| POST /ai/* | 20/hour per user |
| General API | 100/minute per user |

### 8.3 Input Validation

- All inputs validated with Zod schemas
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via output encoding
- File upload validation (type, size)

### 8.4 Data Protection

| Data | Protection |
|------|------------|
| Passwords | bcrypt hash, never stored plain |
| Phone/Email | Masked in public responses |
| JWT secrets | Environment variables, rotated quarterly |
| Database | Encrypted at rest, TLS in transit |

### 8.5 CORS Configuration

```typescript
{
  origin: [
    'https://kiwicar.co.nz',
    'https://www.kiwicar.co.nz',
    'https://staging.kiwicar.co.nz'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}
```

---

## 9. Caching Strategy

### 9.1 Redis Cache Keys

| Key Pattern | TTL | Data |
|-------------|-----|------|
| `vehicle:{plate}` | 24h | NZTA vehicle data |
| `listing:{id}` | 5m | Listing details |
| `listings:search:{hash}` | 2m | Search results |
| `user:{id}:favorites` | 10m | User favorites list |
| `ratelimit:{ip}:{endpoint}` | varies | Rate limit counters |

### 9.2 Cache Invalidation

| Event | Invalidate |
|-------|------------|
| Listing updated | `listing:{id}`, `listings:search:*` |
| Listing deleted | `listing:{id}`, `listings:search:*` |
| Favorite added/removed | `user:{id}:favorites` |

---

## 10. Background Jobs

### 10.1 Scheduled Jobs (node-cron)

| Job | Schedule | Task |
|-----|----------|------|
| Price Alert Check | Every 15 min | Check price changes, send alerts |
| Vehicle Cache Cleanup | Daily 3am | Remove cache older than 24h |
| Stale Listing Reminder | Daily 9am | Remind sellers of 30-day old listings |
| Analytics Aggregation | Daily 2am | Aggregate daily view/favorite counts |

### 10.2 Event-Driven Jobs

| Trigger | Job |
|---------|-----|
| Listing price updated | Send price alerts to subscribers |
| User registered | Send welcome email |
| Listing created | Generate AI pricing suggestion |

---

## 11. Logging & Monitoring

### 11.1 Logging (Winston)

| Level | Usage |
|-------|-------|
| error | Exceptions, failed operations |
| warn | Deprecations, rate limits hit |
| info | API requests, auth events |
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

### 11.2 Health Check

**GET /health**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}
```

### 11.3 Monitoring Integration

- Sentry for error tracking
- Application metrics (request count, latency, error rate)
- Database query performance

---

## 12. Environment Variables

```env
# Server
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL=mysql://user:pass@host:3306/kiwicar

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

# External APIs
NZTA_API_KEY=
NZTA_API_URL=

OPENAI_API_KEY=

SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@kiwicar.co.nz

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=kiwicar-images

# Monitoring
SENTRY_DSN=
```

---

## 13. Deployment

### 13.1 Infrastructure

| Component | Service |
|-----------|---------|
| API Server | AWS ECS / Railway / Render |
| Database | AWS RDS MySQL / PlanetScale |
| Redis | AWS ElastiCache / Upstash |
| Storage | AWS S3 / Cloudflare R2 |
| CDN | CloudFront / Cloudflare |

### 13.2 CI/CD Pipeline

```yaml
# GitHub Actions workflow
on:
  push:
    branches: [main]

jobs:
  test:
    - Run linting
    - Run unit tests
    - Run integration tests

  build:
    - Build Docker image
    - Push to container registry

  deploy:
    - Deploy to staging (on PR merge)
    - Deploy to production (on release tag)
```

### 13.3 Database Migrations

- Use Prisma Migrate for schema changes
- Run migrations in CI before deployment
- Maintain backward compatibility during rollout

---

## 14. Performance Requirements

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| API Response Time (p99) | < 500ms |
| Database Query Time (avg) | < 50ms |
| Concurrent Users | 1000+ |
| Uptime | 99.9% |

---

## 15. Testing Requirements

### 15.1 Unit Tests

- Service layer functions
- Utility functions
- Validation schemas

### 15.2 Integration Tests

- API endpoint responses
- Database operations
- External service mocks

### 15.3 Load Tests

- Simulate 1000 concurrent users
- Test search endpoint under load
- Verify rate limiting works correctly

---

*Document End*
