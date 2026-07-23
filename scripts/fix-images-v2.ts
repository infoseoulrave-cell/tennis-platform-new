import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { disableLegacyCatalogMutation } from "./legacy-catalog-mutation-disabled";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function twImg(code: string) {
  return `https://img.tennis-warehouse.com/watermark/rs.php?path=${code}-1.jpg&nw=500`;
}

const CODE_MAP: Record<string, string> = {
  // Wilson (from Wilsonracquets.html)
  "Wilson|Blade 98 v8 16x19": "WB18V",
  "Wilson|Blade 98 v8 18x20": "WB18V",
  "Wilson|Blade 100L V9": "WB100L",
  "Wilson|Burn 100S v5": "BRNSV5",
  "Wilson|Clash 100 v2": "CL103V",
  "Wilson|Clash 100L v2": "CL1L3V",
  "Wilson|Juice 100S": "WUSO19",
  "Wilson|Pro Staff 97 V14": "W97V14",
  "Wilson|Pro Staff 97L v13": "WPS97L",
  "Wilson|Pro Staff RF97 Autograph v13": "WRF1R",
  "Wilson|Roland Garros Clash 100": "WC1RG6",
  "Wilson|Shift 99 Pro v1": "WSP300",
  "Wilson|Shift 99 v1": "WSP285",
  "Wilson|Six One 95 18x20": "W95V14",
  "Wilson|Ultra 100 v4": "WU1005",
  "Wilson|Ultra 108 v4": "WU1115",
  "Wilson|Ultra Tour 95 v4": "WU99P5",

  // Babolat (from Babolatracquets.html)
  "Babolat|Aero G": "BEAR",
  "Babolat|Boost Aero": "BBOASR",
  "Babolat|Boost Drive": "BBSTDR",
  "Babolat|EVO Aero": "BEA26R",
  "Babolat|Pure Aero 2023": "BARO",
  "Babolat|Pure Aero 2026": "BPAR26",
  "Babolat|Pure Aero Lite 2023": "BAROL",
  "Babolat|Pure Aero Team 2023": "BAROTM",
  "Babolat|Pure Control 97 18x20": "PS9818",
  "Babolat|Pure Drive 2021": "BPD17R",
  "Babolat|Pure Drive 110 2021": "BPDW",
  "Babolat|Pure Drive Team 2021": "BPDLR",
  "Babolat|Pure Strike 97 18x20": "PS97SN",
  "Babolat|Pure Strike 100 16x19": "PS1020",

  // Head (from Headracquets.html)
  "Head|Boom Pro 2022": "HBOOMP",
  "Head|Boom MP 2026": "HBOMP6",
  "Head|Boom Pro 2026": "HBOOP6",
  "Head|Extreme MP 2022": "HGXTRPM",
  "Head|Extreme MP 2024": "HEMPL24",
  "Head|Gravity MP 2023": "HGMPG",
  "Head|Gravity MP 2025": "HGMPXL",
  "Head|Gravity MP L 2025": "HGMLPG",
  "Head|Gravity Pro 2023": "HGPRR",
  "Head|Instinct MP 2022": "HINMP",
  "Head|MXG 5": "HMPR",
  "Head|Prestige MP 2023": "HPRMP",
  "Head|Prestige Pro 2023": "PRPROR",
  "Head|Radical MP 2023": "HRMP",
  "Head|Speed MP 2024": "HSPDM",
  "Head|Speed MP 2026": "HSPMP6",
  "Head|Speed Pro 2024": "HSPDP",
  "Head|Speed Pro 2026": "HSPDP6",
  "Head|Speed S 2024": "HSPELT",
  "Head|Ti.S6": "TIS6",

  // Yonex (from YonexRacquets.html)
  "Yonex|Ezone 100 2022": "EZ10BB",
  "Yonex|Ezone 100SL 2022": "EZ1SLB",
  "Yonex|Ezone 98 2022": "EZ98BB",
  "Yonex|Ezone 98L 2022": "EZ1LBB",
  "Yonex|EZONE 100 2025": "LEZ10B",
  "Yonex|EZONE 98 2025": "EZ98BB",
  "Yonex|Percept 97 2023": "PERC97",
  "Yonex|Percept 100 2023": "PERM1D",
  "Yonex|Percept 97D 2023": "PERM9D",
  "Yonex|Percept 100D 2025": "PERM1D",
  "Yonex|SV 95i": "YVC95",
  "Yonex|VCORE 100 2023": "VC108G",
  "Yonex|VCORE 100L 2023": "YVC280",
  "Yonex|VCORE 110 2023": "VC1P8G",
  "Yonex|VCORE 98 2023": "VC988G",
  "Yonex|VCORE Ace 2023": "VC07ACE",
  "Yonex|VCORE Pro 100 2021": "VC108G",
  "Yonex|VCORE Pro 97 2021": "VC988G",

  // Dunlop (from Dunlopracquets.html)
  "Dunlop|Biomimetic 500": "DF500",
  "Dunlop|CX 200 2021": "DCX2S",
  "Dunlop|CX 200 (16x19) 2025": "DCX2S",
  "Dunlop|CX 200 (18x20) 2025": "DCX2OS",
  "Dunlop|CX 200 Tour 18x20 2021": "DCX2T6",
  "Dunlop|CX 400 Tour 2021": "DCX4T",
  "Dunlop|CX Pro 255 2021": "DCX4R",
  "Dunlop|FX 500 2023": "DF500",
  "Dunlop|FX 500 2024": "DF500",
  "Dunlop|FX 500 2026": "DF500",
  "Dunlop|FX 500 Lite 2024": "DF50LI",
  "Dunlop|FX 500 Tour 2023": "DF50T",
  "Dunlop|FX 700 2024": "DFX7R",
  "Dunlop|SX 300 2022": "DSX3R",
  "Dunlop|SX 300 2025": "DSX3R",
  "Dunlop|SX 300 Lite 2022": "DSXLIR",
  "Dunlop|SX 300 LS 2022": "DSXLSR",
  "Dunlop|SX 300 Tour 2022": "DSXTR",
  "Dunlop|SX 300 Tour 2025": "DSXTR",

  // Tecnifibre (from Tecnifibreracquets.html)
  "Tecnifibre|TF40 305 18x20": "TF40R2",
  "Tecnifibre|TF-40 305 2024": "TF40R1",
  "Tecnifibre|TF40 315 16x19": "TF40R5",
  "Tecnifibre|TFight 265 Isoflex 2023": "TF270S",
  "Tecnifibre|TFight 295 Isoflex 2023": "TF300S",
  "Tecnifibre|TFight 300 Isoflex 2023": "TF305S",
  "Tecnifibre|TFight 305 Isoflex 2023": "TF315S",
  "Tecnifibre|T-Rebound 298 IGA": "TTF280",
  "Tecnifibre|Tempo 298 IGA": "TTFT25",

  // Prince (from Princeracquets.html)
  "Prince|Beast 100": "PWAR10",
  "Prince|Phantom 100P": "PHNP1",
  "Prince|Phantom 100P 18x20": "PHNP1",
  "Prince|Phantom 107G 2024": "PHN7G",
  "Prince|Ripcord 100": "PRIP25",
  "Prince|Spectrum 105": "PREM05",
  "Prince|Textreme Tour 100P": "PTOUR25",
  "Prince|Textreme Tour 98": "ATR98",
  "Prince|Warrior 107": "PWAR17",
  "Prince|ATS Textreme Tour 100P 2024": "ATR10P",
  "Prince|Ripstick 100 2024": "PRIPXS",
};

async function main() {
  disableLegacyCatalogMutation();
  const { data: models } = await supabase
    .from("racket_models")
    .select("id, name, brands!inner(name)")
    .order("name");

  if (!models) { console.error("Failed to fetch"); return; }

  let ok = 0, fail = 0;

  for (const model of models) {
    const brand = (model.brands as unknown as { name: string })?.name;
    const key = `${brand}|${model.name}`;
    const code = CODE_MAP[key];

    if (!code) {
      fail++;
      console.log(`✗ ${key} — no mapping`);
      continue;
    }

    const imageUrl = twImg(code);
    try {
      const testRes = await fetch(imageUrl, { method: "HEAD" });
      if (!testRes.ok) {
        fail++;
        console.log(`✗ ${key} → ${code} (HTTP ${testRes.status})`);
        continue;
      }
    } catch {
      fail++;
      console.log(`✗ ${key} → ${code} (fetch error)`);
      continue;
    }

    await supabase.from("racket_models").update({ image_url: imageUrl }).eq("id", model.id);
    ok++;
    console.log(`✓ ${key} → ${code}`);
  }

  console.log(`\n${ok} updated, ${fail} failed`);
}

main();
