import { sql, type Kysely } from "kysely";

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await db.schema
    .createTable("followers")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("follower_id", "integer", (col) => col.notNull())
    .addColumn("followed_id", "integer", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
    .addForeignKeyConstraint("followers_follower_id_fkey", ["follower_id"], "users", ["id"])
    .addForeignKeyConstraint("followers_followed_id_fkey", ["followed_id"], "users", ["id"])
    .execute();
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await db.schema.dropTable("followers").execute();
}
