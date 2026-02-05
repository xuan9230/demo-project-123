import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /users/me (post-MVP) not implemented" },
  });
});

usersRouter.put("/me", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "PUT /users/me (post-MVP) not implemented" },
  });
});
