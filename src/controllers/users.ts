import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;

    if (!username || !email || !first_name || !last_name) {
      throw new AppError(400, "Missing required fields");
    }

    await db.insertInto("users").values({ username, email, first_name, last_name }).execute();

    res.status(201).json({ message: "User created successfully" });
  }),
);

router.get(
  "/me",
  asyncHandler(async (_req, res) => {
    const user = await db.selectFrom("users").selectAll().executeTakeFirst();
    res.send({ data: user });
  }),
);

export default router;
