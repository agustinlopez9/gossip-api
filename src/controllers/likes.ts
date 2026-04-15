import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";
import { isAuthenticated } from "middleware/auth.ts";
import { createContentLimiter } from "middleware/rateLimiter.ts";
import { validate } from "middleware/validate.ts";
import { createLikeSchema, getLikeSchema, deleteLikeSchema } from "schemas/likes.schema.ts";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  createContentLimiter,
  validate(createLikeSchema),
  asyncHandler(async (req, res) => {
    const user_id = req.user!.id;
    const { post_id } = req.body;

    const existingLike = await db
      .selectFrom("likes")
      .where("user_id", "=", user_id)
      .where("post_id", "=", post_id)
      .selectAll()
      .executeTakeFirst();

    if (existingLike) {
      throw new AppError(409, "You have already liked this post");
    }

    await db.insertInto("likes").values({ user_id, post_id }).execute();

    res.status(201).json({ message: "Like created successfully" });
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const likes = await db.selectFrom("likes").selectAll().execute();
    res.json({ data: likes });
  }),
);

router.get(
  "/:id",
  validate(getLikeSchema),
  asyncHandler(async (req, res) => {
    const likeId = Number(req.params.id);

    const like = await db
      .selectFrom("likes")
      .where("id", "=", likeId)
      .selectAll()
      .executeTakeFirst();
    if (!like) {
      throw new AppError(404, "Like not found");
    }
    res.json({ data: like });
  }),
);

router.delete(
  "/:id",
  isAuthenticated,
  validate(deleteLikeSchema),
  asyncHandler(async (req, res) => {
    const likeId = Number(req.params.id);
    const userId = req.user!.id;

    const like = await db
      .selectFrom("likes")
      .where("id", "=", likeId)
      .selectAll()
      .executeTakeFirst();

    if (!like) {
      throw new AppError(404, "Like not found");
    }

    if (like.user_id !== userId) {
      throw new AppError(403, "You are not authorized to delete this like");
    }

    await db.deleteFrom("likes").where("id", "=", likeId).execute();

    res.status(200).json({ message: "Like deleted successfully" });
  }),
);

export default router;
