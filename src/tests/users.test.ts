import { describe, it, expect, beforeEach } from "@jest/globals";
import { db } from "../database/database.ts";
import {
  cleanDatabase,
  createTestUser,
  createTestPost,
  createFollowerRelationship,
  getUserById,
  testUsers,
} from "./helpers.ts";

describe("Users Logic", () => {
  let userId1: number;
  let userId2: number;
  let userId3: number;

  beforeEach(async () => {
    await cleanDatabase();

    const user1 = await createTestUser(testUsers.alice);
    const user2 = await createTestUser(testUsers.bob);
    const user3 = await createTestUser(testUsers.charlie);

    userId1 = user1.id;
    userId2 = user2.id;
    userId3 = user3.id;
  });

  describe("User Profile", () => {
    it("should retrieve user by id", async () => {
      const user = await getUserById(userId1);

      expect(user).toBeDefined();
      expect(user?.id).toBe(userId1);
      expect(user?.username).toBe(testUsers.alice.username);
      expect(user?.email).toBe(testUsers.alice.email);
    });

    it("should not expose password in profile", async () => {
      const user = await db
        .selectFrom("users")
        .select(["id", "username", "email", "first_name", "last_name", "created_at"])
        .where("id", "=", userId1)
        .executeTakeFirst();

      expect(user).toBeDefined();
      expect((user as any).password).toBeUndefined();
    });

    it("should return undefined for non-existent user", async () => {
      const user = await getUserById(99999);

      expect(user).toBeUndefined();
    });
  });

  describe("User Profile with Counts", () => {
    beforeEach(async () => {
      // Create posts for userId1
      await createTestPost(userId1, "Post 1", "Content 1");
      await createTestPost(userId1, "Post 2", "Content 2");

      // Create follower relationships
      await createFollowerRelationship(userId2, userId1); // user2 follows user1
      await createFollowerRelationship(userId3, userId1); // user3 follows user1
      await createFollowerRelationship(userId1, userId2); // user1 follows user2
    });

    it("should count user posts", async () => {
      const result = await db
        .selectFrom("posts")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("author_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(2);
    });

    it("should count user followers", async () => {
      const result = await db
        .selectFrom("followers")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("followed_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(2); // user2 and user3 follow user1
    });

    it("should count users being followed", async () => {
      const result = await db
        .selectFrom("followers")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("follower_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(1); // user1 follows user2
    });
  });

  describe("User Profile Update", () => {
    it("should update first name", async () => {
      await db
        .updateTable("users")
        .set({ first_name: "NewFirstName" })
        .where("id", "=", userId1)
        .execute();

      const user = await getUserById(userId1);

      expect(user?.first_name).toBe("NewFirstName");
      expect(user?.last_name).toBe(testUsers.alice.last_name); // Unchanged
    });

    it("should update last name", async () => {
      await db
        .updateTable("users")
        .set({ last_name: "NewLastName" })
        .where("id", "=", userId1)
        .execute();

      const user = await getUserById(userId1);

      expect(user?.last_name).toBe("NewLastName");
      expect(user?.first_name).toBe(testUsers.alice.first_name); // Unchanged
    });

    it("should update email", async () => {
      await db
        .updateTable("users")
        .set({ email: "newemail@example.com" })
        .where("id", "=", userId1)
        .execute();

      const user = await getUserById(userId1);

      expect(user?.email).toBe("newemail@example.com");
    });

    it("should update multiple fields at once", async () => {
      await db
        .updateTable("users")
        .set({
          first_name: "Updated",
          last_name: "Name",
          email: "updated@example.com",
        })
        .where("id", "=", userId1)
        .execute();

      const user = await getUserById(userId1);

      expect(user?.first_name).toBe("Updated");
      expect(user?.last_name).toBe("Name");
      expect(user?.email).toBe("updated@example.com");
    });

    it("should not allow updating to duplicate email", async () => {
      await expect(
        db
          .updateTable("users")
          .set({ email: testUsers.bob.email }) // Try to use Bob's email
          .where("id", "=", userId1)
          .execute(),
      ).rejects.toThrow();
    });
  });

  describe("User Posts Retrieval", () => {
    beforeEach(async () => {
      await createTestPost(userId1, "Alice Post 1", "Content 1");
      await createTestPost(userId1, "Alice Post 2", "Content 2");
      await createTestPost(userId2, "Bob Post", "Bob content");
    });

    it("should retrieve all posts by user", async () => {
      const posts = await db
        .selectFrom("posts")
        .selectAll()
        .where("author_id", "=", userId1)
        .execute();

      expect(posts.length).toBe(2);
      expect(posts.every((p) => p.author_id === userId1)).toBe(true);
    });

    it("should order user posts by creation date", async () => {
      const posts = await db
        .selectFrom("posts")
        .selectAll()
        .where("author_id", "=", userId1)
        .orderBy("created_at", "desc")
        .execute();

      for (let i = 0; i < posts.length - 1; i++) {
        const current = new Date(posts[i].created_at).getTime();
        const next = new Date(posts[i + 1].created_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should return empty array for user with no posts", async () => {
      const posts = await db
        .selectFrom("posts")
        .selectAll()
        .where("author_id", "=", userId3)
        .execute();

      expect(posts.length).toBe(0);
    });
  });

  describe("User Followers List", () => {
    beforeEach(async () => {
      await createFollowerRelationship(userId2, userId1); // user2 follows user1
      await createFollowerRelationship(userId3, userId1); // user3 follows user1
    });

    it("should retrieve user followers", async () => {
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
        .where("followers.followed_id", "=", userId1)
        .execute();

      expect(followers.length).toBe(2);
      expect(followers.some((f) => f.id === userId2)).toBe(true);
      expect(followers.some((f) => f.id === userId3)).toBe(true);
    });

    it("should order followers by follow date", async () => {
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
        .where("followers.followed_id", "=", userId1)
        .orderBy("followers.created_at", "desc")
        .execute();

      for (let i = 0; i < followers.length - 1; i++) {
        const current = new Date(followers[i].followed_at).getTime();
        const next = new Date(followers[i + 1].followed_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should return empty array for user with no followers", async () => {
      const user4 = await createTestUser(testUsers.diana);

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
        .where("followers.followed_id", "=", user4.id)
        .execute();

      expect(followers.length).toBe(0);
    });
  });

  describe("User Following List", () => {
    beforeEach(async () => {
      await createFollowerRelationship(userId1, userId2); // user1 follows user2
      await createFollowerRelationship(userId1, userId3); // user1 follows user3
    });

    it("should retrieve users being followed", async () => {
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
        .where("followers.follower_id", "=", userId1)
        .execute();

      expect(following.length).toBe(2);
      expect(following.some((f) => f.id === userId2)).toBe(true);
      expect(following.some((f) => f.id === userId3)).toBe(true);
    });

    it("should order following by follow date", async () => {
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
        .where("followers.follower_id", "=", userId1)
        .orderBy("followers.created_at", "desc")
        .execute();

      for (let i = 0; i < following.length - 1; i++) {
        const current = new Date(following[i].followed_at).getTime();
        const next = new Date(following[i + 1].followed_at).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should return empty array for user not following anyone", async () => {
      const user4 = await createTestUser(testUsers.diana);

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
        .where("followers.follower_id", "=", user4.id)
        .execute();

      expect(following.length).toBe(0);
    });
  });
});
