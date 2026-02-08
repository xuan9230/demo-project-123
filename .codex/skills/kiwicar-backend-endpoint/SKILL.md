---
name: kiwicar-backend-endpoint
description: Add or update REST API endpoints in the kiwicar-backend Express service. Use when creating new routes or routers under /api/v1, wiring Supabase queries, applying auth middleware, validating requests with Zod, or aligning response/error handling with existing backend conventions.
---

# Kiwicar Backend Endpoint

## Overview

Add new API endpoints in `kiwicar-backend` that follow the existing Express + Supabase patterns,
including request validation, auth middleware, and consistent response shapes.

## Endpoint Workflow

1. **Pick the route location**
   - Check existing routers in `src/routes/` and the mounts in `src/routes/index.ts`.
   - If a new router is needed, create `src/routes/<name>.ts` and mount it in `apiRouter`.
   - Reference: `references/routing-map.md`.

2. **Define request validation**
   - Use `zod` schemas and `parseOr400` for bodies or queries.
   - Normalize query params when needed.
   - Reference: `references/validation-and-responses.md`.

3. **Apply auth middleware**
   - Use `requireAuth` for protected endpoints, `optionalAuth` when auth is optional.
   - Switch handler type to `AuthenticatedRequest` when you need `req.user` or `req.accessToken`.
   - Reference: `references/supabase-and-auth.md`.

4. **Implement Supabase operations**
   - Use `supabase` for public data or `getSupabaseClient(req.accessToken)` for user-scoped data.
   - Handle Supabase errors with `errorResponse("DB_ERROR", error.message)` and a 500 status.

5. **Return consistent responses**
   - `successResponse(data, meta?)` for success payloads.
   - `errorResponse(code, message, details?)` for errors.
   - Reference: `references/validation-and-responses.md`.

## Implementation Checklist

- Keep route handlers async and return early on validation/auth errors.
- Use existing utilities: `parseOr400`, `successResponse`, `errorResponse`, `getPagination`.
- Follow status codes used in nearby endpoints (200, 201, 204, 400, 401, 404, 500, 501).
- Update `src/routes/index.ts` when adding a new router.

## References

- `references/routing-map.md` for route mounts and file layout.
- `references/validation-and-responses.md` for validation and response conventions.
- `references/supabase-and-auth.md` for auth + Supabase client usage.
