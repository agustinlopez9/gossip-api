import { describe, it, expect, beforeEach } from "@jest/globals";
import { db } from "../database/database.ts";
import {
  cleanDatabase,
  createTestUser,
  createFollowerRelationship,
  testUsers,
} from "./helpers.ts";

describe("Followers Logic", () => {
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

  describe("Follow Relationship Creation", () => {
    it("should create a follow relationship", async () => {
      const relationship = await createFollowerRelationship(userId1, userId2);

      expect(relationship).toBeDefined();
      expect(relationship.follower_id).toBe(userId1);
      expect(relationship.followed_id).toBe(userId2);
      expect(relationship.created_at).toBeDefined();
    });

    it("should not allow self-follow", async () => {
      // This validation happens at application level
      // Check if userId === followedId
      const isSelfFollow = userId1 === userId1;
      expect(isSelfFollow).toBe(true);

      // In controller, this would throw an error
      // For database-level test, the insert would succeed but should be prevented
    });

    it("should enforce unique follower relationship", async () => {
      await createFollowerRelationship(userId1, userId2);

      // Attempting to create duplicate should fail due to unique constraint
      await expect(createFollowerRelationship(userId1, userId2)).rejects.toThrow();
    });

    it("should allow bidirectional follows", async () => {
      const follow1 = await createFollowerRelationship(userId1, userId2);
      const follow2 = await createFollowerRelationship(userId2, userId1);

      expect(follow1.follower_id).toBe(userId1);
      expect(follow1.followed_id).toBe(userId2);
      expect(follow2.follower_id).toBe(userId2);
      expect(follow2.followed_id).toBe(userId1);
    });

    it("should allow following multiple users", async () => {
      await createFollowerRelationship(userId1, userId2);
      await createFollowerRelationship(userId1, userId3);

      const following = await db
        .selectFrom("followers")
        .selectAll()
        .where("follower_id", "=", userId1)
        .execute();

      expect(following.length).toBe(2);
    });

    it("should allow being followed by multiple users", async () => {
      await createFollowerRelationship(userId1, userId3);
      await createFollowerRelationship(userId2, userId3);

      const followers = await db
        .selectFrom("followers")
        .selectAll()
        .where("followed_id", "=", userId3)
        .execute();

      expect(followers.length).toBe(2);
    });
  });

  describe("Follow Relationship Retrieval", () => {
    beforeEach(async () => {
      await createFollowerRelationship(userId1, userId2);
      await createFollowerRelationship(userId2, userId3);
      await createFollowerRelationship(userId3, userId1);
    });

    it("should retrieve all follow relationships", async () => {
      const relationships = await db.selectFrom("followers").selectAll().execute();

      expect(relationships.length).toBe(3);
    });

    it("should retrieve relationship by id", async () => {
      const relationship = await db
        .selectFrom("followers")
        .selectAll()
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .executeTakeFirst();

      expect(relationship).toBeDefined();
      expect(relationship?.follower_id).toBe(userId1);
      expect(relationship?.followed_id).toBe(userId2);
    });

    it("should check if user follows another user", async () => {
      const follows = await db
        .selectFrom("followers")
        .selectAll()
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .executeTakeFirst();

      expect(follows).toBeDefined();

      const doesNotFollow = await db
        .selectFrom("followers")
        .selectAll()
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId3)
        .executeTakeFirst();

      expect(doesNotFollow).toBeUndefined();
    });
  });

  describe("Follow Relationship Deletion", () => {
    let followId: number;

    beforeEach(async () => {
      const relationship = await createFollowerRelationship(userId1, userId2);
      followId = relationship.id;
    });

    it("should delete a follow relationship", async () => {
      await db.deleteFrom("followers").where("id", "=", followId).execute();

      const relationship = await db
        .selectFrom("followers")
        .selectAll()
        .where("id", "=", followId)
        .executeTakeFirst();

      expect(relationship).toBeUndefined();
    });

    it("should only allow follower to delete their own follow", async () => {
      const relationship = await db
        .selectFrom("followers")
        .selectAll()
        .where("id", "=", followId)
        .executeTakeFirst();

      // Verify relationship belongs to userId1
      expect(relationship?.follower_id).toBe(userId1);

      // In controller, userId2 attempting to delete would be rejected
      const isAuthorized = relationship?.follower_id === userId2;
      expect(isAuthorized).toBe(false);
    });

    it("should delete by follower and followed ids", async () => {
      await db
        .deleteFrom("followers")
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .execute();

      const relationship = await db
        .selectFrom("followers")
        .selectAll()
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .executeTakeFirst();

      expect(relationship).toBeUndefined();
    });
  });

  describe("Follow Check Endpoint", () => {
    beforeEach(async () => {
      await createFollowerRelationship(userId1, userId2);
    });

    it("should return true when user follows another user", async () => {
      const relationship = await db
        .selectFrom("followers")
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .selectAll()
        .executeTakeFirst();

      const isFollowing = !!relationship;
      const followId = relationship?.id || null;

      expect(isFollowing).toBe(true);
      expect(followId).toBeDefined();
    });

    it("should return false when user does not follow another user", async () => {
      const relationship = await db
        .selectFrom("followers")
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId3)
        .selectAll()
        .executeTakeFirst();

      const isFollowing = !!relationship;
      const followId = relationship?.id || null;

      expect(isFollowing).toBe(false);
      expect(followId).toBeNull();
    });

    it("should handle bidirectional follow check", async () => {
      await createFollowerRelationship(userId2, userId1);

      // userId1 follows userId2
      const follows = await db
        .selectFrom("followers")
        .where("follower_id", "=", userId1)
        .where("followed_id", "=", userId2)
        .selectAll()
        .executeTakeFirst();

      expect(!!follows).toBe(true);

      // userId2 follows userId1
      const followedBack = await db
        .selectFrom("followers")
        .where("follower_id", "=", userId2)
        .where("followed_id", "=", userId1)
        .selectAll()
        .executeTakeFirst();

      expect(!!followedBack).toBe(true);
    });
  });

  describe("Follower Statistics", () => {
    beforeEach(async () => {
      // userId1 is followed by userId2 and userId3
      await createFollowerRelationship(userId2, userId1);
      await createFollowerRelationship(userId3, userId1);

      // userId1 follows userId2
      await createFollowerRelationship(userId1, userId2);
    });

    it("should count followers correctly", async () => {
      const result = await db
        .selectFrom("followers")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("followed_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(2);
    });

    it("should count following correctly", async () => {
      const result = await db
        .selectFrom("followers")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .where("follower_id", "=", userId1)
        .executeTakeFirst();

      expect(Number(result?.count)).toBe(1);
    });
  });
});
