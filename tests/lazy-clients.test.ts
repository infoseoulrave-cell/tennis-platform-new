import test from "node:test";
import assert from "node:assert/strict";

test("database clients can be imported before deployment env is available", async () => {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  delete process.env.DATABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const dbModule = await import("../src/db/index");
    const supabaseModule = await import("../src/lib/supabase");
    assert.ok(dbModule.db);
    assert.equal(typeof supabaseModule.getSupabaseAdmin, "function");
  } finally {
    if (databaseUrl) process.env.DATABASE_URL = databaseUrl;
    if (supabaseUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = supabaseUrl;
    if (supabaseKey) process.env.SUPABASE_SERVICE_ROLE_KEY = supabaseKey;
  }
});
