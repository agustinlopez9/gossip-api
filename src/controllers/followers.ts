import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";
import { isAuthenticated } from "middleware/auth.ts";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const follower_id = req.user!.id;
    const followed_id = req.body.followed_id;

    if (!followed_id) {
      throw new AppError(400, "Missing required field: followed_id");
    }

    if (follower_id === followed_id) {
      throw new AppError(400, "You cannot follow yourself");
    }

    await db.insertInto("followers").values({ follower_id, followed_id }).execute();

    res.status(201).json({ message: "Follow relationship created successfully" });
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const followers = await db.selectFrom("followers").selectAll().execute();
    res.json({ data: followers });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const followId = Number(req.params.id);

    if (!followId || isNaN(followId)) {
      throw new AppError(400, "Missing or invalid Follow ID");
    }

    const follow = await db
      .selectFrom("followers")
      .where("id", "=", followId)
      .selectAll()
      .executeTakeFirst();
    if (!follow) {
      throw new AppError(404, "Follow relationship not found");
    }
    res.json({ data: follow });
  }),
);

router.delete(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const followId = Number(req.params.id);
    const userId = req.user!.id;

    if (!followId || isNaN(followId)) {
      throw new AppError(400, "Missing or invalid Follow ID");
    }

    const follow = await db
      .selectFrom("followers")
      .where("id", "=", followId)
      .selectAll()
      .executeTakeFirst();

    if (!follow) {
      throw new AppError(404, "Follow relationship not found");
    }

    if (follow.follower_id !== userId) {
      throw new AppError(403, "You are not authorized to delete this follow relationship");
    }

    await db.deleteFrom("followers").where("id", "=", followId).execute();

    res.status(200).json({ message: "Follow relationship deleted successfully" });
  }),
);

export default router;
