import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access.");
  }

  const client = postgres(connectionString, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

type Database = ReturnType<typeof createDatabase>;
let database: Database | undefined;

export function getDb(): Database {
  database ??= createDatabase();
  return database;
}

// Keep existing call sites ergonomic while deferring all connection setup
// until a query method is actually read.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const value = Reflect.get(getDb(), property, getDb());
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
