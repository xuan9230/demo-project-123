# KiwiCar: tRPC Integration + Full Cutover Plan

## Context
The frontend (`kiwicar-frontend` — React 19 SPA on Vite) and backend (`kiwicar-backend` — Express 5) are loosely connected via hand-rolled REST calls with manual type mapping, mock fallbacks, and duplicated type definitions. Integrating tRPC gives end-to-end type safety: backend Zod schemas become the frontend's type source, eliminating mapping functions and response format guessing.

**User decisions:** Full cutover (REST routes removed entirely), stub endpoints re-stubbed in tRPC.
**Exception:** `POST /api/v1/images/upload` stays REST forever — Multer multipart is incompatible with tRPC.

---

## Architecture Overview

```
packages/trpc-types/          ← NEW: type bridge (type-only re-export)
  src/index.ts                   exports: type AppRouter

kiwicar-backend/src/
  trpc/
    trpc.ts                   ← NEW: initTRPC, createContext, publicProcedure, protectedProcedure
    router.ts                 ← NEW: root AppRouter (compose all sub-routers)
    routers/
      listings.ts             ← NEW: list, getById, myListings, create, update, delete, updateStatus, incrementView
      vehicles.ts             ← NEW: lookupByPlate (mutation)
      favorites.ts            ← NEW: list, add, update, remove
      luxury-vehicle.ts       ← NEW: list
      users.ts                ← NEW: stub (me, updateMe)
      messages.ts             ← NEW: stub (conversations, getConversation)
      ai.ts                   ← NEW: stub (generateDescription, pricing)
  app.ts                      ← MODIFIED: replace all REST routes with tRPC + keep /images/upload
  routes/                     ← DELETED: all files (listings, vehicles, favorites, luxury-vehicle, users, messages, ai)
  middleware/auth.ts          ← DELETED: replaced by tRPC context
  utils/response.ts           ← DELETED: replaced by tRPC return values
  utils/validation.ts         ← DELETED: replaced by tRPC .input() schemas

kiwicar-frontend/src/
  lib/trpc.ts                 ← NEW: createTRPCReact<AppRouter>()
  providers/TrpcProvider.tsx  ← NEW: tRPC + QueryClient provider
  hooks/useListings.ts        ← REWRITTEN: use trpc.* hooks
  hooks/usePlateCheck.ts      ← REWRITTEN: use trpc.vehicles.lookupByPlate
  lib/api.ts                  ← DELETED
  data/mock.ts                ← DELETED
  stores/favorites.ts         ← SIMPLIFIED: remove mock seed + persist
  types/index.ts              ← PRUNED: remove ApiResponse, ListingDetailApi, Favorite (inferred from tRPC)
  main.tsx                    ← MODIFIED: TrpcProvider replaces bare QueryClientProvider
```

---

## Step-by-Step Implementation

### Phase 0 — Workspace + Type Bridge

1. Create `/pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'kiwicar-backend'
     - 'kiwicar-frontend'
     - 'landing-page'
     - 'packages/*'
   ```

2. Create `packages/trpc-types/package.json`:
   ```json
   { "name": "@kiwicar/trpc-types", "version": "0.0.1", "private": true,
     "main": "./src/index.ts", "types": "./src/index.ts" }
   ```

3. Create `packages/trpc-types/src/index.ts`:
   ```ts
   export type { AppRouter } from '../../../kiwicar-backend/src/trpc/router'
   ```

4. Add to `kiwicar-backend/package.json` deps: `"@trpc/server": "^11.0.0"`
   Add to `kiwicar-frontend/package.json` deps: `"@kiwicar/trpc-types": "workspace:*"`, `"@trpc/client": "^11.0.0"`, `"@trpc/react-query": "^11.0.0"`

5. Add Vite alias in `kiwicar-frontend/vite.config.ts`:
   ```ts
   '@kiwicar/trpc-types': path.resolve(__dirname, '../packages/trpc-types/src/index.ts')
   ```

6. Run `pnpm install` from repo root.

---

### Phase 1 — Backend: tRPC Foundation

