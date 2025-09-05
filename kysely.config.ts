import { defineConfig, getKnexTimestampPrefix } from "kysely-ctl";
import { dialect } from "./src/database/database.ts";

export default defineConfig({
  dialect,
  migrations: {
    getMigrationPrefix: getKnexTimestampPrefix,
    migrationFolder: "./src/database/migrations",
  },
  seeds: {
    seedFolder: "./src/database/seeds",
  }
});