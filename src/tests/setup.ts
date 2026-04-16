import { config } from "dotenv";

// Load environment variables BEFORE any test files are loaded
// This ensures database credentials are available when database.ts is imported
config();
