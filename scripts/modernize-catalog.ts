import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env: Record<string, string> = {};
for (const l of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = l.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TW = "https://img.tennis-warehouse.com/watermark/rs.php?path=CODE-1.jpg&nw=500";
function twImg(code: string) { return TW.replace("CODE", code); }

const DISCONTINUE_2022_2023 = [
  "Boost Aero", "Boost Drive", "Clash 100 v2", "Clash 100L v2", "EVO Aero",
  "Ezone 100 2022", "Ezone 100SL 2022", "Ezone 98 2022", "Ezone 98L 2022",
  "FX 500 2023", "FX 500 Tour 2023",
  "Gravity MP 2023", "Gravity Pro 2023",
  "Percept 100 2023", "Percept 97 2023", "Percept 97D 2023",
  "Prestige MP 2023", "Prestige Pro 2023",
  "Pure Aero 2023", "Pure Aero Lite 2023", "Pure Aero Team 2023",
  "Pure Strike 97 18x20",
  "Radical MP 2023",
  "SX 300 2022", "SX 300 Lite 2022", "SX 300 Tour 2022",
  "Tempo 298 IGA", "TF40 305 18x20", "TF40 315 16x19",
  "TFight 265 Isoflex 2023", "TFight 295 Isoflex 2023", "TFight 300 Isoflex 2023",
  "Ultra 100 v4", "Ultra 108 v4", "Ultra Tour 95 v4",
  "VCORE 100 2023", "VCORE 100L 2023", "VCORE 110 2023", "VCORE 98 2023", "VCORE Ace 2023",
];

type NewRacket = {
  brand: string;
  name: string;
  year: number;
  segment: string;
  weight: number;
  headSize: number;
  pattern: string;
  stiffness: number | null;
  swingWeight: number | null;
  balance: number;
  beam: string;
  length: number;
  price: number;
  twCode: string;
  sourceUrl?: string;
  measurementBasis?: "unstrung" | "strung";
};

const NEW_RACKETS: NewRacket[] = [
  // Babolat 2025-2026
  { brand: "Babolat", name: "Pure Aero 2026", year: 2026, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 69, swingWeight: 290, balance: 321, beam: "23/26/23", length: 685, price: 339000, twCode: "BPAR26", sourceUrl: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html", measurementBasis: "unstrung" },
  { brand: "Babolat", name: "Pure Aero 98 2026", year: 2026, segment: "advanced", weight: 305, headSize: 98, pattern: "16x20", stiffness: 71, swingWeight: 295, balance: 315, beam: "21/23/22", length: 685, price: 349000, twCode: "BPA98R", sourceUrl: "https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html", measurementBasis: "unstrung" },
  { brand: "Babolat", name: "Pure Aero Team 2026", year: 2026, segment: "intermediate", weight: 285, headSize: 100, pattern: "16x19", stiffness: 70, swingWeight: 280, balance: 320, beam: "23/26/23", length: 685, price: 319000, twCode: "BPAT26", sourceUrl: "https://www.babolat.com/us/pure-aero-team-gen9-unstrung/101571.html", measurementBasis: "unstrung" },
  { brand: "Babolat", name: "Pure Aero Lite 2026", year: 2026, segment: "beginner", weight: 270, headSize: 100, pattern: "16x19", stiffness: 70, swingWeight: 275, balance: 330, beam: "23/26/23", length: 685, price: 299000, twCode: "BPALTR", sourceUrl: "https://www.babolat.com/us/pure-aero-lite-gen9-unstrung/101572.html", measurementBasis: "unstrung" },
  { brand: "Babolat", name: "Pure Drive 2025", year: 2025, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 71, swingWeight: 318, balance: 320, beam: "23.5/26/23", length: 686, price: 339000, twCode: "BPD25R" },
  { brand: "Babolat", name: "Pure Drive Lite 2025", year: 2025, segment: "beginner", weight: 270, headSize: 100, pattern: "16x19", stiffness: 71, swingWeight: 293, balance: 330, beam: "23.5/26/23", length: 686, price: 299000, twCode: "BPDLR" },
  { brand: "Babolat", name: "Pure Drive Team 2025", year: 2025, segment: "intermediate", weight: 285, headSize: 100, pattern: "16x19", stiffness: 71, swingWeight: 305, balance: 320, beam: "23.5/26/23", length: 686, price: 319000, twCode: "BPDP25" },
  { brand: "Babolat", name: "Pure Strike 98 16x19 2024", year: 2024, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 67, swingWeight: 322, balance: 320, beam: "21/23/21", length: 686, price: 329000, twCode: "PS9816" },
  { brand: "Babolat", name: "Pure Strike 100 2024", year: 2024, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 68, swingWeight: 315, balance: 320, beam: "21/24/22", length: 686, price: 329000, twCode: "PS1020" },

  // Wilson 2024-2025
  { brand: "Wilson", name: "Blade 98 16x19 V9", year: 2024, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 62, swingWeight: 324, balance: 323, beam: "21/21/21", length: 686, price: 305000, twCode: "WB9816" },
  { brand: "Wilson", name: "Blade 98 18x20 V9", year: 2024, segment: "advanced", weight: 305, headSize: 98, pattern: "18x20", stiffness: 62, swingWeight: 324, balance: 323, beam: "21/21/21", length: 686, price: 305000, twCode: "WB18V" },
  { brand: "Wilson", name: "Blade 100L V9", year: 2024, segment: "intermediate", weight: 285, headSize: 100, pattern: "16x19", stiffness: 62, swingWeight: 298, balance: 325, beam: "22/22/22", length: 686, price: 285000, twCode: "WB100L" },
  { brand: "Wilson", name: "Pro Staff 97 V14", year: 2024, segment: "advanced", weight: 315, headSize: 97, pattern: "16x19", stiffness: 63, swingWeight: 330, balance: 315, beam: "21.5/21.5/21.5", length: 686, price: 295000, twCode: "W97V14" },
  { brand: "Wilson", name: "Shift 99 V1", year: 2024, segment: "advanced", weight: 300, headSize: 99, pattern: "16x19", stiffness: 63, swingWeight: 315, balance: 325, beam: "24/24/24", length: 686, price: 285000, twCode: "WSP285" },
  { brand: "Wilson", name: "Shift 99 Pro V1", year: 2024, segment: "pro", weight: 315, headSize: 99, pattern: "16x20", stiffness: 63, swingWeight: 330, balance: 315, beam: "24/24/24", length: 686, price: 295000, twCode: "WSP315" },

  // Head 2024-2026
  { brand: "Head", name: "Speed Pro 2026", year: 2026, segment: "advanced", weight: 310, headSize: 100, pattern: "18x20", stiffness: null, swingWeight: null, balance: 310, beam: "23", length: 685, price: 305000, twCode: "HSPDP6", sourceUrl: "https://www.head.com/en_CA/product/speed-pro-2026-232006", measurementBasis: "unstrung" },
  { brand: "Head", name: "Speed MP 2026", year: 2026, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 63, swingWeight: 315, balance: 320, beam: "23/23/22", length: 686, price: 295000, twCode: "HSPMP6" },
  { brand: "Head", name: "Speed MP L 2026", year: 2026, segment: "intermediate", weight: 285, headSize: 100, pattern: "16x19", stiffness: null, swingWeight: null, balance: 325, beam: "23", length: 685, price: 279000, twCode: "HSMPL6", sourceUrl: "https://www.head.com/en_US/product/speed-mp-l-2026-232036", measurementBasis: "unstrung" },
  { brand: "Head", name: "Boom Pro 2026", year: 2026, segment: "advanced", weight: 310, headSize: 98, pattern: "16x19", stiffness: 64, swingWeight: 325, balance: 318, beam: "22/22/21", length: 686, price: 305000, twCode: "HBOOP6" },
  { brand: "Head", name: "Boom MP 2026", year: 2026, segment: "intermediate", weight: 295, headSize: 100, pattern: "16x19", stiffness: 64, swingWeight: 310, balance: 320, beam: "24/24/23", length: 686, price: 295000, twCode: "HBOMP6" },
  { brand: "Head", name: "Gravity MP 2025", year: 2025, segment: "intermediate", weight: 295, headSize: 100, pattern: "16x20", stiffness: 60, swingWeight: 315, balance: 325, beam: "22/22/22", length: 686, price: 295000, twCode: "HGMPXL" },
  { brand: "Head", name: "Gravity Pro 2025", year: 2025, segment: "advanced", weight: 315, headSize: 100, pattern: "16x20", stiffness: 60, swingWeight: 328, balance: 315, beam: "22/22/22", length: 686, price: 315000, twCode: "HGPRR" },
  { brand: "Head", name: "Extreme MP 2024", year: 2024, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 68, swingWeight: 316, balance: 325, beam: "23/26/21", length: 686, price: 285000, twCode: "HEMPL24" },
  { brand: "Head", name: "Prestige MP 2025", year: 2025, segment: "advanced", weight: 320, headSize: 98, pattern: "18x20", stiffness: 61, swingWeight: 333, balance: 310, beam: "21.5/21.5/21", length: 686, price: 315000, twCode: "HPRMP" },

  // Yonex 2025-2026
  { brand: "Yonex", name: "VCORE 100 2026", year: 2026, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 66, swingWeight: 313, balance: 320, beam: "24/25/22", length: 686, price: 345000, twCode: "VC108G" },
  { brand: "Yonex", name: "VCORE 98 2026", year: 2026, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 66, swingWeight: 320, balance: 320, beam: "22.5/22.5/21", length: 686, price: 345000, twCode: "VC988G" },
  { brand: "Yonex", name: "VCORE 100L 2026", year: 2026, segment: "beginner", weight: 280, headSize: 100, pattern: "16x19", stiffness: 66, swingWeight: 298, balance: 330, beam: "24/25/22", length: 686, price: 315000, twCode: "VC1L8G" },
  { brand: "Yonex", name: "EZONE 100 2025", year: 2025, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 67, swingWeight: 313, balance: 320, beam: "23.5/26/22", length: 686, price: 345000, twCode: "LEZ10B" },
  { brand: "Yonex", name: "EZONE 98 2025", year: 2025, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 67, swingWeight: 320, balance: 320, beam: "23/24/19.5", length: 686, price: 345000, twCode: "EZ98BB" },
  { brand: "Yonex", name: "EZONE 100L 2025", year: 2025, segment: "beginner", weight: 285, headSize: 100, pattern: "16x19", stiffness: 67, swingWeight: 298, balance: 330, beam: "23.5/26/22", length: 686, price: 315000, twCode: "EZ1LBB" },
  { brand: "Yonex", name: "Percept 97 2025", year: 2025, segment: "advanced", weight: 310, headSize: 97, pattern: "16x19", stiffness: 61, swingWeight: 322, balance: 315, beam: "21/21/21", length: 686, price: 345000, twCode: "PERM97" },
  { brand: "Yonex", name: "Percept 100D 2025", year: 2025, segment: "advanced", weight: 305, headSize: 100, pattern: "18x20", stiffness: 61, swingWeight: 318, balance: 320, beam: "22/23/20", length: 686, price: 345000, twCode: "PERM1D" },

  // Dunlop 2025
  { brand: "Dunlop", name: "FX 500 2025", year: 2025, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 67, swingWeight: 312, balance: 320, beam: "23/26/23", length: 686, price: 280000, twCode: "DF500" },
  { brand: "Dunlop", name: "FX 500 Tour 2025", year: 2025, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 65, swingWeight: 319, balance: 320, beam: "21.5/21.5/21.5", length: 686, price: 280000, twCode: "DF50T" },
  { brand: "Dunlop", name: "SX 300 2025", year: 2025, segment: "intermediate", weight: 300, headSize: 100, pattern: "16x19", stiffness: 68, swingWeight: 316, balance: 320, beam: "23/26/23", length: 686, price: 280000, twCode: "DSX3R" },
  { brand: "Dunlop", name: "SX 300 Tour 2025", year: 2025, segment: "advanced", weight: 310, headSize: 98, pattern: "16x19", stiffness: 66, swingWeight: 325, balance: 315, beam: "22/24/22", length: 686, price: 280000, twCode: "DSXTR" },
  { brand: "Dunlop", name: "CX 200 2025", year: 2025, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 63, swingWeight: 318, balance: 320, beam: "21.5/21.5/21.5", length: 686, price: 280000, twCode: "DCX2S" },

  // Tecnifibre 2024-2026
  { brand: "Tecnifibre", name: "TF-40 305 2024", year: 2024, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 60, swingWeight: 318, balance: 320, beam: "21.5/21.5/21.5", length: 686, price: 315000, twCode: "TF40R1" },
  { brand: "Tecnifibre", name: "T-Fight 305 Isoflex 2024", year: 2024, segment: "advanced", weight: 305, headSize: 98, pattern: "16x19", stiffness: 62, swingWeight: 318, balance: 320, beam: "22/24/22", length: 686, price: 295000, twCode: "TF305S" },
];

async function main() {
  // Step 1: Discontinue old models
  console.log("=== Step 1: 2022-2023 구형 단종 처리 ===\n");
  let discCount = 0;
  for (const name of DISCONTINUE_2022_2023) {
    const { error } = await supabase
      .from("racket_models")
      .update({ discontinued: true })
      .eq("name", name);
    if (!error) {
      discCount++;
      console.log(`✓ ${name} → discontinued`);
    }
  }
  console.log(`\n${discCount} models discontinued\n`);

  // Step 2: Add new models
  console.log("=== Step 2: 2024-2026 신규 모델 추가 ===\n");
  let addCount = 0;

  for (const r of NEW_RACKETS) {
    // Get brand ID
    const { data: brandData } = await supabase
      .from("brands")
      .select("id")
      .eq("name", r.brand)
      .single();

    if (!brandData) {
      console.log(`✗ ${r.brand}|${r.name} — brand not found`);
      continue;
    }

    // Check if model already exists
    const { data: existing } = await supabase
      .from("racket_models")
      .select("id")
      .eq("name", r.name)
      .eq("brand_id", brandData.id);

    if (existing && existing.length > 0) {
      // Reactivate if discontinued, update image
      await supabase
        .from("racket_models")
        .update({
          discontinued: false,
          image_url: twImg(r.twCode),
          release_year: r.year,
          segment: r.segment,
        })
        .eq("id", existing[0].id);
      console.log(`↺ ${r.brand}|${r.name} — reactivated`);
      addCount++;
      continue;
    }

    // Insert new model
    const { data: newModel, error: insertErr } = await supabase
      .from("racket_models")
      .insert({
        brand_id: brandData.id,
        name: r.name,
        release_year: r.year,
        segment: r.segment,
        discontinued: false,
        image_url: twImg(r.twCode),
      })
      .select("id")
      .single();

    if (insertErr || !newModel) {
      console.log(`✗ ${r.brand}|${r.name} — insert failed: ${insertErr?.message}`);
      continue;
    }

    // Insert specs
    await supabase.from("racket_specs").insert({
      racket_model_id: newModel.id,
      head_size_sq_in: r.headSize.toString(),
      weight_g: r.weight.toString(),
      balance_mm: r.balance.toString(),
      swing_weight_kg_cm2: r.swingWeight?.toString() ?? null,
      stiffness_ra: r.stiffness?.toString() ?? null,
      length_mm: r.length.toString(),
      beam_width_mm: r.beam,
      string_pattern: r.pattern,
      ingestion_state: "published",
    });

    // Insert variant with price
    await supabase.from("racket_variants").insert({
      racket_model_id: newModel.id,
      grip_size: "G2",
      weight_variant: "standard",
      region_code: "KR",
      available_in_korea: true,
      retail_price_krw: r.price,
    });

    // Compute and insert axis scores
    const { data: axisDefs } = await supabase
      .from("axis_definitions")
      .select("id, axis_key");

    if (axisDefs) {
      const scores = computeScores(r);
      for (const [axisKey, score] of Object.entries(scores)) {
        const axisDef = axisDefs.find(a => a.axis_key === axisKey);
        if (axisDef) {
          await supabase.from("racket_axis_scores").insert({
            racket_model_id: newModel.id,
            axis_definition_id: axisDef.id,
            scoring_version: "v1",
            score: score.toFixed(2),
            input_snapshot: {},
          });
        }
      }
    }

    addCount++;
    console.log(`✓ ${r.brand}|${r.name} — added`);
  }

  console.log(`\n${addCount} models added/reactivated`);

  // Step 3: Recalibrate scores
  console.log("\n=== Step 3: 점수 재보정 ===\n");
  await recalibrateScores();
}

function computeScores(r: NewRacket) {
  if (r.stiffness == null || r.swingWeight == null) return {};
  const NORM: Record<string, { min: number; max: number }> = {
    headSize: { min: 93, max: 115 },
    weight: { min: 250, max: 345 },
    balance: { min: 300, max: 350 },
    swingWeight: { min: 275, max: 345 },
    stiffness: { min: 50, max: 75 },
    beamWidth: { min: 18, max: 30 },
    stringDensity: { min: 280, max: 370 },
  };

  function norm(v: number, key: string) {
    const rng = NORM[key];
    return Math.max(0, Math.min(100, ((v - rng.min) / (rng.max - rng.min)) * 100));
  }

  const beamParts = r.beam.split("/").map(Number);
  const beamAvg = beamParts.reduce((a, b) => a + b, 0) / beamParts.length;
  const patternParts = r.pattern.match(/(\d+)x(\d+)/);
  const stringDensity = patternParts ? parseInt(patternParts[1]) * parseInt(patternParts[2]) : 304;

  const i = {
    headSize: norm(r.headSize, "headSize"),
    weight: norm(r.weight, "weight"),
    balance: norm(r.balance, "balance"),
    swingWeight: norm(r.swingWeight, "swingWeight"),
    stiffness: norm(r.stiffness, "stiffness"),
    beamWidth: norm(beamAvg, "beamWidth"),
    stringDensity: norm(stringDensity, "stringDensity"),
  };

  return {
    power: Math.round(0.35 * i.headSize + 0.30 * i.swingWeight + 0.20 * i.stiffness + 0.15 * i.weight),
    control: Math.round(0.35 * (100 - i.headSize) + 0.30 * i.stringDensity + 0.20 * i.weight + 0.15 * (100 - i.stiffness)),
    comfort: Math.round(0.45 * (100 - i.stiffness) + 0.35 * i.beamWidth + 0.20 * (100 - i.weight)),
    spin: Math.round(0.45 * (100 - i.stringDensity) + 0.30 * i.headSize + 0.25 * i.balance),
    stability: Math.round(0.35 * i.weight + 0.35 * i.swingWeight + 0.30 * i.headSize),
  };
}

async function recalibrateScores() {
  const { data: allScores } = await supabase
    .from("racket_axis_scores")
    .select("id, racket_model_id, score, axis_definitions!inner(axis_key)");

  const { data: activeModels } = await supabase
    .from("racket_models")
    .select("id")
    .eq("discontinued", false);

  const activeIds = new Set((activeModels ?? []).map(m => m.id));

  const byAxis: Record<string, { id: string; score: number }[]> = {};
  const byAxisActive: Record<string, number[]> = {};

  for (const s of (allScores ?? [])) {
    const key = (s.axis_definitions as unknown as { axis_key: string })?.axis_key;
    if (!key) continue;
    if (!byAxis[key]) byAxis[key] = [];
    byAxis[key].push({ id: s.id, score: Number(s.score) });
    if (activeIds.has(s.racket_model_id)) {
      if (!byAxisActive[key]) byAxisActive[key] = [];
      byAxisActive[key].push(Number(s.score));
    }
  }

  for (const [axis, activeScores] of Object.entries(byAxisActive)) {
    const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
    const shift = 50 - mean;
    console.log(`${axis}: mean=${mean.toFixed(1)}, shift=${shift.toFixed(1)}`);

    for (const entry of (byAxis[axis] ?? [])) {
      const newScore = Math.max(0, Math.min(100, entry.score + shift));
      await supabase
        .from("racket_axis_scores")
        .update({ score: newScore.toFixed(2) })
        .eq("id", entry.id);
    }
  }
  console.log("Recalibration complete");
}

main();
