# Codex Project Start

This file is the starting point for AI/coding agents working in this monorepo.

## Repository Areas

- `kiwicar-frontend`: Main web app (React + Vite).
- `kiwicar-backend`: API service (Express + TypeScript).
- `landing-page`: Public marketing/landing experience.
- `packages/trpc-types`: Shared type bridge package.
- `docs`: Product requirements, feature plans, and data schema docs.

## PRD Index (`docs/prd`)

| Area | Document | Purpose |
|---|---|---|
| Frontend | [`docs/prd/frontend/prd.md`](docs/prd/frontend/prd.md) | Core frontend product requirements and scope. |
| Frontend | [`docs/prd/frontend/implementation-status.md`](docs/prd/frontend/implementation-status.md) | Current implementation status and progress checklist. |
| Backend | [`docs/prd/backend/prd.md`](docs/prd/backend/prd.md) | Backend API requirements, MVP scope, and progress. |
| Backend Feature | [`docs/prd/backend/features/luxury-vehicle-ai-promotion-prd.md`](docs/prd/backend/features/luxury-vehicle-ai-promotion-prd.md) | Feature-specific PRD for AI promo copy on luxury vehicles. |
| Landing | [`docs/prd/landing/prd.md`](docs/prd/landing/prd.md) | Landing page goals, copy, and content structure. |
| Cross-Cutting Feature | [`docs/prd/features/trpc-migration.md`](docs/prd/features/trpc-migration.md) | Migration plan for tRPC integration and REST cutover. |

## Supporting Data/Schema Docs

- [`docs/supabase/mvp.sql`](docs/supabase/mvp.sql): Full MVP schema + RLS baseline.
- [`docs/supabase/profiles.sql`](docs/supabase/profiles.sql): Focused `profiles` table + policies.

## Suggested Read Order

1. Start with area PRD (`frontend/prd.md`, `backend/prd.md`, or `landing/prd.md`).
2. Check implementation/progress docs for current state.
3. Review feature-specific PRDs for scoped work.
4. Confirm schema/DB assumptions in `docs/supabase/*.sql`.

## Task Routing Guide

- UI/product behavior changes: start in `docs/prd/frontend/prd.md`.
- API or service changes: start in `docs/prd/backend/prd.md`.
- Feature-level backend AI work: check luxury-vehicle PRD first.
- API contract/type strategy work: check tRPC migration plan.
- Marketing page content/layout changes: start in landing PRD.
