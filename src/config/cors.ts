import cors from "cors";
import type { CorsOptions } from "cors";

const getAllowedOrigins = (): string[] => {
  const envOrigins = process.env.ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }

  return [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4200",
    "http://localhost:8080",
  ];
};

const allowedOrigins = getAllowedOrigins();

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],

  exposedHeaders: [
    "Content-Length",
    "Content-Type",
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
  ],

  maxAge: 86400, // 24 hours

  optionsSuccessStatus: 204,
};

export default cors(corsConfig);
