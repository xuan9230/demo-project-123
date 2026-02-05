import { Router } from "express";
import { listingsRouter } from "./listings";
import { vehiclesRouter } from "./vehicles";
import { favoritesRouter } from "./favorites";
import { aiRouter } from "./ai";
import { messagesRouter } from "./messages";
import { imagesRouter } from "./images";
import { usersRouter } from "./users";

export const apiRouter = Router();

apiRouter.use("/listings", listingsRouter);
apiRouter.use("/vehicles", vehiclesRouter);
apiRouter.use("/favorites", favoritesRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/messages", messagesRouter);
apiRouter.use("/images", imagesRouter);
apiRouter.use("/users", usersRouter);
