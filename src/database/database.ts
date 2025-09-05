import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import type { Database } from 'types.ts'

export const dbConfig = {
  database:  process.env.DB_NAME || "gossip_development",
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
}

export const dialect = new PostgresDialect({
  pool: new Pool(dbConfig),
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely 
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how 
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect,
})