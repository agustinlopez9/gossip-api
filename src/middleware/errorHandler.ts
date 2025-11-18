import type { Request, Response, NextFunction } from "express";
import { DatabaseError } from "pg";
import { AppError } from "utils/AppError.ts";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(process.env.NODE_ENV === "development" && err.details && { details: err.details }),
    });
  }

  if (err instanceof DatabaseError) {
    return res.status(400).json({ error: err.detail || "Database error occurred" });
  }

  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: err.message || "Invalid JSON syntax" });
  }

  res.status(500).json({ error: "An unexpected error occurred" });
};
