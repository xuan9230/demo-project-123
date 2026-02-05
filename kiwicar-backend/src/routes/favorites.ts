import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const favoritesRouter = Router();

favoritesRouter.get("/", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /favorites not implemented" },
  });
});

favoritesRouter.post("/", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "POST /favorites not implemented" },
  });
});

favoritesRouter.put("/:id", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "PUT /favorites/:id not implemented" },
  });
});

favoritesRouter.delete("/:id", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "DELETE /favorites/:id not implemented" },
  });
});
