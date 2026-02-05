import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const messagesRouter = Router();

messagesRouter.get("/conversations", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /messages/conversations (P1) not implemented" },
  });
});

messagesRouter.get("/conversations/:id", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /messages/conversations/:id (P1) not implemented" },
  });
});
