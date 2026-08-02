import { createClient } from "@supabase/supabase-js";
import { requireServerEnv, SUPABASE_ENV } from "@/env";

function createAdminClient(url: string, key: string) {
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;
let supabaseAdmin: SupabaseAdminClient | undefined;

// Build tooling imports server modules before deployment env is necessarily
// available. Create the privileged client only when a server query runs.
export function getSupabaseAdmin(): SupabaseAdminClient {
  if (supabaseAdmin) return supabaseAdmin;

  const env = requireServerEnv(SUPABASE_ENV, "server data access");

  supabaseAdmin = createAdminClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return supabaseAdmin;
}
