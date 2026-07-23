import { createClient } from "@supabase/supabase-js";
import { disableLegacyCatalogMutation } from "./legacy-catalog-mutation-disabled";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TW_BASE = "https://img.tennis-warehouse.com/watermark/rs.php?nw=500&path=";

const IMAGE_MAP: Record<string, string> = {
  // Wilson
  "Wilson|Pro Staff RF97 Autograph v13": `${TW_BASE}WPSRF13-1.jpg`,
  "Wilson|Pro Staff 97 V14": `${TW_BASE}WPS97V14-1.jpg`,
  "Wilson|Blade 98 (16x19) V9": `${TW_BASE}WB98V9-1.jpg`,
  "Wilson|Blade 98 (18x20) V9": `${TW_BASE}WB9820V9-1.jpg`,
  "Wilson|Blade 100L V9": `${TW_BASE}WB100LV9-1.jpg`,
  "Wilson|Ultra 100 v4": `${TW_BASE}WU100V4-1.jpg`,
  "Wilson|Clash 100L v2": `${TW_BASE}WC100LV2-1.jpg`,
  "Wilson|Clash 100 v2": `${TW_BASE}WC100V2-1.jpg`,
  "Wilson|Burn 100S v5": `${TW_BASE}WBN100SV5-1.jpg`,
  "Wilson|Six One 95 18x20": `${TW_BASE}W6195-1.jpg`,
  "Wilson|Juice 100S": `${TW_BASE}WJ100S-1.jpg`,
  "Wilson|Shift 99 Pro V1": `${TW_BASE}WSHF99P-1.jpg`,
  "Wilson|Shift 99 V1": `${TW_BASE}WSHF99-1.jpg`,

  // Babolat
  "Babolat|Pure Aero 2026": `${TW_BASE}BPAG926-1.jpg`,
  "Babolat|Pure Aero 98 2026": `${TW_BASE}BPA9826-1.jpg`,
  "Babolat|Pure Aero Lite 2023": `${TW_BASE}BPAL23-1.jpg`,
  "Babolat|Pure Aero Team 2023": `${TW_BASE}BPAT23-1.jpg`,
  "Babolat|Pure Drive 2021": `${TW_BASE}BPDR21-1.jpg`,
  "Babolat|Pure Drive 2025": `${TW_BASE}BPDR25-1.jpg`,
  "Babolat|Pure Drive Lite 2025": `${TW_BASE}BPDRL25-1.jpg`,
  "Babolat|Pure Drive Team 2025": `${TW_BASE}BPDRT25-1.jpg`,
  "Babolat|Pure Strike 97 18x20": `${TW_BASE}BPS9720-1.jpg`,
  "Babolat|Pure Strike 100 2024": `${TW_BASE}BPS10024-1.jpg`,
  "Babolat|Pure Strike 98 2024": `${TW_BASE}BPS9824-1.jpg`,
  "Babolat|Pure Feel 107 2024": `${TW_BASE}BPFL107-1.jpg`,
  "Babolat|EVO Aero": `${TW_BASE}BEVOA-1.jpg`,
  "Babolat|Boost Drive 2024": `${TW_BASE}BBSTDR24-1.jpg`,

  // Head
  "Head|Speed Pro 2024": `${TW_BASE}HSPDP624-1.jpg`,
  "Head|Speed MP 2024": `${TW_BASE}HSPDMP24-1.jpg`,
  "Head|Speed Pro 2026": `${TW_BASE}HSPDP626-1.jpg`,
  "Head|Speed MP 2026": `${TW_BASE}HSPDMP26-1.jpg`,
  "Head|Gravity Pro 2023": `${TW_BASE}HGRVP23-1.jpg`,
  "Head|Gravity MP 2025": `${TW_BASE}HGRVMP25-1.jpg`,
  "Head|Gravity MP L 2025": `${TW_BASE}HGRVMPL25-1.jpg`,
  "Head|Prestige Pro 2023": `${TW_BASE}HPRSTP23-1.jpg`,
  "Head|Prestige MP 2023": `${TW_BASE}HPRSTMP23-1.jpg`,
  "Head|Extreme MP 2024": `${TW_BASE}HEXTMP24-1.jpg`,
  "Head|Boom Pro 2026": `${TW_BASE}HBMP26-1.jpg`,
  "Head|Boom MP 2026": `${TW_BASE}HBMMP26-1.jpg`,
  "Head|Instinct MP 2022": `${TW_BASE}HINSTMP22-1.jpg`,
  "Head|MXG 5": `${TW_BASE}HMXG5-1.jpg`,

  // Yonex
  "Yonex|VCORE 100 2023": `${TW_BASE}YVCR10023-1.jpg`,
  "Yonex|VCORE 98 2023": `${TW_BASE}YVCR9823-1.jpg`,
  "Yonex|VCORE 100 2026": `${TW_BASE}YVCR10026-1.jpg`,
  "Yonex|VCORE 98 2026": `${TW_BASE}YVCR9826-1.jpg`,
  "Yonex|Ezone 100 2022": `${TW_BASE}YEZ10022-1.jpg`,
  "Yonex|Ezone 98 2022": `${TW_BASE}YEZ9822-1.jpg`,
  "Yonex|EZONE 100 2025": `${TW_BASE}YEZ10025-1.jpg`,
  "Yonex|EZONE 98 2025": `${TW_BASE}YEZ9825-1.jpg`,
  "Yonex|Percept 97 2023": `${TW_BASE}YPCPT9723-1.jpg`,
  "Yonex|Percept 100 2023": `${TW_BASE}YPCPT10023-1.jpg`,
  "Yonex|Percept 100D 2025": `${TW_BASE}YPCPT100D25-1.jpg`,

  // Dunlop
  "Dunlop|FX 500 Tour 2023": `${TW_BASE}DFX500T23-1.jpg`,
  "Dunlop|FX 500 2024": `${TW_BASE}DFX50024-1.jpg`,
  "Dunlop|FX 500 2026": `${TW_BASE}DFX50026-1.jpg`,
  "Dunlop|FX 500 Lite 2024": `${TW_BASE}DFX500L24-1.jpg`,
  "Dunlop|FX 700 2024": `${TW_BASE}DFX70024-1.jpg`,
  "Dunlop|CX 200 2021": `${TW_BASE}DCX20021-1.jpg`,
  "Dunlop|CX 200 (18x20) 2025": `${TW_BASE}DCX2001825-1.jpg`,
  "Dunlop|CX 200 (16x19) 2025": `${TW_BASE}DCX2001625-1.jpg`,
  "Dunlop|CX 400 Tour 2021": `${TW_BASE}DCX400T21-1.jpg`,
  "Dunlop|SX 300 2025": `${TW_BASE}DSX30025-1.jpg`,
  "Dunlop|SX 300 Tour 2025": `${TW_BASE}DSX300T25-1.jpg`,
  "Dunlop|SX 300 LS 2022": `${TW_BASE}DSX300LS22-1.jpg`,
  "Dunlop|SX 300 Lite 2022": `${TW_BASE}DSX300L22-1.jpg`,

  // Tecnifibre
  "Tecnifibre|TF40 305 18x20": `${TW_BASE}TTF40305-1.jpg`,
  "Tecnifibre|TF-40 305 2024": `${TW_BASE}TTF4030524-1.jpg`,
  "Tecnifibre|TFight 305 Isoflex 2023": `${TW_BASE}TTFT30523-1.jpg`,
  "Tecnifibre|TFight 265 Isoflex 2023": `${TW_BASE}TTFT26523-1.jpg`,
  "Tecnifibre|T-Rebound 298 IGA 2025": `${TW_BASE}TTR298IGA-1.jpg`,
  "Tecnifibre|Tempo 298 IGA 2025": `${TW_BASE}TTMP298IGA-1.jpg`,

  // Prince
  "Prince|Textreme Tour 100P": `${TW_BASE}PTXTT100P-1.jpg`,
  "Prince|Warrior 107": `${TW_BASE}PW107-1.jpg`,
  "Prince|Phantom 100P": `${TW_BASE}PPH100P-1.jpg`,
  "Prince|Ripcord 100": `${TW_BASE}PRC100-1.jpg`,
  "Prince|ATS Textreme Tour 100P 2024": `${TW_BASE}PATST100P-1.jpg`,
  "Prince|Ripstick 100 2024": `${TW_BASE}PRS10024-1.jpg`,
  "Prince|Phantom 107G 2024": `${TW_BASE}PPH107G24-1.jpg`,

  // Diadem
  "Diadem|Elevate 98 V3 2024": `${TW_BASE}DELV98V3-1.jpg`,
  "Diadem|Nova FS 100": `${TW_BASE}DNVFS100-1.jpg`,
  "Diadem|Nova Plus 100 2024": `${TW_BASE}DNVP100-1.jpg`,
};

async function updateImages() {
  disableLegacyCatalogMutation();
  console.log("Fetching all racket models...");

  const { data: models, error } = await supabase
    .from("racket_models")
    .select("id, name, brands!inner(name)")
    .order("id");

  if (error || !models) {
    console.error("Failed to fetch models:", error);
    return;
  }

  console.log(`Found ${models.length} racket models`);

  let updated = 0;
  let skipped = 0;

  for (const model of models) {
    const brandName = (model.brands as unknown as { name: string })?.name;
    const key = `${brandName}|${model.name}`;
    const imageUrl = IMAGE_MAP[key];

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from("racket_models")
        .update({ image_url: imageUrl })
        .eq("id", model.id);

      if (updateError) {
        console.error(`Failed to update ${key}:`, updateError.message);
      } else {
        updated++;
        console.log(`✓ ${key}`);
      }
    } else {
      skipped++;
      console.log(`✗ No image mapping for: ${key}`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

updateImages().catch(console.error);
