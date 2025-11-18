import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const user_id = req.body.user_id;
    const post_id = req.body.post_id;

    if (!user_id || !post_id) {
      throw new AppError(400, "Missing required fields");
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
  asyncHandler(async (req, res) => {
    const likeId = Number(req.params.id);

    if (!likeId || isNaN(likeId)) {
      throw new AppError(400, "Missing or invalid Like ID");
    }

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
  asyncHandler(async (req, res) => {
    const likeId = Number(req.params.id);

    if (!likeId || isNaN(likeId)) {
      throw new AppError(400, "Missing or invalid Like ID");
    }

    const like = await db
      .selectFrom("likes")
      .where("id", "=", likeId)
      .selectAll()
      .executeTakeFirst();

    if (!like) {
      throw new AppError(404, "Like not found");
    }

    await db.deleteFrom("likes").where("id", "=", likeId).execute();

    res.status(200).json({ message: "Like deleted successfully" });
  }),
);

export default router;
