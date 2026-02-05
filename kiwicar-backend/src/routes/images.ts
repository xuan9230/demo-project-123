import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const imagesRouter = Router();

imagesRouter.post("/upload", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "POST /images/upload not implemented" },
  });
});
