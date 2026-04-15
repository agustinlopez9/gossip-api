import type { Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Add unique constraint to likes table to prevent duplicate likes
  await db.schema
    .alterTable("likes")
    .addUniqueConstraint("likes_user_id_post_id_unique", ["user_id", "post_id"])
    .execute();

  // Add unique constraint to followers table to prevent duplicate follows
  await db.schema
    .alterTable("followers")
    .addUniqueConstraint("followers_follower_id_followed_id_unique", [
      "follower_id",
      "followed_id",
    ])
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // Remove unique constraints
  await db.schema
    .alterTable("likes")
    .dropConstraint("likes_user_id_post_id_unique")
    .execute();

  await db.schema
    .alterTable("followers")
    .dropConstraint("followers_follower_id_followed_id_unique")
    .execute();
}
