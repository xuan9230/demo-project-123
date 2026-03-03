import { aiRouter } from "./routers/ai";
import { favoritesRouter } from "./routers/favorites";
import { listingsRouter } from "./routers/listings";
import { luxuryVehicleRouter } from "./routers/luxury-vehicle";
import { messagesRouter } from "./routers/messages";
import { usersRouter } from "./routers/users";
import { vehiclesRouter } from "./routers/vehicles";
import { router } from "./trpc";

export const appRouter = router({
  listings: listingsRouter,
  vehicles: vehiclesRouter,
  favorites: favoritesRouter,
  luxuryVehicle: luxuryVehicleRouter,
  users: usersRouter,
  messages: messagesRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
