import { db } from "../database.ts";
import bcrypt from "bcryptjs";
import { usersData } from "./data/users.ts";
import { postsData } from "./data/posts.ts";
import { followersData } from "./data/followers.ts";
import { likesData } from "./data/likes.ts";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const insertedUsers = await db
    .insertInto("users")
    .values(
      usersData.map((user) => ({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: hashedPassword,
      })),
    )
    .returningAll()
    .execute();

  console.log(`✓ Created ${insertedUsers.length} users`);

  const userMap: Record<string, number> = {};
  usersData.forEach((userData, index) => {
    userMap[userData.key] = insertedUsers[index]!.id;
  });

  const insertedPosts = await db
    .insertInto("posts")
    .values(
      postsData.map((post) => ({
        author_id: userMap[post.authorKey]!,
        title: post.title,
        content: post.content,
      })),
    )
    .returningAll()
    .execute();

  console.log(`✓ Created ${insertedPosts.length} posts`);

  const insertedFollowers = await db
    .insertInto("followers")
    .values(
      followersData.map((follower) => ({
        follower_id: userMap[follower.followerKey]!,
        followed_id: userMap[follower.followedKey]!,
      })),
    )
    .returningAll()
    .execute();

  console.log(`✓ Created ${insertedFollowers.length} followers`);

  const insertedLikes = await db
    .insertInto("likes")
    .values(
      likesData.map((like) => ({
        user_id: userMap[like.userKey]!,
        post_id: insertedPosts[like.postIndex]!.id,
      })),
    )
    .returningAll()
    .execute();

  console.log(`✓ Created ${insertedLikes.length} likes`);

  console.log("✅ Database seeding completed successfully!");
  console.log("\nTest credentials:");
  console.log("  Username: alice, bob, charlie, diana, or eve");
  console.log("  Password: Password123!");

  return {
    users: insertedUsers,
    posts: insertedPosts,
    followers: insertedFollowers,
    likes: insertedLikes,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
