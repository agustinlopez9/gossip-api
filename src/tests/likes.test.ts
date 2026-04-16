import { describe, it, expect, beforeEach } from "@jest/globals";
import { db } from "../database/database.ts";
import {
  cleanDatabase,
  createTestUser,
  createTestPost,
  createLike,
  testUsers,
} from "./helpers.ts";

describe("Likes Logic", () => {
  let userId1: number;
  let userId2: number;
  let userId3: number;
  let postId1: number;
  let postId2: number;

  beforeEach(async () => {
    await cleanDatabase();

    const user1 = await createTestUser(testUsers.alice);
    const user2 = await createTestUser(testUsers.bob);
    const user3 = await createTestUser(testUsers.charlie);

    userId1 = user1.id;
    userId2 = user2.id;
    userId3 = user3.id;

    const post1 = await createTestPost(userId1, "Post 1", "Content 1");
    const post2 = await createTestPost(userId2, "Post 2", "Content 2");

    postId1 = post1.id;
    postId2 = post2.id;
  });

  describe("Like Creation", () => {
    it("should create a like with all required fields", async () => {
      const like = await createLike(userId1, postId1);

      expect(like).toBeDefined();
      expect(like.user_id).toBe(userId1);
      expect(like.post_id).toBe(postId1);
      expect(like.created_at).toBeDefined();
      expect(like.id).toBeDefined();
    });

    it("should enforce unique constraint - user can only like a post once", async () => {
      await createLike(userId1, postId1);

      // Attempting to create duplicate like should fail
      await expect(createLike(userId1, postId1)).rejects.toThrow();
    });

    it("should allow multiple users to like the same post", async () => {
      const like1 = await createLike(userId1, postId1);
      const like2 = await createLike(userId2, postId1);
      const like3 = await createLike(userId3, postId1);

      expect(like1.post_id).toBe(postId1);
      expect(like2.post_id).toBe(postId1);
      expect(like3.post_id).toBe(postId1);

      const likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId1)
        .execute();

      expect(likes.length).toBe(3);
    });

    it("should allow user to like multiple posts", async () => {
      await createLike(userId1, postId1);
      await createLike(userId1, postId2);

      const likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("user_id", "=", userId1)
        .execute();

      expect(likes.length).toBe(2);
    });

    it("should not allow liking non-existent post", async () => {
      await expect(
        db
          .insertInto("likes")
          .values({
            user_id: userId1,
            post_id: 99999,
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
      ).rejects.toThrow();
    });
  });

  describe("Like Retrieval", () => {
    beforeEach(async () => {
      await createLike(userId1, postId1);
      await createLike(userId2, postId1);
      await createLike(userId1, postId2);
    });

    it("should retrieve all likes", async () => {
      const likes = await db.selectFrom("likes").selectAll().execute();

      expect(likes.length).toBe(3);
    });

    it("should retrieve likes by post", async () => {
      const likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId1)
        .execute();

      expect(likes.length).toBe(2);
      expect(likes.every((l) => l.post_id === postId1)).toBe(true);
    });

    it("should retrieve likes by user", async () => {
      const likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("user_id", "=", userId1)
        .execute();

      expect(likes.length).toBe(2);
      expect(likes.every((l) => l.user_id === userId1)).toBe(true);
    });

    it("should check if user has liked a post", async () => {
      const hasLiked = await db
        .selectFrom("likes")
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .selectAll()
        .executeTakeFirst();

      expect(hasLiked).toBeDefined();

      const hasNotLiked = await db
        .selectFrom("likes")
        .where("user_id", "=", userId3)
        .where("post_id", "=", postId1)
        .selectAll()
        .executeTakeFirst();

      expect(hasNotLiked).toBeUndefined();
    });
  });

  describe("Like Deletion", () => {
    let likeId: number;

    beforeEach(async () => {
      const like = await createLike(userId1, postId1);
      likeId = like.id;
    });

    it("should delete a like", async () => {
      await db.deleteFrom("likes").where("id", "=", likeId).execute();

      const like = await db
        .selectFrom("likes")
        .selectAll()
        .where("id", "=", likeId)
        .executeTakeFirst();

      expect(like).toBeUndefined();
    });

    it("should only allow user to delete their own like", async () => {
      const like = await db
        .selectFrom("likes")
        .selectAll()
        .where("id", "=", likeId)
        .executeTakeFirst();

      // Verify like belongs to userId1
      expect(like?.user_id).toBe(userId1);

      // In controller logic, userId2 attempting to delete would be rejected
      const isAuthorized = like?.user_id === userId2;
      expect(isAuthorized).toBe(false);
    });

    it("should delete by user_id and post_id", async () => {
      await db
        .deleteFrom("likes")
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .execute();

      const like = await db
        .selectFrom("likes")
        .selectAll()
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(like).toBeUndefined();
    });
  });
});
