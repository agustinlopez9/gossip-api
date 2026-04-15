import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";
import { isAuthenticated } from "middleware/auth.ts";
import { createContentLimiter } from "middleware/rateLimiter.ts";
import { validate } from "middleware/validate.ts";
import {
  createPostSchema,
  updatePostSchema,
  getPostSchema,
  deletePostSchema,
  getPostsSchema,
  getPostFeedSchema,
  getPostLikesSchema,
} from "schemas/posts.schema.ts";

const router = Router();

router.post(
  "/",
  isAuthenticated,
  createContentLimiter,
  validate(createPostSchema),
  asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    const author_id = req.user!.id;

    await db.insertInto("posts").values({ title, content, author_id }).execute();

    res.status(201).json({ message: "Post created successfully" });
  }),
);

router.put(
  "/:id",
  isAuthenticated,
  validate(updatePostSchema),
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    const { title, content } = req.body;
    const userId = req.user!.id;

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

router.delete(
  "/:id",
  isAuthenticated,
  validate(deletePostSchema),
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user!.id;

    const post = await db
      .selectFrom("posts")
      .where("id", "=", postId)
      .selectAll()
      .executeTakeFirst();

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    if (post.author_id !== userId) {
      throw new AppError(403, "You are not authorized to delete this post");
    }

    await db.deleteFrom("posts").where("id", "=", postId).execute();

    res.status(200).json({ message: "Post deleted successfully" });
  }),
);

router.get(
  "/",
  validate(getPostsSchema),
  asyncHandler(async (req, res) => {
    const author_id = req.query.author_id ? Number(req.query.author_id) : undefined;
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);
    const currentUserId = req.user?.id;

    let query = db
      .selectFrom("posts")
      .leftJoin("likes", "likes.post_id", "posts.id")
      .selectAll("posts")
      .select(({ fn, eb }) => [
        fn.countAll<number>().as("likes_count"),
        // Check if current user has liked this post
        eb
          .exists(
            eb
              .selectFrom("likes as user_like")
              .whereRef("user_like.post_id", "=", "posts.id")
              .where("user_like.user_id", "=", currentUserId || -1),
          )
          .as("has_liked"),
      ])
      .groupBy("posts.id")
      .orderBy("posts.created_at", "desc");

    if (author_id) {
      query = query.where("posts.author_id", "=", author_id);
    }

    const posts = await query.limit(limit).offset(offset).execute();

    res.json({
      data: posts.map((post) => ({
        ...post,
        likes_count: Number(post.likes_count),
        has_liked: Boolean(post.has_liked),
      })),
      pagination: {
        limit,
        offset,
      },
    });
  }),
);

router.get(
  "/feed",
  isAuthenticated,
  validate(getPostFeedSchema),
  asyncHandler(async (req, res) => {
    const currentUserId = req.user!.id;
    const limit = Number(req.query.limit);
    const offset = Number(req.query.offset);

    const posts = await db
      .selectFrom("posts")
      .innerJoin("followers", "followers.followed_id", "posts.author_id")
      .leftJoin("likes", "likes.post_id", "posts.id")
      .selectAll("posts")
      .select(({ fn, eb }) => [
        fn.countAll<number>().as("likes_count"),
        eb
          .exists(
            eb
              .selectFrom("likes as user_like")
              .whereRef("user_like.post_id", "=", "posts.id")
              .where("user_like.user_id", "=", currentUserId),
          )
          .as("has_liked"),
      ])
      .where("followers.follower_id", "=", currentUserId)
      .groupBy("posts.id")
      .orderBy("posts.created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    res.json({
      data: posts.map((post) => ({
        ...post,
        likes_count: Number(post.likes_count),
        has_liked: Boolean(post.has_liked),
      })),
      pagination: {
        limit,
        offset,
      },
    });
  }),
);

router.get(
  "/:id",
  validate(getPostSchema),
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    const currentUserId = req.user?.id;

    const post = await db
      .selectFrom("posts")
      .leftJoin("likes", "likes.post_id", "posts.id")
      .selectAll("posts")
      .select(({ fn, eb }) => [
        fn.countAll<number>().as("likes_count"),
        eb
          .exists(
            eb
              .selectFrom("likes as user_like")
              .whereRef("user_like.post_id", "=", "posts.id")
              .where("user_like.user_id", "=", currentUserId || -1),
          )
          .as("has_liked"),
      ])
      .where("posts.id", "=", postId)
      .groupBy("posts.id")
      .executeTakeFirst();

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    res.json({
      data: {
        ...post,
        likes_count: Number(post.likes_count),
        has_liked: Boolean(post.has_liked),
      },
    });
  }),
);

router.get(
  "/:id/likes",
  validate(getPostLikesSchema),
  asyncHandler(async (req, res) => {
    const postId = Number(req.params.id);
    const post = await db
      .selectFrom("posts")
      .where("id", "=", postId)
      .selectAll()
      .executeTakeFirst();

    if (!post) {
      throw new AppError(404, "Post not found");
    }

    const likes = await db
      .selectFrom("likes")
      .innerJoin("users", "users.id", "likes.user_id")
      .select([
        "users.id",
        "users.username",
        "users.first_name",
        "users.last_name",
        "likes.created_at as liked_at",
      ])
      .where("likes.post_id", "=", postId)
      .orderBy("likes.created_at", "desc")
      .execute();

    res.json({ data: likes });
  }),
);

export default router;
