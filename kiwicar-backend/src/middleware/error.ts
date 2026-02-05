import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const message = err.message || "Internal Server Error";
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message },
  });
};
