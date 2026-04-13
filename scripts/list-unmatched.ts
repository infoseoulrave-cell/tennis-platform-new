import { createClient } from "@supabase/supabase-js";
import * as dotenv from "fs";

const envContent = dotenv.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data } = await supabase
    .from("racket_models")
    .select("name, image_url, brands!inner(name)")
    .order("name");

  if (!data) return;
  for (const m of data) {
    const brand = (m.brands as unknown as { name: string })?.name;
    const hasReal = m.image_url?.includes("tennis-warehouse");
    if (!hasReal) console.log(`${brand}|${m.name}`);
  }
}

main();
