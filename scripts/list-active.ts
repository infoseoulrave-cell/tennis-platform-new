import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase
    .from("racket_models")
    .select("name, release_year, discontinued, brands!inner(name)")
    .order("name");

  if (!data) return;

  console.log("=== ACTIVE ===");
  for (const m of data) {
    if (!(m as any).discontinued) {
      const b = (m.brands as any)?.name;
      console.log(`${b} | ${m.name} | ${m.release_year ?? "?"}`);
    }
  }

  console.log("\n=== DISCONTINUED ===");
  for (const m of data) {
    if ((m as any).discontinued) {
      const b = (m.brands as any)?.name;
      console.log(`${b} | ${m.name} | ${m.release_year ?? "?"}`);
    }
  }
}
main();
