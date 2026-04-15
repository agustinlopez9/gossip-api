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
    const title = req.body.title;
    const content = req.body.content;
    const author_id = req.user!.id;

    if (!title || !content) {
      throw new AppError(400, "Missing required fields");
    }

    await db.insertInto("posts").values({ title, content, author_id }).execute();

    res.status(201).json({ message: "Post created successfully" });
  }),
);

router.put(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.user!.id;

    if (!postId || isNaN(postId)) {
      throw new AppError(400, "Missing or invalid Post ID");
    }

    if (!title && !content) {
      throw new AppError(400, "At least one field (title or content) must be provided for update");
    }

    const post = await db
      .selectFrom("posts")
      .where("id", "=", postId)
      .selectAll()
      .executeTakeFirst();

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.author_id !== userId) {
      throw new AppError(403, "You are not authorized to update this post");
    }

    const updateData = { title, content };

    await db.updateTable("posts").set(updateData).where("id", "=", postId).execute();

    res.status(200).json({ message: "Post updated successfully" });
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const posts = await db.selectFrom("posts").selectAll().execute();
    res.json({ data: posts });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);

    if (!postId || isNaN(postId)) {
      throw new AppError(400, "Missing or invalid Post ID");
    }

    const post = await db
      .selectFrom("posts")
      .where("id", "=", postId)
      .selectAll()
      .executeTakeFirst();
    if (!post) {
      throw new AppError(404, "Post not found");
    }
    res.json({ data: post });
  }),
);

export default router;
