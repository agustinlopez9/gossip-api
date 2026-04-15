import express from "express";
import session from "express-session";
import { apiLimiter, authenticatedLimiter } from "middleware/rateLimiter.ts";
import { errorHandler } from "middleware/errorHandler.ts";
import helmetMiddleware from "config/security.ts";
import corsMiddleware from "config/cors.ts";
import passport from "config/passport.ts";
import { sessionConfig } from "config/session.ts";
import { routes } from "config/index.ts";

const app = express();

// Security headers middleware
app.use(helmetMiddleware);

// CORS middleware
app.use(corsMiddleware);

app.use(express.json());

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting middleware
app.use("/api", apiLimiter); // For unauthenticated users
app.use("/api", authenticatedLimiter); // For authenticated users (higher limits)

routes(app);

// Error handling middleware
app.use(errorHandler);

const port = Number(process.env.API_PORT) || 4000;

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
