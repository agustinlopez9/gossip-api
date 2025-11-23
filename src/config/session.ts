import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import { dbConfig } from "database/database.ts";

const PgStore = connectPgSimple(session);

export const sessionStore = new PgStore({
  pool: new Pool(dbConfig),
  tableName: "session",
  createTableIfMissing: true,
});

// Session middleware configuration
export const sessionConfig: session.SessionOptions = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};
