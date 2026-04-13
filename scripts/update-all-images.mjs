/**
 * update-all-images.mjs
 * Maps every DB racket to the best available local image and updates image_url.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMG_DIR = path.join(__dirname, "../public/images/rackets");

const SUPABASE_URL = "https://ublovozxpoplfvacrmnh.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibG92b3p4cG9wbGZ2YWNybW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY2MjA5MCwiZXhwIjoyMDkxMjM4MDkwfQ.BzIfTStL2UB5SWs0uyDgflDmonzmHM5SMauKc7q0yK0";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Complete mapping: racket_model.id → local filename in public/images/rackets/
const ID_TO_IMAGE = {
  // ── Wilson ──────────────────────────────────────────────────────────────────
  "8ce8295e-376d-4351-b645-85d1c658ffa0": "wilson-ultra-100-v4.svg",     // Ultra 108 v4
  "fd360ccd-f5ca-473e-9613-bd2ff1ae97f2": "wilson-burn-100-v5.svg",      // Burn 100S v5
  "59e4121c-2d17-4f2a-909a-e7fad20dbe5a": "wilson-pro-staff-97l-v14.svg",// Pro Staff 97L v13
  "967cd082-065d-4e74-bfe2-4a9ef49b12ea": "wilson-blade-98-v9.png",      // Juice 100S
  "13cdac3b-bd8f-4625-a966-c341d824002f": "wilson-shift-99-v1.png",      // Shift 99 Pro v1
  "25ba1279-6ca3-4f6e-aca0-d23995a07a3f": "wilson-shift-99-v1.png",      // Shift 99 v1
  "3cb0dd1d-177b-4ebc-a456-64858a059f9c": "wilson-ultra-100-v4.svg",     // Ultra Tour 95 v4
  "8a91f294-0cd7-46b7-92ad-5e9204440f3e": "wilson-clash-100-v3.png",     // Roland Garros Clash 100
  "061bcce8-91c9-4006-9a3a-46c0228b5e17": "wilson-pro-staff-97-v14.svg", // Six One 95 18x20
  "7cfcffd6-82e6-40dc-a1c7-99f73f1331c2": "wilson-blade-98-v9.png",      // Blade 98 v8 16x19
  "881929cb-c70c-401d-a0ef-21da5f0916ed": "wilson-blade-98s-v9.svg",     // Blade 98 v8 18x20
  "851216a1-1342-49cc-a7d1-44f0c12f169e": "wilson-clash-100-v3.png",     // Clash 100 v2
  "edf0257d-1f95-4528-b269-905385a0ad48": "wilson-clash-100l-v3.svg",    // Clash 100L v2
  "f5ab4d3c-c757-4410-a17c-93a1b40bb970": "wilson-ultra-100-v4.svg",     // Ultra 100 v4
  "6fdfb3ad-658c-4100-b097-cb776f14c94e": "wilson-pro-staff-97-v14.svg", // Pro Staff RF97 v13

  // ── Head ────────────────────────────────────────────────────────────────────
  "0ecdecdd-5749-4bc9-bb11-ce25f776b68a": "head-speed-pro-2026.svg",     // Speed Pro 2024
  "a3145adc-11c2-43f6-b9f3-6488ae523234": "head-prestige-mp.svg",        // Prestige Pro 2023
  "ba1b925b-efcf-4189-aefc-22b38093f880": "head-instinct-mp-2024.svg",   // Instinct MP 2022
  "b5904b22-7acf-4abc-aeca-2e0b538e1179": "head-boom-mp-2026.svg",       // MXG 5 2018
  "19402b8a-8d63-4a34-9781-3dced0e9eeab": "head-prestige-mp.svg",        // Ti.S6 2017
  "9762f41f-31c0-47b0-a168-aa823dac3fd4": "head-gravity-mp-2025.svg",    // Gravity Pro 2023
  "4cebf019-78d2-4e6d-93ce-b907cc88c36f": "head-speed-mp-l-2026.svg",    // Speed S 2024
  "35199fa8-7c48-42c0-adaf-40a20f2cb8f3": "head-speed-mp-2026.png",      // Speed MP 2024
  "2618dad0-295b-4040-9846-1b669b0a73dd": "head-radical-mp-2025.png",    // Radical MP 2023
  "2c7cbfc3-d65b-456f-8639-51bd38ed7ce3": "head-gravity-mp-2025.svg",    // Gravity MP 2023
  "32e5501a-928c-444a-ba81-4e938faf75f7": "head-boom-pro-2026.svg",      // Boom Pro 2022
  "7c4cdba8-2b3a-4983-b604-317a8fc699e2": "head-extreme-mp-2024.svg",    // Extreme MP 2022
  "16a7e49e-cdea-41c6-ab6e-1d72aff133fc": "head-prestige-mp.svg",        // Prestige MP 2023

  // ── Babolat ──────────────────────────────────────────────────────────────────
  "896d3b80-527b-4d91-96ca-e990bc1a4f65": "babolat-pure-aero-98-2023.svg",  // Pure Aero 2023
  "b939449a-8216-4319-a6bc-a7fe776af906": "babolat-pure-aero-team-2026.svg",// Pure Aero Team 2023
  "a5019e7d-23de-4ef0-a593-a782966a3bd0": "babolat-pure-strike-98-2024.svg",// Pure Strike 97 18x20
  "2163eef4-81ec-4f6f-8a23-f5d0bde5f9ba": "babolat-pure-aero-98-2026.svg",  // Pure Control 97 18x20
  "4822aefe-7d90-4406-bc62-f4b5a88ea870": "babolat-pure-aero-2026.png",     // Boost Aero
  "477aeb36-33ff-40e8-b35f-f895e2713309": "babolat-boost-drive-2024.svg",   // Boost Drive
  "f1394891-8519-407f-a290-d99a72ff21c4": "babolat-pure-aero-lite-2026.svg",// EVO Aero
  "ae28c369-baeb-4852-8723-1a0b184df58e": "babolat-pure-aero-lite-2026.svg",// Pure Aero Lite 2023
  "1a3133ce-f647-4f5d-9423-b1b2e40233f1": "babolat-pure-aero-98-2026.svg",  // Aero G
  "b3e6bf48-5984-47f8-9c38-f4e1299fd042": "babolat-pure-drive-2025.png",    // Pure Drive 2021
  "78d3b3c5-3d71-41ed-b3ef-eb37988f79f3": "babolat-pure-drive-team-2025.svg",// Pure Drive Team 2021
  "903c0c2f-1375-4d24-99b5-9780e5cf2e6f": "babolat-pure-drive-2025.png",    // Pure Drive 110 2021
  "2a07c854-ba81-4b56-ad77-e04d35a647c5": "babolat-pure-strike-100-2024.svg",// Pure Strike 100 16x19

  // ── Yonex ────────────────────────────────────────────────────────────────────
  "7c3166c6-46a6-4800-b8b0-95c66d7ff633": "yonex-vcore-pro-97-2024.svg",    // VCORE Pro 97 2021
  "e240b3c3-c416-450d-a9f7-393c7adf8980": "yonex-percept-97-2025.svg",      // Percept 97 2023
  "8d23c44a-6726-46c8-89ed-0a8f9ac355d8": "yonex-vcore-98-2026.svg",        // VCORE Pro 100 2021
  "929f977a-953f-4b24-b81b-502f3d0da188": "yonex-ezone-98-2025.png",        // SV 95i 2017
  "92f790f4-0370-4f35-9267-ba1f14bd5693": "yonex-vcore-100-2026.png",       // VCORE 110 2023
  "415e62a4-cbb6-46df-afcf-b52162eb8f9e": "yonex-percept-100d-2025.svg",    // Percept 97D 2023
  "67a2a415-d43f-462d-99cd-4fa126e7b566": "yonex-vcore-100l-2026.svg",      // VCORE Ace 2023
  "d64d6abc-0ec5-4bff-8e66-745e04fe4730": "yonex-ezone-100-2025.png",       // Ezone 100 2022
  "429fdc23-b2bf-4cc9-9333-59509c371b9c": "yonex-ezone-100l-2025.svg",      // Ezone 100SL 2022 (using 105 SVG)
  "11c3e28e-97ab-4ccb-870e-e9b898579bd1": "yonex-ezone-98-2025.png",        // Ezone 98 2022
  "79b54427-2bd8-49c4-9639-a1d72b4ff4bf": "yonex-ezone-105-2025.svg",       // Ezone 98L 2022
  "ba4506d3-0d2d-4b9c-9773-303ba08b2d93": "yonex-vcore-100-2026.png",       // VCORE 100 2023
  "2f64baab-8824-4779-974d-ac79daaeed3c": "yonex-vcore-100l-2026.svg",      // VCORE 100L 2023
  "e401aa91-0264-41cf-9c17-f394d3a52281": "yonex-vcore-98-2026.svg",        // VCORE 98 2023
  "1cd38122-21df-41ce-b624-6292c940e474": "yonex-percept-100-2025.png",     // Percept 100 2023

  // ── Dunlop ───────────────────────────────────────────────────────────────────
  "669b64fe-9a13-4817-8ba0-f1576f862bd7": "dunlop-cx-200-16x19-2025.svg",   // CX Pro 255 2021
  "56e0b167-8ae1-443c-bc0b-3e37610ca5b2": "dunlop-fx-500.png",              // Biomimetic 500 2015
  "54c62cae-e0bd-4aa5-be88-9fab9e6472ef": "dunlop-fx-500.png",              // FX 500 2023
  "01b26e8b-ee2e-4b7a-8f02-8b2555033ed8": "dunlop-fx-700-2024.svg",         // FX 500 Tour 2023
  "c4a8c54c-e4df-4a33-b2ff-cf66f3a2066e": "dunlop-cx-400-tour.svg",         // CX 400 Tour 2021
  "04f5e043-9f32-4f2d-aaa9-e0b2d9f4ac6e": "dunlop-cx-200-16x19-2025.svg",   // CX 200 2021
  "1f8256ec-b868-47cd-b7de-0a51f30e647d": "dunlop-cx-200-18x20.svg",        // CX 200 Tour 18x20 2021
  "1a53fac9-31a0-43ec-bfaf-903060cc4060": "dunlop-sx-300-2025.svg",         // SX 300 2022
  "ef84c57f-d634-4930-aad8-f326ca6dc1da": "dunlop-sx-300-ls.svg",           // SX 300 Lite 2022
  "227b2a53-f04d-445c-a597-d012130b195a": "dunlop-sx-300-tour-2025.svg",    // SX 300 Tour 2022

  // ── Prince ───────────────────────────────────────────────────────────────────
  "acdc06a4-699c-4100-892e-561da60f27da": "prince-ats-textreme-tour-100.svg",// Textreme Tour 100P
  "6727a0b2-cda3-4a05-8997-2929476ec379": "prince-ats-textreme-tour-98.svg", // Textreme Tour 98
  "265ddb28-8f03-4623-8708-13e55cf5db55": "prince-tour-100-310-2024.svg",    // Spectrum 105
  "94239935-e5c0-4911-be71-b183d4c6f601": "prince-ripstick-100-2024.svg",    // Ripcord 100
  "a9d62380-9ea6-422e-a82c-d629a4cb3b38": "prince-phantom-107g.svg",         // Warrior 107
  "3db7910c-5c70-42e1-90f4-6f39ef17a0ed": "prince-textreme-beast-100.svg",   // Beast 100
  "428b7176-60ca-4f4c-aa2f-0e218e706f94": "prince-phantom-100x.png",         // Phantom 100P 18x20

  // ── Tecnifibre ──────────────────────────────────────────────────────────────
  "f0349ece-b573-4b43-9d01-7abe6305c9ff": "tecnifibre-tf40-305.svg",         // TF40 305 18x20
  "8ad7acb7-ba53-4fd4-b707-ad21ab034690": "tecnifibre-tf40-305.svg",         // TF40 315 16x19
  "3df3e4e3-36aa-46bc-ad7a-3cb85303fbdf": "tecnifibre-tfight-305-iso.svg",   // TFight 300 Isoflex 2023
  "59bf5f55-ec0d-4573-a323-f1ee9058207b": "tecnifibre-tfight-305-iso.svg",   // TFight 295 Isoflex 2023
  "a3108f8e-d0de-4ed5-8864-602d3151359f": "tecnifibre-tfight-305-iso.svg",   // TFight 265 Isoflex 2023
  "135fa7fe-dc63-4aff-b3b9-937f2057daf9": "tecnifibre-tempo-298-2024.svg",   // Tempo 298 IGA
  "371bd1dc-b81e-478e-8896-178de0855737": "tecnifibre-tempo-305-2024.svg",   // T-Rebound 298 IGA
};

async function main() {
  console.log("Verifying local files exist...");
  const missing = [];
  for (const [id, filename] of Object.entries(ID_TO_IMAGE)) {
    if (!fs.existsSync(path.join(IMG_DIR, filename))) {
      missing.push({ id, filename });
    }
  }
  if (missing.length) {
    console.log(`Warning: ${missing.length} files not found locally:`);
    missing.forEach(({ filename }) => console.log(`  - ${filename}`));
  } else {
    console.log("All local files present ✓");
  }

  console.log("\nUpdating DB image_url for all 80 rackets...");
  let updated = 0;
  let errors = 0;

  for (const [id, filename] of Object.entries(ID_TO_IMAGE)) {
    const localPath = path.join(IMG_DIR, filename);
    // Fall back to a PNG version if SVG missing
    const actualFile = fs.existsSync(localPath)
      ? filename
      : filename.replace(".svg", ".png");

    const imageUrl = `/images/rackets/${actualFile}`;
    const { error } = await supabase
      .from("racket_models")
      .update({ image_url: imageUrl })
      .eq("id", id);

    if (!error) {
      console.log(`  ✓ [${id.slice(0, 8)}] → ${imageUrl}`);
      updated++;
    } else {
      console.log(`  ✗ [${id.slice(0, 8)}] DB error: ${error.message}`);
      errors++;
    }
  }

  console.log(`\nResult: ${updated} updated, ${errors} errors`);

  // Verify coverage
  const { data: nulls } = await supabase
    .from("racket_models")
    .select("id, name, brands(name)")
    .is("image_url", null);

  if (!nulls || nulls.length === 0) {
    console.log("✓ 100% image coverage!");
  } else {
    console.log(`\n${nulls.length} rackets still missing image:`);
    nulls.forEach((r) => console.log(`  - ${r.brands?.name} ${r.name} [${r.id}]`));
  }

  // Check axis scores
  const { data: allRackets } = await supabase
    .from("racket_models")
    .select("id, name, brands(name)");

  const { data: scores } = await supabase
    .from("racket_axis_scores")
    .select("racket_model_id");

  const coveredIds = new Set((scores || []).map((s) => s.racket_model_id));
  const noScores = (allRackets || []).filter((r) => !coveredIds.has(r.id));

  console.log(`\n5-axis score coverage: ${coveredIds.size}/${(allRackets || []).length} rackets`);
  if (noScores.length) {
    console.log("Missing scores:");
    noScores.forEach((r) => console.log(`  - ${r.brands?.name} ${r.name} [${r.id}]`));
  } else {
    console.log("✓ All rackets have 5-axis scores!");
  }
}

main().catch(console.error);
