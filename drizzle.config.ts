import { defineConfig } from "drizzle-kit";
import dbConfig from "./src/config/dbConfig";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/*",
  out: "./migrations",
  dbCredentials: {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    ssl: {
      rejectUnauthorized: true
    }
  }
});