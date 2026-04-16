import { db } from "../database/database.ts";
import bcrypt from "bcryptjs";

export const testUsers = {
  alice: {
    username: "alice",
    email: "alice@example.com",
    password: "Password123!",
    first_name: "Alice",
    last_name: "Johnson",
  },
  bob: {
    username: "bob",
    email: "bob@example.com",
    password: "Password123!",
    first_name: "Bob",
    last_name: "Smith",
  },
  charlie: {
    username: "charlie",
    email: "charlie@example.com",
    password: "Password123!",
    first_name: "Charlie",
    last_name: "Brown",
  },
  diana: {
    username: "diana",
    email: "diana@example.com",
    password: "Password123!",
    first_name: "Diana",
    last_name: "Prince",
  },
  eve: {
    username: "eve",
    email: "eve@example.com",
    password: "Password123!",
    first_name: "Eve",
    last_name: "Taylor",
  },
};

export async function getUserByUsername(username) {
  return await db
    .selectFrom("users")
    .selectAll()
    .where("username", "=", username)
    .executeTakeFirst();
}

export async function getUserById(id) {
  return await db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getPostById(id) {
  return await db
    .selectFrom("posts")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function createTestUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const user = await db
    .insertInto("users")
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return user;
}

export async function createTestPost(authorId, title, content) {
  return await db
    .insertInto("posts")
    .values({
      author_id: authorId,
      title,
      content,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function createFollowerRelationship(followerId, followedId) {
  return await db
    .insertInto("followers")
    .values({
      follower_id: followerId,
      followed_id: followedId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function createLike(userId, postId) {
  return await db
    .insertInto("likes")
    .values({
      user_id: userId,
      post_id: postId,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function cleanDatabase() {
  await db.deleteFrom("likes").execute();
  await db.deleteFrom("followers").execute();
  await db.deleteFrom("posts").execute();
  await db.deleteFrom("users").execute();
}
