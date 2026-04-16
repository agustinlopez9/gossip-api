import { Client } from "pg";
import { dbConfig } from "./database.ts";

async function initializeDatabase() {
  const client = new Client({ ...dbConfig, database: "postgres" });
  await client.connect();

  const dbExists = await client.query(
    `SELECT 1 FROM pg_database WHERE datname='${dbConfig.database}'`,
  );

  if (dbExists.rowCount! > 0) {
    await client.query(`DROP DATABASE "${dbConfig.database}"`);
    console.log(`✓ Dropped existing database: ${dbConfig.database}`);
  }

  await client.query(`CREATE DATABASE "${dbConfig.database}"`);
  console.log(`✓ Created database: ${dbConfig.database}`);
  await client.end();

  process.exit(0);
}

initializeDatabase().catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
