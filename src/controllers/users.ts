import { Router } from "express";
import { db } from "database/database.ts";
import { asyncHandler } from "utils/asyncHandler.ts";
import { AppError } from "utils/AppError.ts";
import { isAuthenticated } from "middleware/auth.ts";
import { validate } from "middleware/validate.ts";
import {
  getUserSchema,
  updateUserSchema,
  getUserPostsSchema,
  getUserFollowersSchema,
  getUserFollowingSchema,
} from "schemas/users.schema.ts";

const router = Router();

router.get(
  "/:id",
  validate(getUserSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const user = await db
      .selectFrom("users")
      .select([
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "created_at",
      ])
      .where("id", "=", userId)
      .executeTakeFirst();

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const followerCount = await db
      .selectFrom("followers")
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .where("followed_id", "=", userId)
      .executeTakeFirst();

    const followingCount = await db
      .selectFrom("followers")
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .where("follower_id", "=", userId)
      .executeTakeFirst();

    const postsCount = await db
      .selectFrom("posts")
      .select(({ fn }) => fn.count<number>("id").as("count"))
      .where("author_id", "=", userId)
      .executeTakeFirst();

    res.json({
      data: {
        ...user,
        followers_count: Number(followerCount?.count || 0),
        following_count: Number(followingCount?.count || 0),
        posts_count: Number(postsCount?.count || 0),
      },
    });
  }),
);

router.put(
  "/:id",
  isAuthenticated,
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const currentUserId = req.user!.id;

    if (userId !== currentUserId) {
      throw new AppError(403, "You can only update your own profile");
    }

    const { first_name, last_name, email } = req.body;

    const updateData: Record<string, string> = {};
    if (first_name) updateData.first_name = first_name;
    if (last_name) updateData.last_name = last_name;
    if (email) updateData.email = email;

    await db
      .updateTable("users")
      .set(updateData)
      .where("id", "=", userId)
      .execute();

    res.json({ message: "Profile updated successfully" });
  }),
);

router.get(
  "/:id/posts",
  validate(getUserPostsSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const posts = await db
      .selectFrom("posts")
      .selectAll()
      .where("author_id", "=", userId)
      .orderBy("created_at", "desc")
      .execute();

    res.json({ data: posts });
  }),
);

router.get(
  "/:id/followers",
  validate(getUserFollowersSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const followers = await db
      .selectFrom("followers")
      .innerJoin("users", "users.id", "followers.follower_id")
      .select([
        "users.id",
        "users.username",
        "users.first_name",
        "users.last_name",
        "followers.created_at as followed_at",
      ])
      .where("followers.followed_id", "=", userId)
      .orderBy("followers.created_at", "desc")
      .execute();

    res.json({ data: followers });
  }),
);

router.get(
  "/:id/following",
  validate(getUserFollowingSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    const following = await db
      .selectFrom("followers")
      .innerJoin("users", "users.id", "followers.followed_id")
      .select([
        "users.id",
        "users.username",
        "users.first_name",
        "users.last_name",
        "followers.created_at as followed_at",
      ])
      .where("followers.follower_id", "=", userId)
      .orderBy("followers.created_at", "desc")
      .execute();

    res.json({ data: following });
  }),
);

export default router;
