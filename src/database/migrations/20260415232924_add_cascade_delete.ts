import { sql, type Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Drop existing foreign key constraints
  await sql`ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey`.execute(db);
  await sql`ALTER TABLE likes DROP CONSTRAINT likes_user_id_fkey`.execute(db);
  await sql`ALTER TABLE likes DROP CONSTRAINT likes_post_id_fkey`.execute(db);
  await sql`ALTER TABLE followers DROP CONSTRAINT followers_follower_id_fkey`.execute(db);
  await sql`ALTER TABLE followers DROP CONSTRAINT followers_followed_id_fkey`.execute(db);

  // Add foreign key constraints with CASCADE DELETE
  await sql`ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE`.execute(
    db,
  );
  await sql`ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`.execute(
    db,
  );
  await sql`ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE`.execute(
    db,
  );
  await sql`ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE`.execute(
    db,
  );
  await sql`ALTER TABLE followers ADD CONSTRAINT followers_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE`.execute(
    db,
  );
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // Drop CASCADE DELETE foreign key constraints
  await sql`ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey`.execute(db);
  await sql`ALTER TABLE likes DROP CONSTRAINT likes_user_id_fkey`.execute(db);
  await sql`ALTER TABLE likes DROP CONSTRAINT likes_post_id_fkey`.execute(db);
  await sql`ALTER TABLE followers DROP CONSTRAINT followers_follower_id_fkey`.execute(db);
  await sql`ALTER TABLE followers DROP CONSTRAINT followers_followed_id_fkey`.execute(db);

  // Add back foreign key constraints without CASCADE DELETE
  await sql`ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id)`.execute(
    db,
  );
  await sql`ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)`.execute(
    db,
  );
  await sql`ALTER TABLE likes ADD CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id)`.execute(
    db,
  );
  await sql`ALTER TABLE followers ADD CONSTRAINT followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES users(id)`.execute(
    db,
  );
  await sql`ALTER TABLE followers ADD CONSTRAINT followers_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES users(id)`.execute(
    db,
  );
}
