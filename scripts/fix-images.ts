import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { disableLegacyCatalogMutation } from "./legacy-catalog-mutation-disabled";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TW = "https://img.tennis-warehouse.com/watermark/rs.php?path=CODE-1.jpg&nw=500";

function twImg(code: string) {
  return TW.replace("CODE", code);
}

async function findTWCode(brand: string, model: string): Promise<string | null> {
  const queries = [
    `${brand} ${model}`,
    `${model}`,
  ];

  for (const q of queries) {
    try {
      const searchUrl = `https://www.tennis-warehouse.com/searchresults.html?searchtext=${encodeURIComponent(q)}`;
      const res = await fetch(searchUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" },
        redirect: "follow",
      });
      const html = await res.text();

      const descMatches = html.match(/descpageRC[A-Z]+-([A-Z0-9]+)\.html/g);
      if (descMatches) {
        for (const m of descMatches) {
          const code = m.match(/descpageRC[A-Z]+-([A-Z0-9]+)\.html/)?.[1];
          if (code && code !== "HSQUR") {
            const testUrl = twImg(code);
            const testRes = await fetch(testUrl, { method: "HEAD" });
            if (testRes.ok) return code;
          }
        }
      }

      const descpage2 = html.match(/descpage-([A-Z0-9]+)\.html/g);
      if (descpage2) {
        for (const m of descpage2) {
          const code = m.match(/descpage-([A-Z0-9]+)\.html/)?.[1];
          if (code && code.length > 3) {
            const testUrl = twImg(code);
            const testRes = await fetch(testUrl, { method: "HEAD" });
            if (testRes.ok) return code;
          }
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function tryDirectCodes(brand: string, model: string): Promise<string | null> {
  const guesses: string[] = [];

  const cleanModel = model.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  const brandPrefixes: Record<string, string[]> = {
    Wilson: ["W", "WIL"],
    Babolat: ["B", "BAB"],
    Head: ["H", "HD"],
    Yonex: ["Y", "YON"],
    Dunlop: ["D", "DUN"],
    Tecnifibre: ["T", "TF"],
    Prince: ["P", "PR"],
    Diadem: ["DI"],
  };

  const prefixes = brandPrefixes[brand] ?? [brand[0]];

  for (const prefix of prefixes) {
    const words = cleanModel.split(/\s+/).filter(Boolean);
    const initials = words.map(w => w[0]?.toUpperCase()).join("");
    const nums = cleanModel.replace(/[^0-9]/g, "");

    if (nums) {
      guesses.push(`${prefix}${initials}${nums}`);
      guesses.push(`${prefix}${nums}`);
    }
    guesses.push(`${prefix}${initials}`);
  }

  for (const code of guesses) {
    try {
      const testRes = await fetch(twImg(code), { method: "HEAD" });
      if (testRes.ok) return code;
    } catch { continue; }
  }
  return null;
}

const KNOWN_CODES: Record<string, string> = {
  "Babolat|Pure Aero 2026": "BPAR26",
  "Babolat|Pure Drive 2025": "BPD25R",
  "Babolat|EVO Aero": "BEA26R",
  "Wilson|Blade 98 (16x19) V9": "WB9816",
  "Wilson|Blade 98 16x19 v9": "WB9816",
  "Head|Ti.S6": "TIS6",
  "Head|Prestige Pro 2023": "PRPROR",
  "Yonex|VCORE 100 2023": "VC108G",
  "Yonex|EZONE 100 2025": "LEZ10B",
  "Yonex|Percept 100 2023": "PERC",
  "Yonex|VCORE 100L 2023": "YVC280",
  "Dunlop|CX 200 2021": "DCX2S",
  "Tecnifibre|TF40 315 16x19": "TF40R1",
};

async function main() {
  disableLegacyCatalogMutation();
  const { data: models } = await supabase
    .from("racket_models")
    .select("id, name, brands!inner(name)")
    .order("name");

  if (!models) { console.error("Failed to fetch models"); return; }

  console.log(`Processing ${models.length} rackets...`);
  let success = 0, failed = 0;

  for (const model of models) {
    const brand = (model.brands as unknown as { name: string })?.name;
    const key = `${brand}|${model.name}`;

    let code = KNOWN_CODES[key] ?? null;

    if (!code) {
      code = await findTWCode(brand, model.name);
    }

    if (!code) {
      code = await tryDirectCodes(brand, model.name);
    }

    if (code) {
      const imageUrl = twImg(code);
      await supabase.from("racket_models").update({ image_url: imageUrl }).eq("id", model.id);
      success++;
      console.log(`✓ ${key} → ${code}`);
    } else {
      failed++;
      console.log(`✗ ${key} — no image found`);
    }

    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nDone: ${success} success, ${failed} failed`);
}

main();
