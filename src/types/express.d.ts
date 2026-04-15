import "express";
import type { Users } from "../types.ts";

declare global {
  namespace Express {
    /* User in session matches the Users table from the database
       Password is omitted for security (never included in session) */
    interface User extends Omit<Users, "password"> {
      id: number;
      created_at: Date;
    }
  }
}