**`src/trpc/trpc.ts`** — Context + procedure builders:
- `createContext({ req, res })`: extract `Authorization: Bearer <token>`, call `supabase.auth.getUser(token)` — mirrors existing `requireAuth` middleware exactly
- Returns `{ user: User | null, accessToken: string | null, supabaseClient }`
- Export `publicProcedure`, `protectedProcedure` (throws `UNAUTHORIZED` if no user), `optionalAuthProcedure`

**`src/trpc/routers/listings.ts`** — Lift Zod schemas + Supabase queries verbatim from `src/routes/listings.ts`:
- `list` (optionalAuth query) — pagination, all filters, sort
- `getById` (optionalAuth query) — includes images, price history, seller info
- `myListings` (protected query) — filter by `ctx.user.id`
- `create` (protected mutation)
- `update` (protected mutation)
- `delete` (protected mutation)
- `updateStatus` (protected mutation)
- `incrementView` (public mutation)

Replace all `res.status(404).json(errorResponse(...))` patterns with `throw new TRPCError({ code: 'NOT_FOUND', message: '...' })`.
Remove `successResponse()` wrappers — tRPC serializes return values directly.
Reuse `getPagination()` from `src/utils/pagination.ts` (keep this file).

**`src/trpc/routers/vehicles.ts`** — `lookupByPlate` as a **mutation** (user-initiated, one-shot). Lift cache + NZTA logic from `src/routes/vehicles.ts`.

**`src/trpc/routers/favorites.ts`** — `list`, `add`, `update`, `remove`. Lift from `src/routes/favorites.ts`.

**`src/trpc/routers/luxury-vehicle.ts`** — `list` query. Lift from `src/routes/luxury-vehicle.ts`.

**Stubs** — `src/trpc/routers/users.ts`, `messages.ts`, `ai.ts`:
```ts
export const usersRouter = router({
  me: protectedProcedure.query(() => { throw new TRPCError({ code: 'METHOD_NOT_SUPPORTED', message: 'Not implemented' }) }),
  updateMe: protectedProcedure.input(z.object({}).passthrough()).mutation(() => { throw new TRPCError({ code: 'METHOD_NOT_SUPPORTED', message: 'Not implemented' }) }),
})
```

**`src/trpc/router.ts`**:
```ts
export const appRouter = router({ listings, vehicles, favorites, luxuryVehicle, users, messages, ai })
export type AppRouter = typeof appRouter
```

---

### Phase 2 — Backend: Cutover app.ts

Replace `src/app.ts` REST mounts with tRPC. Final app.ts structure:
```ts
app.get('/health', ...)
app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }))
// Image upload is the ONLY remaining REST route:
app.use('/api/v1/images', imagesRouter)   // keep src/routes/images.ts
app.use(notFoundHandler)
app.use(errorHandler)  // keep src/middleware/error.ts
```

**Delete:** `src/routes/index.ts`, `src/routes/listings.ts`, `src/routes/vehicles.ts`, `src/routes/favorites.ts`, `src/routes/luxury-vehicle.ts`, `src/routes/users.ts`, `src/routes/messages.ts`, `src/routes/ai.ts`, `src/middleware/auth.ts`, `src/utils/response.ts`, `src/utils/validation.ts`

**Keep:** `src/routes/images.ts`, `src/middleware/error.ts`, `src/utils/pagination.ts`, `src/config/`, `src/index.ts`

---

### Phase 3 — Frontend: tRPC Client

**`src/lib/trpc.ts`**:
```ts
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@kiwicar/trpc-types'
export const trpc = createTRPCReact<AppRouter>()
```

**`src/providers/TrpcProvider.tsx`**:
- Creates `QueryClient` (move from `main.tsx`) and `trpc.createClient()`
- `httpBatchLink` with async `headers()` that calls `supabase.auth.getSession()` to attach Bearer token
- Wraps children in `<trpc.Provider>` + `<QueryClientProvider>`

**`src/main.tsx`**: Replace `<QueryClientProvider>` with `<TrpcProvider>`. Remove `QueryClient` instantiation.

---

