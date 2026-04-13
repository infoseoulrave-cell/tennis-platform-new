import { createClient } from "@supabase/supabase-js";
import * as dotenv from "fs";

const envContent = dotenv.readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TW = "https://img.tennis-warehouse.com/watermark/rs.php?nw=500&path=";

const IMAGE_MAP: Record<string, string> = {
  "Babolat|Aero G": `${TW}BAERG-1.jpg`,
  "Prince|Beast 100": `${TW}PBT100-1.jpg`,
  "Dunlop|Biomimetic 500": `${TW}DBM500-1.jpg`,
  "Wilson|Blade 98 v8 16x19": `${TW}WB98V8-1.jpg`,
  "Wilson|Blade 98 v8 18x20": `${TW}WB9820V8-1.jpg`,
  "Head|Boom Pro 2022": `${TW}HBMP22-1.jpg`,
  "Babolat|Boost Aero": `${TW}BBSTA-1.jpg`,
  "Babolat|Boost Drive": `${TW}BBSTDR-1.jpg`,
  "Dunlop|CX 200 Tour 18x20 2021": `${TW}DCX200T21-1.jpg`,
  "Dunlop|CX Pro 255 2021": `${TW}DCXP25521-1.jpg`,
  "Head|Extreme MP 2022": `${TW}HEXTMP22-1.jpg`,
  "Yonex|Ezone 100SL 2022": `${TW}YEZ100SL22-1.jpg`,
  "Yonex|Ezone 98L 2022": `${TW}YEZ98L22-1.jpg`,
  "Dunlop|FX 500 2023": `${TW}DFX50023-1.jpg`,
  "Head|Gravity MP 2023": `${TW}HGRVMP23-1.jpg`,
  "Yonex|Percept 97D 2023": `${TW}YPCPT97D23-1.jpg`,
  "Prince|Phantom 100P 18x20": `${TW}PPH100P18-1.jpg`,
  "Wilson|Pro Staff 97L v13": `${TW}WPS97LV13-1.jpg`,
  "Babolat|Pure Aero 2023": `${TW}BPA23-1.jpg`,
  "Babolat|Pure Control 97 18x20": `${TW}BPC9718-1.jpg`,
  "Babolat|Pure Drive 110 2021": `${TW}BPDR11021-1.jpg`,
  "Babolat|Pure Drive Team 2021": `${TW}BPDRT21-1.jpg`,
  "Babolat|Pure Strike 100 16x19": `${TW}BPS100-1.jpg`,
  "Head|Radical MP 2023": `${TW}HRADMP23-1.jpg`,
  "Wilson|Roland Garros Clash 100": `${TW}WC100RG-1.jpg`,
  "Wilson|Shift 99 Pro v1": `${TW}WSHF99P-1.jpg`,
  "Wilson|Shift 99 v1": `${TW}WSHF99-1.jpg`,
  "Prince|Spectrum 105": `${TW}PSPC105-1.jpg`,
  "Head|Speed S 2024": `${TW}HSPDS24-1.jpg`,
  "Yonex|SV 95i": `${TW}YSV95I-1.jpg`,
  "Dunlop|SX 300 2022": `${TW}DSX30022-1.jpg`,
  "Dunlop|SX 300 Tour 2022": `${TW}DSX300T22-1.jpg`,
  "Tecnifibre|T-Rebound 298 IGA": `${TW}TTR298IGA-1.jpg`,
  "Tecnifibre|Tempo 298 IGA": `${TW}TTMP298IGA-1.jpg`,
  "Prince|Textreme Tour 98": `${TW}PTXTT98-1.jpg`,
  "Tecnifibre|TF40 315 16x19": `${TW}TTF40315-1.jpg`,
  "Tecnifibre|TFight 295 Isoflex 2023": `${TW}TTFT29523-1.jpg`,
  "Tecnifibre|TFight 300 Isoflex 2023": `${TW}TTFT30023-1.jpg`,
  "Head|Ti.S6": `${TW}HTIS6-1.jpg`,
  "Wilson|Ultra 108 v4": `${TW}WU108V4-1.jpg`,
  "Wilson|Ultra Tour 95 v4": `${TW}WUT95V4-1.jpg`,
  "Yonex|VCORE 100L 2023": `${TW}YVCR100L23-1.jpg`,
  "Yonex|VCORE 110 2023": `${TW}YVCR11023-1.jpg`,
  "Yonex|VCORE Ace 2023": `${TW}YVCRACE23-1.jpg`,
  "Yonex|VCORE Pro 100 2021": `${TW}YVCRP10021-1.jpg`,
  "Yonex|VCORE Pro 97 2021": `${TW}YVCRP9721-1.jpg`,
};

async function main() {
  const { data: models } = await supabase
    .from("racket_models")
    .select("id, name, brands!inner(name)")
    .order("id");

  if (!models) return;

  let updated = 0;
  for (const model of models) {
    const brand = (model.brands as unknown as { name: string })?.name;
    const key = `${brand}|${model.name}`;
    const imageUrl = IMAGE_MAP[key];
    if (imageUrl) {
      await supabase.from("racket_models").update({ image_url: imageUrl }).eq("id", model.id);
      updated++;
      console.log(`✓ ${key}`);
    }
  }
  console.log(`\nUpdated ${updated} more images`);
}

main();
