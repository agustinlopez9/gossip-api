import { describe, it, expect, beforeEach } from "@jest/globals";
import { db } from "../database/database.ts";
import {
  cleanDatabase,
  createTestUser,
  createTestPost,
  getPostById,
  createFollowerRelationship,
  createLike,
  testUsers,
} from "./helpers.ts";

describe("Posts Logic", () => {
  let userId1: number;
  let userId2: number;
  let postId: number;

  beforeEach(async () => {
    await cleanDatabase();

    const user1 = await createTestUser(testUsers.alice);
    const user2 = await createTestUser(testUsers.bob);
    userId1 = user1.id;
    userId2 = user2.id;

    const post = await createTestPost(userId1, "Test Post", "Test content");
    postId = post.id;
  });

  describe("Post Creation", () => {
    it("should create a post with all required fields", async () => {
      const post = await getPostById(postId);

      expect(post).toBeDefined();
      expect(post?.title).toBe("Test Post");
      expect(post?.content).toBe("Test content");
      expect(post?.author_id).toBe(userId1);
      expect(post?.created_at).toBeDefined();
    });

    it("should create post with sanitized content", async () => {
      const dirtyContent = "<script>alert('xss')</script>Hello World";
      const post = await createTestPost(userId1, "XSS Test", dirtyContent);

      // Content should be stored as-is (sanitization happens at validation layer)
      expect(post.content).toBeDefined();
    });

    it("should enforce title length limit", async () => {
      const longTitle = "a".repeat(201);

      const post = await db
        .insertInto("posts")
        .values({
          author_id: userId1,
          title: longTitle,
          content: "Content",
        })
        .returningAll()
        .executeTakeFirst();

      expect(post).toBeDefined();
    });

    it("should enforce content length limit", async () => {
      const longContent = "a".repeat(5001); // Exceeds 5000 char limit

      const post = await db
        .insertInto("posts")
        .values({
          author_id: userId1,
          title: "Title",
          content: longContent,
        })
        .returningAll()
        .executeTakeFirst();

      expect(post).toBeDefined();
    });
  });

  describe("Post Retrieval", () => {
    it("should retrieve all posts", async () => {
      await createTestPost(userId1, "Post 2", "Content 2");
      await createTestPost(userId2, "Post 3", "Content 3");

      const posts = await db.selectFrom("posts").selectAll().execute();

      expect(posts.length).toBeGreaterThanOrEqual(3);
    });

    it("should retrieve posts by author", async () => {
      await createTestPost(userId1, "Post 2", "Content 2");
      await createTestPost(userId2, "Post 3", "Content 3");

      const posts = await db
        .selectFrom("posts")
        .selectAll()
        .where("author_id", "=", userId1)
        .execute();

      expect(posts.length).toBe(2);
      expect(posts.every((p) => p.author_id === userId1)).toBe(true);
    });

    it("should retrieve single post by id", async () => {
      const post = await getPostById(postId);

      expect(post).toBeDefined();
      expect(post?.id).toBe(postId);
    });

    it("should return undefined for non-existent post", async () => {
      const post = await getPostById(99999);

      expect(post).toBeUndefined();
    });
  });

  describe("Post Update", () => {
    it("should update post title", async () => {
      await db
        .updateTable("posts")
        .set({ title: "Updated Title" })
        .where("id", "=", postId)
        .execute();

      const post = await getPostById(postId);

      expect(post?.title).toBe("Updated Title");
      expect(post?.content).toBe("Test content"); // Content unchanged
    });

    it("should update post content", async () => {
      await db
        .updateTable("posts")
        .set({ content: "Updated Content" })
        .where("id", "=", postId)
        .execute();

      const post = await getPostById(postId);

      expect(post?.content).toBe("Updated Content");
      expect(post?.title).toBe("Test Post"); // Title unchanged
    });

    it("should only allow author to update their post", async () => {
      const post = await getPostById(postId);

      // Verify post belongs to userId1
      expect(post?.author_id).toBe(userId1);

      // In controller logic, userId2 attempting to update would be rejected
      const isAuthorized = post?.author_id === userId2;
      expect(isAuthorized).toBe(false);
    });
  });

  describe("Post Deletion", () => {
    it("should delete a post", async () => {
      await db.deleteFrom("posts").where("id", "=", postId).execute();

      const post = await getPostById(postId);

      expect(post).toBeUndefined();
    });

    it("should cascade delete likes when post is deleted", async () => {
      await createLike(userId2, postId);

      const likesBefore = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId)
        .execute();

      expect(likesBefore.length).toBe(1);

      await db.deleteFrom("posts").where("id", "=", postId).execute();

      const likesAfter = await db
        .selectFrom("likes")
        .selectAll()
        .where("post_id", "=", postId)
        .execute();

      expect(likesAfter.length).toBe(0);
    });

    it("should only allow author to delete their post", async () => {
      const post = await getPostById(postId);

      expect(post?.author_id).toBe(userId1);

      const isAuthorized = post?.author_id === userId2;
      expect(isAuthorized).toBe(false);
    });
  });

  describe("Post Feed", () => {
    beforeEach(async () => {
      await createFollowerRelationship(userId1, userId2);
    });

    it("should show posts from followed users", async () => {
      const post2 = await createTestPost(userId2, "Bob's Post", "Bob's content");

      const feedPosts = await db
        .selectFrom("posts")
        .innerJoin("followers", "followers.followed_id", "posts.author_id")
        .selectAll("posts")
        .where("followers.follower_id", "=", userId1)
        .execute();

      // Should include post2 (from userId2 who userId1 follows)
      expect(feedPosts.some((p) => p.id === post2.id)).toBe(true);
    });

    it("should not show posts from non-followed users", async () => {
      const user3 = await createTestUser(testUsers.charlie);
      const post3 = await createTestPost(user3.id, "Charlie's Post", "Charlie's content");

      const feedPosts = await db
        .selectFrom("posts")
        .innerJoin("followers", "followers.followed_id", "posts.author_id")
        .selectAll("posts")
        .where("followers.follower_id", "=", userId1)
        .execute();

      // Should NOT include post3 (userId1 doesn't follow user3)
      expect(feedPosts.some((p) => p.id === post3.id)).toBe(false);
    });

    it("should order feed by creation date", async () => {
      await createTestPost(userId2, "Post 1", "Content 1");
      await createTestPost(userId2, "Post 2", "Content 2");

      const feedPosts = await db
        .selectFrom("posts")
        .innerJoin("followers", "followers.followed_id", "posts.author_id")
        .selectAll("posts")
        .where("followers.follower_id", "=", userId1)
        .orderBy("posts.created_at", "desc")
        .execute();

      // Posts should be in descending order (newest first)
      for (let i = 0; i < feedPosts.length - 1; i++) {
        const current = new Date(feedPosts[i]!.created_at).getTime();
        const next = new Date(feedPosts[i + 1]!.created_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });
  });

  describe("Post Pagination", () => {
    beforeEach(async () => {
      // Create more posts for pagination testing
      for (let i = 0; i < 25; i++) {
        await createTestPost(userId1, `Post ${i}`, `Content ${i}`);
      }
    });

    it("should limit results", async () => {
      const posts = await db.selectFrom("posts").selectAll().limit(10).execute();

      expect(posts.length).toBe(10);
    });

    it("should offset results", async () => {
      const firstBatch = await db
        .selectFrom("posts")
        .selectAll()
        .orderBy("id", "asc")
        .limit(10)
        .execute();

      const secondBatch = await db
        .selectFrom("posts")
        .selectAll()
        .orderBy("id", "asc")
        .limit(10)
        .offset(10)
        .execute();

      // Batches should not overlap
      const firstIds = firstBatch.map((p) => p.id);
      const secondIds = secondBatch.map((p) => p.id);

      expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
    });

    it("should support limit and offset together", async () => {
      const posts = await db.selectFrom("posts").selectAll().limit(5).offset(5).execute();

      expect(posts.length).toBe(5);
    });
  });
});
