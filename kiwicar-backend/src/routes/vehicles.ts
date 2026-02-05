import { Router } from "express";

export const vehiclesRouter = Router();

vehiclesRouter.get("/:plateNumber", (_req, res) => {
  res.status(501).json({
    success: false,
    error: { code: "NOT_IMPLEMENTED", message: "GET /vehicles/:plateNumber not implemented" },
  });
});
