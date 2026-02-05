import { Router } from "express";
import { requireAuth } from "../middleware/auth";

export const listingsRouter = Router();

listingsRouter.get("/", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /listings not implemented" },
  });
});

listingsRouter.get("/:id", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /listings/:id not implemented" },
  });
});

listingsRouter.post("/", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "POST /listings not implemented" },
  });
});

listingsRouter.put("/:id", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "PUT /listings/:id not implemented" },
  });
});

listingsRouter.delete("/:id", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "DELETE /listings/:id not implemented" },
  });
});

listingsRouter.put("/:id/status", requireAuth, (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "PUT /listings/:id/status not implemented" },
  });
});

listingsRouter.post("/:id/view", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "POST /listings/:id/view not implemented" },
  });
});
