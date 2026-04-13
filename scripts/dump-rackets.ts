import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const s = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await s
    .from("racket_models")
    .select("id, name, image_url, brands!inner(name)")
    .order("name");
  if (data) {
    for (const m of data) {
      const b = (m.brands as unknown as { name: string })?.name;
      console.log(`${b}|${m.name}`);
    }
  }
}
main();
