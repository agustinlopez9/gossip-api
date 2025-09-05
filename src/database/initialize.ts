import { Client } from 'pg';
import { dbConfig } from "./database.ts";

async function findOrCreateDatabase() {
  try {
    const client = new Client({ ...dbConfig, database: 'postgres' }); // connect to default db
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbConfig.database}'`);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbConfig.database}"`);
      console.log(`Database ${dbConfig.database} created.`);
    } else {
      console.log(`Database ${dbConfig.database} already exists.`);
    }
    await client.end();
  } catch (error) {
    console.error("Error finding or creating database:", error);
  }
}

findOrCreateDatabase();