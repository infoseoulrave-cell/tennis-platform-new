import type { RacketSpecInput } from "@/modules/recommendation/scoring-core";

export const CANONICAL_SUPABASE_PROJECT_REF = "ublovozxpoplfvacrmnh";
export const EXPECTED_ACTIVE_KR_RACKET_COUNT = 39;
export const EVIDENCE_MANIFEST_VERSION = "racket-score-evidence-2026-07-23-v1";
export const EVIDENCE_CAPTURED_AT = "2026-07-23T00:00:00.000+09:00";

const STATIC_FIELDS = [
  "headSizeSqIn",
  "weightG",
  "balanceMm",
  "beamWidthMm",
  "stringPattern",
] as const;

const MEASURED_FIELDS = ["swingWeightKgCm2", "stiffnessRa"] as const;

type CompleteRacketSpec = {
  [Field in keyof RacketSpecInput]: NonNullable<RacketSpecInput[Field]>;
};

type EvidenceSource = {
  role: "manufacturer_static" | "tennis_warehouse_measured";
  sourceType: "manufacturer" | "retailer_measurement";
  sourceUrl: string;
  measurementBasis: "unstrung" | "strung";
  reviewedFields: readonly string[];
  rawValues: Record<string, string | number>;
  sourceCode: string;
  capturedAt: string;
  note?: string;
};

export type RacketScoreEvidence = {
  identity: {
    brand: string;
    lookupModelName: string;
    modelName: string;
    releaseYear: number;
    productCode: string;
    legacyModelNames: readonly string[];
  };
  normalizedSpec: CompleteRacketSpec;
  sources: readonly [EvidenceSource, EvidenceSource];
};

type EvidenceInput = {
  brand: string;
  modelName: string;
  releaseYear: number;
  productCode: string;
  manufacturerUrl: string;
  tennisWarehouseUrl: string;
  normalizedSpec: CompleteRacketSpec;
  lookupModelName?: string;
  legacyModelNames?: readonly string[];
  manufacturerNote?: string;
  tennisWarehouseNote?: string;
};

function sourceCode(sourceUrl: string): string {
  const pathname = new URL(sourceUrl).pathname;
  const tennisWarehouseCode = pathname.match(
    /(?:descpage(?:RC[A-Z]+)?-|racquet_reviews\/)([A-Z0-9]+?)(?:review)?\.html$/i,
  )?.[1];
  if (tennisWarehouseCode) return tennisWarehouseCode.toUpperCase();
  return pathname.split("/").filter(Boolean).at(-1)?.replace(/\.html$/i, "") ?? pathname;
}

function evidence(input: EvidenceInput): RacketScoreEvidence {
  const lookupModelName = input.lookupModelName ?? input.modelName;
  const manufacturerSourceCode = sourceCode(input.manufacturerUrl);
  const tennisWarehouseSourceCode = sourceCode(input.tennisWarehouseUrl);
  const metadata = (role: EvidenceSource["role"], basis: EvidenceSource["measurementBasis"], code: string) => ({
    evidence_manifest_version: EVIDENCE_MANIFEST_VERSION,
    source_role: role,
    measurement_basis: basis,
    product_code: input.productCode,
    source_code: code,
    captured_at: EVIDENCE_CAPTURED_AT,
  });
  const staticRawValues = Object.fromEntries(
    STATIC_FIELDS.map((field) => [field, input.normalizedSpec[field]]),
  );
  const measuredRawValues = Object.fromEntries(
    MEASURED_FIELDS.map((field) => [field, input.normalizedSpec[field]]),
  );

  return {
    identity: {
      brand: input.brand,
      lookupModelName,
      modelName: input.modelName,
      releaseYear: input.releaseYear,
      productCode: input.productCode,
      legacyModelNames: input.legacyModelNames ?? [],
    },
    normalizedSpec: input.normalizedSpec,
    sources: [
      {
        role: "manufacturer_static",
        sourceType: "manufacturer",
        sourceUrl: input.manufacturerUrl,
        measurementBasis: "unstrung",
        reviewedFields: STATIC_FIELDS,
        rawValues: {
          ...metadata("manufacturer_static", "unstrung", manufacturerSourceCode),
          ...staticRawValues,
        },
        sourceCode: manufacturerSourceCode,
        capturedAt: EVIDENCE_CAPTURED_AT,
        note: input.manufacturerNote,
      },
      {
        role: "tennis_warehouse_measured",
        sourceType: "retailer_measurement",
        sourceUrl: input.tennisWarehouseUrl,
        measurementBasis: "strung",
        reviewedFields: MEASURED_FIELDS,
        rawValues: {
          ...metadata("tennis_warehouse_measured", "strung", tennisWarehouseSourceCode),
          ...measuredRawValues,
        },
        sourceCode: tennisWarehouseSourceCode,
        capturedAt: EVIDENCE_CAPTURED_AT,
        note: input.tennisWarehouseNote,
      },
    ],
  };
}

