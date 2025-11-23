import { Router } from "express";
import passport from "config/passport.ts";
import bcrypt from "bcryptjs";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";
import { isAuthenticated } from "middleware/auth.ts";
import type { Users as User } from "types.ts";

const router = Router();

router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { username, email, first_name, last_name, password } = req.body;

    if (!username || !email || !first_name || !password) {
      throw new AppError(400, "Username, email, first name and password are required");
    }

    if (password.length < 8) {
      throw new AppError(400, "Password must be at least 8 characters long");
    }

    const existingUser = await db
      .selectFrom("users")
      .select("id")
      .where("username", "=", username)
      .executeTakeFirst();

    if (existingUser) {
      throw new AppError(409, "Username already exists");
    }

    const existingEmail = await db
      .selectFrom("users")
      .select("id")
      .where("email", "=", email)
      .executeTakeFirst();

    if (existingEmail) {
      throw new AppError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto("users")
      .values({
        username,
        email,
        first_name,
        last_name: last_name || null,
        password: passwordHash,
      })
      .returning(["id", "username", "email", "first_name", "last_name", "created_at"])
      .executeTakeFirstOrThrow();

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  }),
);

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError(400, "Username and password are required"));
  }

  passport.authenticate(
    "local",
    (err: Error | null, user: User | false, info?: { message?: string }) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new AppError(401, info?.message || "Authentication failed"));
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: passwordField, ...userWithoutPassword } = user;

        return res.json({
          message: "Login successful",
          user: userWithoutPassword,
        });
      });
    },
  )(req, res, next);
});

router.post(
  "/logout",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    req.logout((err) => {
      if (err) {
        throw new AppError(500, "Failed to logout");
      }

      req.session.destroy((err) => {
        if (err) {
          throw new AppError(500, "Failed to destroy session");
        }

        res.clearCookie("connect.sid");
        res.json({ message: "Logout successful" });
      });
    });
  }),
);

router.get(
  "/me",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const user = req.user as User;
    const userId = Number(user.id);

    const currentUser = await db
      .selectFrom("users")
      .select(["id", "username", "email", "first_name", "last_name", "created_at"])
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!currentUser) {
      throw new AppError(404, "User not found");
    }

    res.json({ user: currentUser });
  }),
);

export default router;
