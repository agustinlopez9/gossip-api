import { afterAll } from "@jest/globals";
import { db } from "../database/database.ts";

// Clean up database connection after all tests
afterAll(async () => {
  await db.destroy();
});
