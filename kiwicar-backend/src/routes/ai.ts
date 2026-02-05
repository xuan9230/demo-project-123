import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const aiRouter = Router();

aiRouter.post("/generate-description", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "POST /ai/generate-description not implemented" },
  });
});

aiRouter.get("/pricing", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /ai/pricing not implemented" },
  });
});
