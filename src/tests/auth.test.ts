import { describe, it, expect, beforeEach } from "@jest/globals";
import { db } from "../database/database.ts";
import bcrypt from "bcryptjs";
import { getUserByUsername, cleanDatabase, testUsers } from "./helpers.ts";

describe("Authentication Logic", () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("User Registration", () => {
    it("should hash password correctly during signup", async () => {
      const password = "TestPassword123!";
      const hashedPassword = await bcrypt.hash(password, 10);

      await db
        .insertInto("users")
        .values({
          username: "testuser",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          password: hashedPassword,
        })
        .execute();

      const user = await getUserByUsername("testuser");

      expect(user).toBeDefined();
      expect(user?.password).not.toBe(password);
      expect(await bcrypt.compare(password, user!.password)).toBe(true);
    });

    it("should create user with all required fields", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);

      const result = await db
        .insertInto("users")
        .values({
          username: "newuser",
          email: "new@example.com",
          first_name: "New",
          last_name: "User",
          password: hashedPassword,
        })
        .returningAll()
        .executeTakeFirst();

      expect(result).toBeDefined();
      expect(result?.username).toBe("newuser");
      expect(result?.email).toBe("new@example.com");
      expect(result?.first_name).toBe("New");
      expect(result?.last_name).toBe("User");
      expect(result?.id).toBeDefined();
      expect(result?.created_at).toBeDefined();
    });

    it("should reject duplicate username", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);

      await db
        .insertInto("users")
        .values({
          username: "duplicate",
          email: "user1@example.com",
          first_name: "User",
          last_name: "One",
          password: hashedPassword,
        })
        .execute();

      await expect(
        db
          .insertInto("users")
          .values({
            username: "duplicate",
            email: "user2@example.com",
            first_name: "User",
            last_name: "Two",
            password: hashedPassword,
          })
          .execute(),
      ).rejects.toThrow();
    });

    it("should reject duplicate email", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);

      await db
        .insertInto("users")
        .values({
          username: "user1",
          email: "duplicate@example.com",
          first_name: "User",
          last_name: "One",
          password: hashedPassword,
        })
        .execute();

      await expect(
        db
          .insertInto("users")
          .values({
            username: "user2",
            email: "duplicate@example.com",
            first_name: "User",
            last_name: "Two",
            password: hashedPassword,
          })
          .execute(),
      ).rejects.toThrow();
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUsers.alice.password, 10);
      await db
        .insertInto("users")
        .values({
          username: testUsers.alice.username,
          email: testUsers.alice.email,
          first_name: testUsers.alice.first_name,
          last_name: testUsers.alice.last_name,
          password: hashedPassword,
        })
        .execute();
    });

    it("should find user by username", async () => {
      const user = await getUserByUsername(testUsers.alice.username);

      expect(user).toBeDefined();
      expect(user?.username).toBe(testUsers.alice.username);
      expect(user?.email).toBe(testUsers.alice.email);
    });

    it("should verify correct password", async () => {
      const user = await getUserByUsername(testUsers.alice.username);
      const isValid = await bcrypt.compare(testUsers.alice.password, user!.password);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const user = await getUserByUsername(testUsers.alice.username);
      const isValid = await bcrypt.compare("WrongPassword123!", user!.password);

      expect(isValid).toBe(false);
    });

    it("should not find non-existent user", async () => {
      const user = await getUserByUsername("nonexistent");

      expect(user).toBeUndefined();
    });
  });

  describe("Password Security", () => {
    it("should hash different passwords differently", async () => {
      const password1 = "Password123!";
      const password2 = "DifferentPass456!";

      const hash1 = await bcrypt.hash(password1, 10);
      const hash2 = await bcrypt.hash(password2, 10);

      expect(hash1).not.toBe(hash2);
    });

    it("should create different hashes for same password", async () => {
      const password = "SamePassword123!";

      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      // Hashes should be different due to salt
      expect(hash1).not.toBe(hash2);

      // But both should verify correctly
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it("should not expose password in user object", async () => {
      const hashedPassword = await bcrypt.hash("Password123!", 10);

      const user = await db
        .insertInto("users")
        .values({
          username: "secureuser",
          email: "secure@example.com",
          first_name: "Secure",
          last_name: "User",
          password: hashedPassword,
        })
        .returning(["id", "username", "email", "first_name", "last_name", "created_at"])
        .executeTakeFirst();

      expect(user).toBeDefined();
      expect(user && 'password' in user).toBe(false);
    });
  });
});