### Phase 4 — Frontend: Rewrite Hooks + Pages

**`src/hooks/useListings.ts`** — full rewrite:
- `useListings(filters, sort)` → `trpc.listings.list.useInfiniteQuery(input, { getNextPageParam })`
- `useListing(id)` → `trpc.listings.getById.useQuery({ id }, { enabled: !!id })`
- `useUserListings()` → `trpc.listings.myListings.useQuery()`
- Delete `mapApiListingDetailToListing()`, `ListingDetailApi` type, all mock fallback `catch` blocks

**`src/hooks/usePlateCheck.ts`** — full rewrite:
- `usePlateCheck()` → `trpc.vehicles.lookupByPlate.useMutation()`
- `useAIPricing()` → stub returning mock (ai endpoint not yet real)

**Page-level wiring:**
- `ListingDetailPage.tsx`: `trpc.favorites.add/remove.useMutation()` + invalidate `favorites.list`; `trpc.listings.incrementView.useMutation()` on mount
- `FavoritesPage.tsx`: `trpc.favorites.list.useQuery()` (replaces Zustand store as source of truth)
- `MyListingsPage.tsx`: mutations for status, update, delete with `utils.listings.myListings.invalidate()`
- `Step5Preview.tsx` in sell flow: `trpc.listings.create.useMutation()`
- `HomePage.tsx`: `trpc.luxuryVehicle.list.useQuery()`
- `Step2Photos.tsx`: keep plain `fetch()` to `/api/v1/images/upload` with FormData (not tRPC)

---

### Phase 5 — Legacy Cleanup

**Delete:**
- `src/lib/api.ts`
- `src/data/mock.ts`

**Simplify `src/stores/favorites.ts`:**
- Remove `mockFavorites` initial state → `favorites: []`
- Remove `persist` middleware (server is now source of truth)

**Prune `src/types/index.ts`:**
- Delete: `ApiResponse<T>`, `PaginatedResponse<T>`, `ListingDetailApi` (these are now inferred from tRPC)
- Keep: `SearchFilters`, `SortOption`, `SellDraft`, `PriceEstimate`, `NZ_REGIONS`, `CAR_MAKES`, `CAR_MODELS`, `User` (used in AuthProvider/Zustand), enum string unions used in UI

---

## Files That Don't Change
- `landing-page/` — entirely separate, untouched
- `kiwicar-backend/src/routes/images.ts` — Multer REST, permanent exception
- `kiwicar-frontend/src/lib/supabase.ts`
- `kiwicar-frontend/src/providers/AuthProvider.tsx`
- `kiwicar-frontend/src/stores/auth.ts`, `sell.ts`
- `kiwicar-backend/src/config/env.ts`, `config/supabase.ts`
- `kiwicar-backend/src/middleware/error.ts`
- Existing Vitest tests — they test utilities/middleware directly, unaffected

---

## Verification

```bash
# 1. Install everything
cd /Users/stan/Codes/demo-project-123 && pnpm install

# 2. Start backend (port 3001)
cd kiwicar-backend && npm run dev
curl http://localhost:3001/trpc/listings.list?input=%7B%7D   # should return items + meta
curl http://localhost:3001/health                             # should still work

# 3. Start frontend (port 5173)
cd ../kiwicar-frontend && pnpm dev
# - Home page: real luxury vehicle listings load
# - Search page: real listings load with filters
# - Listing detail: no mock fallback, real data
# - Sell flow Step 5: publishes to real backend
# - Favorites: real data for logged-in user

# 4. TypeScript check
cd kiwicar-backend && npm run build    # zero errors
cd ../kiwicar-frontend && pnpm build   # zero errors (type bridge works)

# 5. Run existing backend tests
cd ../kiwicar-backend && npm test      # all pass (utils + error middleware unchanged)
```

### End-to-end type check
In the IDE, `trpc.listings.list.useInfiniteQuery(input)` should autocomplete `input` fields matching the backend Zod schema exactly. If not, the Vite alias for `@kiwicar/trpc-types` or the relative path in `packages/trpc-types/src/index.ts` is misconfigured.
