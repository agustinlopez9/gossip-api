import type { Request, Response, NextFunction } from "express";
import { AppError } from "utils/AppError.ts";

// Middleware to protect routes that require authentication.
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }

  throw new AppError(401, "Authentication required");
};
