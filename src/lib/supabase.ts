import { createClient } from "@supabase/supabase-js";

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server data access.",
    );
  }

  supabaseAdmin = createAdminClient(supabaseUrl, supabaseServiceKey);
  return supabaseAdmin;
}