export const RACKET_SCORE_EVIDENCE: readonly RacketScoreEvidence[] = [
  evidence({
    brand: "Babolat",
    modelName: "Pure Aero 2026",
    releaseYear: 2026,
    productCode: "BPAR26",
    manufacturerUrl: "https://www.babolat.com/us/pure-aero-gen9-unstrung/101569.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_2026/descpage-BPAR26.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 321, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 320, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Aero 98 2026",
    releaseYear: 2026,
    productCode: "BPA98R",
    manufacturerUrl: "https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_98_2026/descpage-BPA98R.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "21/23/22",
      stringPattern: "16x20", swingWeightKgCm2: 322, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Aero Team 2026",
    releaseYear: 2026,
    productCode: "BPAT26",
    manufacturerUrl: "https://www.babolat.com/us/pure-aero-team-gen9-unstrung/101571.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_Team_2026/descpage-BPAT26.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 320, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 306, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Aero Lite 2026",
    releaseYear: 2026,
    productCode: "BPALTR",
    manufacturerUrl: "https://www.babolat.com/us/pure-aero-lite-gen9-unstrung/101572.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Aero_Lite_2026/descpage-BPALTR.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 270, balanceMm: 330, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 302, stiffnessRa: 65,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Drive 2025",
    releaseYear: 2025,
    productCode: "BPD25R",
    manufacturerUrl: "https://www.babolat.com/us/pure-drive-gen11-unstrung/100-101552.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Drive_2025/descpage-BPD25R.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 317, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Drive Lite 2025",
    releaseYear: 2025,
    productCode: "BPDLR",
    manufacturerUrl: "https://www.babolat.com/us/pure-drive-lite-gen11-unstrung/100-101555.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Drive_Lite_2025/descpage-BPDLR.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 270, balanceMm: 330, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 295, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Drive Team 2025",
    releaseYear: 2025,
    productCode: "BRPTR",
    manufacturerUrl: "https://www.babolat.com/us/pure-drive-team-gen11-unstrung/100-101554.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Drive_Team_2025/descpage-BRPTR.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 320, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 308, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Strike 98 16x19 2024",
    releaseYear: 2024,
    productCode: "PS9816",
    manufacturerUrl: "https://www.babolat.com/us/pure-strike-16-19-gen4-unstrung/3018-101577.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Strike_98_16x19_Carbon_Grey/descpage-PS9816.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 320, beamWidthMm: "21/23/21",
      stringPattern: "16x19", swingWeightKgCm2: 330, stiffnessRa: 64,
    },
    tennisWarehouseNote: "Carbon Grey is an alternate cosmetic of the same frame and generation.",
  }),
  evidence({
    brand: "Babolat",
    modelName: "Pure Strike 100 2024",
    releaseYear: 2024,
    productCode: "PS1019",
    manufacturerUrl: "https://www.babolat.com/us/pure-strike-100-gen4-unstrung/3018-101579.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Strike_100_Carbon_Grey/descpage-PS1019.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "21/23/21",
      stringPattern: "16x19", swingWeightKgCm2: 324, stiffnessRa: 63,
    },
    tennisWarehouseNote: "Carbon Grey is an alternate cosmetic of the same frame and generation.",
  }),
  evidence({
    brand: "Wilson",
    modelName: "Blade 98 16x19 V9",
    releaseYear: 2024,
    productCode: "WB9816",
    manufacturerUrl: "https://ph.wilson.com/products/wilson-blade-98-16x19-v9-roland-garros-2024-professional-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Blade_98_16x19_v9/descpage-WB9816.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 320, beamWidthMm: "20.6",
      stringPattern: "16x19", swingWeightKgCm2: 324, stiffnessRa: 62,
    },
    manufacturerNote: "The Roland Garros page is an alternate cosmetic of the same V9 frame.",
  }),
  evidence({
    brand: "Wilson",
    modelName: "Blade 98 18x20 V9",
    releaseYear: 2024,
    productCode: "WB18V",
    manufacturerUrl: "https://ph.wilson.com/products/blade-98-18x20-v9-3-tennis-professional-racket-wr149911u",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Blade_98_18x20_v9/descpage-WB18V.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 320, beamWidthMm: "20.6",
      stringPattern: "18x20", swingWeightKgCm2: 330, stiffnessRa: 60,
    },
  }),
  evidence({
    brand: "Wilson",
    modelName: "Blade 100L V9",
    releaseYear: 2024,
    productCode: "WB100L",
    manufacturerUrl: "https://ph.wilson.com/products/blade-100l-v9-tennis-professional-racket-wr150111u",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Blade_100L_v9/descpage-WB100L.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 330, beamWidthMm: "22/22/22",
      stringPattern: "16x19", swingWeightKgCm2: 308, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Wilson",
    modelName: "Pro Staff 97 V14",
    releaseYear: 2024,
    productCode: "W97V14",
    manufacturerUrl: "https://ph.wilson.com/products/pro-staff-97-v14-professional-tennis-racket-wr125711u",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Pro_Staff_97_v14/descpage-W97V14.html",
    normalizedSpec: {
      headSizeSqIn: 97, weightG: 315, balanceMm: 310, beamWidthMm: "21.5/21.5/21.5",
      stringPattern: "16x19", swingWeightKgCm2: 332, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Wilson",
    modelName: "Shift 99 V1",
    releaseYear: 2024,
    productCode: "WSP300D",
    manufacturerUrl: "https://ph.wilson.com/products/wilson-shift-99-v1-professional-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Shift_99/descpage-WSP300.html",
    normalizedSpec: {
      headSizeSqIn: 99, weightG: 300, balanceMm: 315, beamWidthMm: "23.5",
      stringPattern: "16x20", swingWeightKgCm2: 317, stiffnessRa: 67,
    },
  }),
  evidence({
    brand: "Wilson",
    modelName: "Shift 99 Pro V1",
    releaseYear: 2024,
    productCode: "WSP315",
    manufacturerUrl: "https://ph.wilson.com/products/wilson-shift-99-pro-v1-professional-racket-wr145411u",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Shift_99_Pro/descpage-WSP315.html",
    normalizedSpec: {
      headSizeSqIn: 99, weightG: 315, balanceMm: 315, beamWidthMm: "23.5",
      stringPattern: "18x20", swingWeightKgCm2: 332, stiffnessRa: 68,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Speed Pro 2026",
    releaseYear: 2026,
    productCode: "HSPDP6",
    manufacturerUrl: "https://www.head.com/en_US/product/speed-pro-2026-232006",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Speed_Pro_2026/descpage-HSPDP6.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 310, balanceMm: 310, beamWidthMm: "23",
      stringPattern: "18x20", swingWeightKgCm2: 328, stiffnessRa: 61,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Speed MP 2026",
    releaseYear: 2026,
    productCode: "HSPMP6",
    manufacturerUrl: "https://www.head.com/en_GB/product/speed-mp-2026-232026",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Speed_MP_2026/descpage-HSPMP6.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "23",
      stringPattern: "16x19", swingWeightKgCm2: 329, stiffnessRa: 60,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Speed MP L 2026",
    releaseYear: 2026,
    productCode: "HSMPL6",
    manufacturerUrl: "https://www.head.com/en_US/product/speed-mp-l-2026-232036",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Speed_MP_L_2026/descpage-HSMPL6.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 325, beamWidthMm: "23",
      stringPattern: "16x19", swingWeightKgCm2: 316, stiffnessRa: 61,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Boom Pro 2026",
    releaseYear: 2026,
    productCode: "HBOOP6",
    manufacturerUrl: "https://www.head.com/en_US/product/boom-pro-2026-232206",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Boom_Pro_2026/descpage-HBOOP6.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 310, balanceMm: 310, beamWidthMm: "22/22/21.5",
      stringPattern: "16x19", swingWeightKgCm2: 325, stiffnessRa: 64,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Boom MP 2026",
    releaseYear: 2026,
    productCode: "HBOMP6",
    manufacturerUrl: "https://www.head.com/en_US/product/boom-mp-2026-232216",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Boom_MP_2026/descpage-HBOMP6.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 295, balanceMm: 315, beamWidthMm: "23/24/22",
      stringPattern: "16x19", swingWeightKgCm2: 316, stiffnessRa: 61,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Gravity MP 2025",
    releaseYear: 2025,
    productCode: "HGMPG",
    manufacturerUrl: "https://www.head.com/nl_NL/product/gravity-mp-2025-231125",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Gravity_MP_2025/descpageRCHEAD-HGMPG.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 295, balanceMm: 325, beamWidthMm: "22",
      stringPattern: "16x20", swingWeightKgCm2: 323, stiffnessRa: 57,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Gravity Pro 2025",
    releaseYear: 2025,
    productCode: "HGPRR",
    manufacturerUrl: "https://www.head.com/en_US/product/gravity-pro-2025-231105",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Gravity_Pro_2025/descpage-HGPRR.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 315, balanceMm: 310, beamWidthMm: "20",
      stringPattern: "18x20", swingWeightKgCm2: 329, stiffnessRa: 59,
    },
  }),
  evidence({
    brand: "Head",
    modelName: "Extreme MP 2024",
    releaseYear: 2024,
    productCode: "HREM24",
    manufacturerUrl: "https://www.head.com/es_ES/product/extreme-mp-2024-231114",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Extreme_MP/descpageRCHEAD-HREM24.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "23/26/21",
      stringPattern: "16x19", swingWeightKgCm2: 323, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Head",
    lookupModelName: "Prestige MP 2025",
    modelName: "Prestige MP 2023",
    releaseYear: 2023,
    productCode: "HPRMP",
    legacyModelNames: ["Prestige MP 2025"],
    manufacturerUrl: "https://www.head.com/en_GB/product/prestige-mp-2023-236123",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Prestige_MP/descpage-HPRMP.html",
    normalizedSpec: {
      headSizeSqIn: 99, weightG: 310, balanceMm: 320, beamWidthMm: "21.5",
      stringPattern: "18x19", swingWeightKgCm2: 327, stiffnessRa: 62,
    },
    manufacturerNote: "The archived official product page and HPRMP page pin the 2023 MP identity.",
  }),
  evidence({
    brand: "Yonex",
    modelName: "VCORE 100 2026",
    releaseYear: 2026,
    productCode: "VC108G",
    manufacturerUrl: "https://us.yonex.com/products/08vcore-100",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_100_8th_Gen/descpage-VC108G.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "24/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 325, stiffnessRa: 65,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "VCORE 98 2026",
    releaseYear: 2026,
    productCode: "VC988G",
    manufacturerUrl: "https://us.yonex.com/products/vcore-98",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_98_8th_Gen/descpage-VC988G.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "23/23.5/22",
      stringPattern: "16x19", swingWeightKgCm2: 321, stiffnessRa: 63,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "VCORE 100L 2026",
    releaseYear: 2026,
    productCode: "VC1L8G",
    manufacturerUrl: "https://us.yonex.com/products/08vcore-100l",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_100L_8th_Gen/descpage-VC1L8G.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 280, balanceMm: 330, beamWidthMm: "24/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 313, stiffnessRa: 66,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "EZONE 100 2025",
    releaseYear: 2025,
    productCode: "EZ10BB",
    manufacturerUrl: "https://us.yonex.com/products/ezone-100",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_EZONE_100_2025/descpage-EZ10BB.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "24.5/26.5/23",
      stringPattern: "16x19", swingWeightKgCm2: 315, stiffnessRa: 68,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "EZONE 98 2025",
    releaseYear: 2025,
    productCode: "EZ98BB",
    manufacturerUrl: "https://us.yonex.com/products/ezone-98",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_EZONE_98_2025/descpage-EZ98BB.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "23.8/24.5/19.5",
      stringPattern: "16x19", swingWeightKgCm2: 320, stiffnessRa: 63,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "EZONE 100L 2025",
    releaseYear: 2025,
    productCode: "EZ1LBB",
    manufacturerUrl: "https://us.yonex.com/products/ezone-100-l",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_EZONE_100L_2025/descpage-EZ1LBB.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 325, beamWidthMm: "24.5/26.5/23",
      stringPattern: "16x19", swingWeightKgCm2: 310, stiffnessRa: 67,
    },
  }),
  evidence({
    brand: "Yonex",
    modelName: "Percept 97 2025",
    releaseYear: 2025,
    productCode: "PERM97",
    manufacturerUrl: "https://www.yonex.com/percept-97",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_Percept_97_Midnight_Navy/descpage-PERM97.html",
    normalizedSpec: {
      headSizeSqIn: 97, weightG: 310, balanceMm: 310, beamWidthMm: "21/21/21",
      stringPattern: "16x19", swingWeightKgCm2: 315, stiffnessRa: 60,
    },
    tennisWarehouseNote: "Midnight Navy is an alternate cosmetic of the same Percept frame.",
  }),
  evidence({
    brand: "Yonex",
    modelName: "Percept 100D 2025",
    releaseYear: 2025,
    productCode: "PERM1D",
    manufacturerUrl: "https://www.yonex.com/percept-100d",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_Percept_100D_Midnight_Navy/descpage-PERM1D.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 305, balanceMm: 315, beamWidthMm: "23",
      stringPattern: "18x19", swingWeightKgCm2: 318, stiffnessRa: 66,
    },
    tennisWarehouseNote: "Midnight Navy is an alternate cosmetic of the same Percept frame.",
  }),
  evidence({
    brand: "Dunlop",
    modelName: "FX 500 2025",
    releaseYear: 2025,
    productCode: "DF500",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/fx-series/fx-500/10369900.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_FX_500/descpage-DF500.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 320, stiffnessRa: 68,
    },
    manufacturerNote: "The live official page supplies static fields; its generation/year label may differ from the DB's retained 2025 label.",
  }),
  evidence({
    brand: "Dunlop",
    modelName: "FX 500 Tour 2025",
    releaseYear: 2025,
    productCode: "DF50T",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/fx-series/fx-500-tour/10369895.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_FX_500_Tour/descpage-DF50T.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "21/23/21",
      stringPattern: "16x19", swingWeightKgCm2: 322, stiffnessRa: 65,
    },
    manufacturerNote: "The live official page supplies static fields; its generation/year label may differ from the DB's retained 2025 label.",
  }),
  evidence({
    brand: "Dunlop",
    modelName: "SX 300 2025",
    releaseYear: 2025,
    productCode: "DSX3R",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/sx-series/sx-300-tennis-racket/10361528.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_SX_300_2025/descpage-DSX3R.html",
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 318, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Dunlop",
    modelName: "SX 300 Tour 2025",
    releaseYear: 2025,
    productCode: "DSXTR",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/sx-series/sx-300-tour-tennis-racket/10361521.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_SX_300_Tour/descpage-DSXTR.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "23/26/23",
      stringPattern: "16x19", swingWeightKgCm2: 321, stiffnessRa: 69,
    },
  }),
  evidence({
    brand: "Dunlop",
    modelName: "CX 200 2025",
    releaseYear: 2025,
    productCode: "DCX2S",
    manufacturerUrl: "https://sports.dunlop.co.jp/tennis/products/racket/25cx200bk.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_CX_200/descpage-DCX2S.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, beamWidthMm: "21.5/21.5/21.5",
      stringPattern: "16x19", swingWeightKgCm2: 308, stiffnessRa: 64,
    },
  }),
  evidence({
    brand: "Tecnifibre",
    modelName: "TF-40 305 2024",
    releaseYear: 2024,
    productCode: "TF40R1",
    manufacturerUrl: "https://www.tecnifibre.jp/products/tennis_racket/tf-40-305-16m/",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TF40_305g_16x19/descpage-TF40R1.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 325, beamWidthMm: "21.7",
      stringPattern: "16x19", swingWeightKgCm2: 320, stiffnessRa: 64,
    },
    manufacturerNote: "The official second-generation product page and 2024 catalog pin the reviewed unstrung static fields.",
    tennisWarehouseNote: "TF40R1 labels this second-generation 16x19 model as 2024 and pins SW/RA to the retained catalog generation.",
  }),
  evidence({
    brand: "Tecnifibre",
    lookupModelName: "T-Fight 305 Isoflex 2024",
    modelName: "T-Fight 305 Isoflex 2022",
    releaseYear: 2022,
    productCode: "ISO305",
    legacyModelNames: ["T-Fight 305 Isoflex 2024"],
    manufacturerUrl: "https://www.tecnifibre.jp/products/tennis_racket/t-fight-305-isoflex/",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/descpage-ISO305.html",
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 325, beamWidthMm: "22.5",
      stringPattern: "18x19", swingWeightKgCm2: 338, stiffnessRa: 64,
    },
    manufacturerNote: "The 2022 release remained in the 2024 catalog; the identity is not the later 305S generation.",
    tennisWarehouseNote: "ISO305 is the exact Isoflex review code; TF305S refers to the later 305S product.",
  }),
] as const;

