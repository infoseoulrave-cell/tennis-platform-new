import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Schema generation is offline; runtime access still requires DATABASE_URL.
    url: process.env.DATABASE_URL ?? "postgres://schema:generate@localhost:5432/schema",
  },
});
