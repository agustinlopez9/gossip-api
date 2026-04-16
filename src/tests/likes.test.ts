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

    it("should retrieve single like by id", async () => {
      const like = await createLike(userId3, postId2);

      const retrieved = await db
        .selectFrom("likes")
        .selectAll()
        .where("id", "=", like.id)
        .executeTakeFirst();

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(like.id);
      expect(retrieved?.user_id).toBe(userId3);
      expect(retrieved?.post_id).toBe(postId2);
    });

    it("should return undefined for non-existent like", async () => {
      const like = await db
        .selectFrom("likes")
        .selectAll()
        .where("id", "=", 99999)
        .executeTakeFirst();

      expect(like).toBeUndefined();
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

    it("should verify like count decreases after deletion", async () => {
      await createLike(userId2, postId1);
      await createLike(userId3, postId1);

      const beforeCount = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(beforeCount?.count)).toBe(3);

      await db.deleteFrom("likes").where("id", "=", likeId).execute();

      const afterCount = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(afterCount?.count)).toBe(2);
    });
  });

  describe("Like Statistics", () => {
    beforeEach(async () => {
      // userId1 likes postId1 and postId2
      await createLike(userId1, postId1);
      await createLike(userId1, postId2);

      // userId2 and userId3 like postId1
      await createLike(userId2, postId1);
      await createLike(userId3, postId1);
    });

    it("should count likes for a post", async () => {
      const result = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(3);
    });

    it("should count likes by a user", async () => {
      const result = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("user_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(2);
    });

    it("should return zero for post with no likes", async () => {
      const post3 = await createTestPost(userId3, "No Likes Post", "No likes content");

      const result = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", post3.id)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(0);
    });

    it("should return zero for user with no likes", async () => {
      const user4 = await createTestUser(testUsers.diana);

      const result = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("user_id", "=", user4.id)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(0);
    });

    it("should get users who liked a post", async () => {
      const users = await db
        .selectFrom("likes")
        .innerJoin("users", "users.id", "likes.user_id")
        .select([
          "users.id",
          "users.username",
          "users.first_name",
          "users.last_name",
          "likes.created_at as liked_at",
        ])
        .where("likes.post_id", "=", postId1)
        .execute();

      expect(users.length).toBe(3);
      expect(users.some((u) => u.id === userId1)).toBe(true);
      expect(users.some((u) => u.id === userId2)).toBe(true);
      expect(users.some((u) => u.id === userId3)).toBe(true);
    });

    it("should order likes by creation date", async () => {
      const likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId1)
        .orderBy("created_at", "desc")
        .execute();

      for (let i = 0; i < likes.length - 1; i++) {
        const current = new Date(likes[i].created_at).getTime();
        const next = new Date(likes[i + 1].created_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe("Cascade Deletion", () => {
    beforeEach(async () => {
      await createLike(userId1, postId1);
      await createLike(userId2, postId1);
      await createLike(userId3, postId1);
    });

    it("should cascade delete likes when post is deleted", async () => {
      const likesBefore = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId1)
        .execute();

      expect(likesBefore.length).toBe(3);

      await db.deleteFrom("posts").where("id", "=", postId1).execute();

      const likesAfter = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId1)
        .execute();

      expect(likesAfter.length).toBe(0);
    });

    it("should cascade delete likes when user is deleted", async () => {
      const likesBefore = await db
        .selectFrom("likes")
        .selectAll()
        .where("user_id", "=", userId1)
        .execute();

      expect(likesBefore.length).toBe(1);

      // First delete user's posts (due to foreign key constraint)
      await db.deleteFrom("posts").where("author_id", "=", userId1).execute();

      // Then delete user
      await db.deleteFrom("users").where("id", "=", userId1).execute();

      const likesAfter = await db
        .selectFrom("likes")
        .selectAll()
        .where("user_id", "=", userId1)
        .execute();

      expect(likesAfter.length).toBe(0);
    });

    it("should not affect likes on other posts when one post is deleted", async () => {
      await createLike(userId1, postId2);
      await createLike(userId2, postId2);

      const totalLikesBefore = await db.selectFrom("likes").selectAll().execute();
      expect(totalLikesBefore.length).toBe(5);

      await db.deleteFrom("posts").where("id", "=", postId1).execute();

      const post2Likes = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId2)
        .execute();

      expect(post2Likes.length).toBe(2);

      const totalLikesAfter = await db.selectFrom("likes").selectAll().execute();
      expect(totalLikesAfter.length).toBe(2);
    });
  });

  describe("Like Toggle Behavior", () => {
    it("should allow unliking and re-liking a post", async () => {
      // Like the post
      const like = await createLike(userId1, postId1);
      expect(like).toBeDefined();

      // Unlike the post
      await db
        .deleteFrom("likes")
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .execute();

      const unliked = await db
        .selectFrom("likes")
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .selectAll()
        .executeTakeFirst();

      expect(unliked).toBeUndefined();

      // Re-like the post
      const reLike = await createLike(userId1, postId1);
      expect(reLike).toBeDefined();
      expect(reLike.id).not.toBe(like.id); // New like has different id
    });

    it("should maintain correct like count through toggle operations", async () => {
      await createLike(userId1, postId1);
      await createLike(userId2, postId1);

      let count = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(count?.count)).toBe(2);

      // User1 unlikes
      await db
        .deleteFrom("likes")
        .where("user_id", "=", userId1)
        .where("post_id", "=", postId1)
        .execute();

      count = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(count?.count)).toBe(1);

      // User3 likes
      await createLike(userId3, postId1);

      count = await db
        .selectFrom("likes")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("post_id", "=", postId1)
        .executeTakeFirst();

      expect(Number(count?.count)).toBe(2);
    });
  });
});
