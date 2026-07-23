import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { disableLegacyCatalogMutation } from "./legacy-catalog-mutation-disabled";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const DISCONTINUED = [
  "Aero G",
  "Biomimetic 500",
  "Juice 100S",
  "MXG 5",
  "Six One 95 18x20",
  "SV 95i",
  "Ti.S6",
  "Burn 100S v5",
  "Spectrum 105",
  "Beast 100",
  "Pure Control 97 18x20",
  "Blade 98 v8 16x19",
  "Blade 98 v8 18x20",
  "VCORE Pro 100 2021",
  "VCORE Pro 97 2021",
  "Pro Staff RF97 Autograph v13",
  "Pro Staff 97L v13",
  "Roland Garros Clash 100",
  "Pure Drive 110 2021",
  "Pure Drive 2021",
  "Pure Drive Team 2021",
  "Pure Strike 100 16x19",
  "CX 200 2021",
  "CX 200 Tour 18x20 2021",
  "CX 400 Tour 2021",
  "CX Pro 255 2021",
  "Boom Pro 2022",
  "Extreme MP 2022",
  "Instinct MP 2022",
  "Textreme Tour 100P",
  "Textreme Tour 98",
  "Phantom 100P 18x20",
  "Ripcord 100",
  "Warrior 107",
  "T-Rebound 298 IGA",
];

async function main() {
  disableLegacyCatalogMutation();
  const { data: models } = await supabase
    .from("racket_models")
    .select("id, name")
    .order("name");

  if (!models) { console.error("Failed to fetch"); return; }

  let removed = 0;
  for (const model of models) {
    if (DISCONTINUED.includes(model.name)) {
      const { error } = await supabase
        .from("racket_models")
        .update({ discontinued: true })
        .eq("id", model.id);

      if (error) {
        console.log(`✗ ${model.name} — ${error.message}`);
      } else {
        removed++;
        console.log(`✓ ${model.name} → discontinued`);
      }
    }
  }
  console.log(`\n${removed} rackets marked as discontinued`);
}

main();