export function parseBackfillArgs(args: readonly string[]): { apply: boolean } {
  for (const argument of args) {
    if (argument !== "--apply") {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { apply: args.includes("--apply") };
}

export function activeIdentityKey(brand: string, modelName: string): string {
  return `${brand}\u0000${modelName}`;
}

export function validateActiveCatalogIdentities(
  activeIdentityKeys: readonly string[],
): void {
  const active = new Set(activeIdentityKeys);
  if (
    activeIdentityKeys.length !== EXPECTED_ACTIVE_KR_RACKET_COUNT
    || active.size !== EXPECTED_ACTIVE_KR_RACKET_COUNT
  ) {
    throw new Error(
      `Expected exactly ${EXPECTED_ACTIVE_KR_RACKET_COUNT} active KR racket identities; received ${active.size}.`,
    );
  }

  for (const { identity } of RACKET_SCORE_EVIDENCE) {
    const lookupKey = activeIdentityKey(identity.brand, identity.lookupModelName);
    const canonicalKey = activeIdentityKey(identity.brand, identity.modelName);
    if (!active.has(lookupKey) && !active.has(canonicalKey)) {
      throw new Error(
        `Expected exactly ${EXPECTED_ACTIVE_KR_RACKET_COUNT} active KR racket identities; missing ${identity.brand} ${identity.modelName}.`,
      );
    }
  }

  const allowed = new Set(
    RACKET_SCORE_EVIDENCE.flatMap(({ identity }) => [
      activeIdentityKey(identity.brand, identity.lookupModelName),
      activeIdentityKey(identity.brand, identity.modelName),
    ]),
  );
  const unexpected = [...active].filter((key) => !allowed.has(key));
  if (unexpected.length > 0) {
    throw new Error(
      `Expected exactly ${EXPECTED_ACTIVE_KR_RACKET_COUNT} active KR racket identities; unexpected ${unexpected.join(", ")}.`,
    );
  }
}
