# tRPC Onboarding Guide (KiwiCar)

This guide explains tRPC from scratch using the exact KiwiCar migration you just made.

## 1. What tRPC is

`tRPC` lets your frontend call backend functions directly (typed), instead of hand-writing REST contracts and duplicate types.

In this project that means:
- Backend validates input with `zod`.
- Frontend gets those exact types automatically.
- You stop maintaining manual `ApiResponse` / mapping layers for most endpoints.

## 2. Why we migrated in KiwiCar

Before migration:
- Frontend used custom `fetch` wrappers and mock fallbacks.
- REST response envelopes required manual parsing and mapping.
- Type drift risk between frontend/backend.

After migration:
- Frontend calls `trpc.listings.list.useInfiniteQuery(...)` etc.
- Backend procedures are the source of truth for both runtime validation and TypeScript types.
- We keep only one REST endpoint: image upload (`/api/v1/images/upload`) for multipart support.

## 3. KiwiCar tRPC architecture

### Backend
- Context and procedure builders: `kiwicar-backend/src/trpc/trpc.ts`
- Router composition: `kiwicar-backend/src/trpc/router.ts`
- Domain routers:
  - `kiwicar-backend/src/trpc/routers/listings.ts`
  - `kiwicar-backend/src/trpc/routers/vehicles.ts`
  - `kiwicar-backend/src/trpc/routers/favorites.ts`
  - `kiwicar-backend/src/trpc/routers/luxury-vehicle.ts`
  - `kiwicar-backend/src/trpc/routers/users.ts` (stub)
  - `kiwicar-backend/src/trpc/routers/messages.ts` (stub)
  - `kiwicar-backend/src/trpc/routers/ai.ts` (stub)

`app.ts` mounts tRPC at `/trpc`:

```ts
app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }))
```

### Frontend
- tRPC React client: `kiwicar-frontend/src/lib/trpc.ts`
- Provider (tRPC + React Query): `kiwicar-frontend/src/providers/TrpcProvider.tsx`
- App bootstrapping: `kiwicar-frontend/src/main.tsx`

### Shared type bridge
- Workspace package: `packages/trpc-types`
- Exposes `AppRouter` type from backend:
  - `packages/trpc-types/src/index.ts`

Frontend imports router type only:

```ts
import type { AppRouter } from '@kiwicar/trpc-types'
```

## 4. Auth in tRPC (important)

Auth is no longer Express middleware for API routes.

In `createContext` (`trpc.ts`):
1. Read `Authorization: Bearer <token>`.
2. Validate with Supabase `auth.getUser(token)`.
3. Store `user`, `accessToken`, and scoped Supabase client on context.

Procedure levels:
- `publicProcedure`: no auth required.
- `optionalAuthProcedure`: can use user when present.
- `protectedProcedure`: throws `UNAUTHORIZED` if no user.

## 5. Real KiwiCar examples

## Example A: List listings with filters

Backend procedure:
- `listings.list` in `kiwicar-backend/src/trpc/routers/listings.ts`
- Uses Zod input schema, Supabase filters, sorting, pagination.

Frontend usage:
- `useListings` in `kiwicar-frontend/src/hooks/useListings.ts`
- Calls `trpc.listings.list.useInfiniteQuery(...)`

## Example B: Toggle favorite

Backend procedures:
- `favorites.add`
- `favorites.remove`

Frontend usage:
- `kiwicar-frontend/src/components/common/ListingCard.tsx`
- `kiwicar-frontend/src/pages/listing/ListingDetailPage.tsx`

Pattern used:
1. Call mutation.
2. Invalidate related queries (`favorites.list`, `listings.list`, `listings.getById`).
3. UI auto-refreshes from server state.

## Example C: Publish listing

Backend procedure:
- `listings.create`

Frontend usage:
- `kiwicar-frontend/src/pages/sell/steps/Step5Preview.tsx`

Flow:
1. Validate draft locally.
2. Call `trpc.listings.create.useMutation()`.
3. On success show confirmation + navigate.

## 6. Why image upload stays REST

File uploads use multipart/form-data, which is not the normal tRPC JSON flow.

KiwiCar keeps:
- `POST /api/v1/images/upload`
- File: `kiwicar-backend/src/routes/images.ts`
- Frontend call in: `kiwicar-frontend/src/pages/sell/steps/Step2Photos.tsx`

So the architecture is hybrid by design:
- Business/domain APIs => tRPC
- Multipart upload => REST

## 7. How to add a new tRPC endpoint in this project

1. Add procedure in the correct backend router under `kiwicar-backend/src/trpc/routers/`.
2. Define `.input(z.object(...))` schema.
3. Use `publicProcedure` / `optionalAuthProcedure` / `protectedProcedure`.
4. Throw `TRPCError` for failures (not manual REST envelopes).
5. Ensure router is composed in `kiwicar-backend/src/trpc/router.ts`.
6. Use it in frontend via `trpc.<router>.<procedure>.useQuery/useMutation`.
7. Invalidate dependent queries after successful mutations.

## 8. Error model differences vs REST

Old REST style:
- `res.status(...).json({ success: false, error: ... })`

tRPC style:
- Throw `new TRPCError({ code, message })`
- tRPC serializes standardized error responses.

This keeps backend handlers cleaner and consistent.

## 9. Key migration files to study first

If you are new and want the fastest learning path, read in this order:

1. `kiwicar-backend/src/trpc/trpc.ts`
2. `kiwicar-backend/src/trpc/routers/listings.ts`
3. `kiwicar-backend/src/trpc/router.ts`
4. `kiwicar-frontend/src/providers/TrpcProvider.tsx`
5. `kiwicar-frontend/src/hooks/useListings.ts`
6. `kiwicar-frontend/src/pages/listing/ListingDetailPage.tsx`
7. `kiwicar-frontend/src/pages/sell/steps/Step2Photos.tsx` (REST exception)

## 10. Practical mental model

Use this rule of thumb:
- If your endpoint is JSON request/response and part of app domain logic, use tRPC.
- If your endpoint is multipart streaming/upload, keep REST.

That is exactly how KiwiCar is now structured.
