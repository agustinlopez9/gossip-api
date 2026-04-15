import rateLimit from "express-rate-limit";

// General API rate limiter - applies to all API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.isAuthenticated();
  },
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Moderate rate limiter for authenticated users
export const authenticatedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return !req.isAuthenticated();
  },
});

// Rate limiter for creating content (posts, likes, follows)
export const createContentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "You are creating content too quickly, please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
