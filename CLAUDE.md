# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KiwiCar is a New Zealand AI-powered used car marketplace with three components:
- **Landing Page** (`/landing-page/`) - Next.js 16 marketing site (implemented)
- **Frontend App** (`/kiwicar-frontend/`) - React SPA marketplace (planned)
- **Backend API** (`/kiwicar-backend/`) - Node.js Express server (planned)

PRDs for all components are in `/docs/prd/`.

## Commands

### Landing Page

```bash
cd landing-page
npm run dev      # Dev server with Turbopack
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Tech Stack

**Landing Page (current):**
- Next.js 16, React 19, Tailwind CSS 4, Framer Motion
- ESLint 9 (flat config), Prettier with Tailwind plugin

**Frontend (planned):** React 18+, TypeScript, Vite, Zustand, TanStack Query

**Backend (planned):** Node.js 20, TypeScript, Express, Prisma, MySQL, Redis

## Architecture

### Landing Page Structure

```
landing-page/
├── app/                    # Next.js App Router
│   └── (public-pages)/     # Route group for public pages
├── components/             # Reusable components (navbar, footer)
├── sections/               # Page sections (hero, features, faq, etc.)
└── public/                 # Static assets
```

Path alias: `@/` maps to project root (e.g., `@/components/navbar`)

### API Design (Backend)

- Base URL: `/api/v1`
- Response format: `{ success: boolean, data: ..., meta?: ... }`
- Auth: JWT access tokens (1h) + refresh tokens (30d)
- Rate limiting: Per-IP and per-user limits on sensitive endpoints

## Key Integrations

- **NZTA API**: Vehicle data lookup by plate number (cached 24h)
- **OpenAI**: AI-generated listing descriptions and pricing
- **SendGrid/Twilio**: Email and SMS for OTP verification
- **S3/R2**: Image storage with compression to max 2MB
