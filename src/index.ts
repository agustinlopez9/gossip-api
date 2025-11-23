import express from "express";
import session from "express-session";
import { errorHandler } from "middleware/errorHandler.ts";
import { routes } from "config/index.ts";
import { sessionConfig } from "config/session.ts";
import passport from "config/passport.ts";

const app = express();

app.use(express.json());

// Session middleware
app.use(session(sessionConfig));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

routes(app);

// Error handling middleware
app.use(errorHandler);

const port = Number(process.env.API_PORT) || 4000;

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
