import { sql } from "kysely";
import { db } from "./database/database.ts";

async function main() {
  await db.schema.createTable('users')
    .addColumn('id', 'serial', (cb) => cb.primaryKey())
    .addColumn('first_name', 'varchar', (cb) => cb.notNull())
    .addColumn('last_name', 'varchar')
    .addColumn('email', 'varchar(50)', (cb) => cb.notNull())
    .addColumn('created_at', 'timestamp', (cb) =>
      cb.notNull().defaultTo(sql`now()`)
    )
    .execute()

  console.log('Users table created successfully');
}

main().catch((error) => {
  console.error("Error initializing database:", error);
});
