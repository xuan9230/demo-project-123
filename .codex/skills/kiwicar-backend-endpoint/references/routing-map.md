# Routing Map (kiwicar-backend)

## Base paths

- Health check: `GET /health` in `src/app.ts`.
- API base: `app.use("/api/v1", apiRouter)` in `src/app.ts`.

## Mounted routers (src/routes/index.ts)

- `/listings` -> `listingsRouter` (`src/routes/listings.ts`)
- `/vehicles` -> `vehiclesRouter` (`src/routes/vehicles.ts`)
- `/favorites` -> `favoritesRouter` (`src/routes/favorites.ts`)
- `/ai` -> `aiRouter` (`src/routes/ai.ts`)
- `/messages` -> `messagesRouter` (`src/routes/messages.ts`)
- `/images` -> `imagesRouter` (`src/routes/images.ts`)
- `/users` -> `usersRouter` (`src/routes/users.ts`)

## New router checklist

1. Create `src/routes/<name>.ts` and export `const <name>Router = Router()`.
2. Add `import { <name>Router } from "./<name>";` in `src/routes/index.ts`.
3. Add `apiRouter.use("/<name>", <name>Router);`.
