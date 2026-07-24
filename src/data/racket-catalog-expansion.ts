import {
  computeAxisScores,
  type AxisScore,
  type RacketSpecInput,
} from "@/modules/recommendation/scoring-core";

export const CATALOG_EXPANSION_MANIFEST_VERSION =
  "racket-catalog-expansion-2026-07-24-v1";
export const CATALOG_EXPANSION_CAPTURED_AT =
  "2026-07-24T00:00:00.000+09:00";
export const CATALOG_EXPANSION_COUNT = 15;
export const TARGET_ACTIVE_KR_RACKET_COUNT = 54;

export const CATALOG_EXPANSION_REVIEWED_FIELDS = [
  "headSizeSqIn",
  "weightG",
  "balanceMm",
  "lengthMm",
  "beamWidthMm",
  "stringPattern",
  "swingWeightKgCm2",
  "stiffnessRa",
] as const;

export type CatalogExpansionField =
  (typeof CATALOG_EXPANSION_REVIEWED_FIELDS)[number];

export type CatalogExpansionSpec = {
  headSizeSqIn: number;
  weightG: number;
  balanceMm: number;
  lengthMm: number;
  beamWidthMm: string;
  stringPattern: string;
  swingWeightKgCm2: number;
  stiffnessRa: number;
};

export type CatalogExpansionRawSpec = Record<
  CatalogExpansionField,
  string | null
>;

export type CatalogExpansionSource = {
  role: "manufacturer_static" | "tennis_warehouse_measured";
  sourceType: "manufacturer" | "retailer_measurement";
  sourceUrl: string;
  measurementBasis: "unstrung" | "strung";
  reviewedFields: readonly CatalogExpansionField[];
  rawValues: Record<string, string | number | null>;
  capturedAt: string;
};

export type CatalogExpansionNormalizationDecision = {
  field: CatalogExpansionField;
  selectedSourceRole: CatalogExpansionSource["role"];
  reason: string;
};

export type CatalogExpansionEntry = {
  brand: string;
  modelName: string;
  slug: string;
  releaseYear: number;
  segment: "beginner" | "intermediate" | "advanced";
  productCode: string;
  imageUrl: string;
  normalizedSpec: CatalogExpansionSpec;
  sources: readonly [CatalogExpansionSource, CatalogExpansionSource];
  normalizationDecisions: readonly CatalogExpansionNormalizationDecision[];
  axisScores: readonly AxisScore[];
};

type CatalogExpansionInput = Omit<
  CatalogExpansionEntry,
  "imageUrl" | "sources" | "normalizationDecisions" | "axisScores"
> & {
  manufacturerUrl: string;
  tennisWarehouseUrl: string;
  manufacturerRawValues: CatalogExpansionRawSpec;
  tennisWarehouseRawValues: CatalogExpansionRawSpec;
  tennisWarehouseSelectedFields?: readonly CatalogExpansionField[];
};

const DEFAULT_TENNIS_WAREHOUSE_FIELDS = [
  "swingWeightKgCm2",
  "stiffnessRa",
] as const satisfies readonly CatalogExpansionField[];

function sourceCode(sourceUrl: string): string {
  const pathname = new URL(sourceUrl).pathname;
  const tennisWarehouseCode = pathname.match(
    /(?:descpage(?:RC[A-Z]+)?-)([A-Z0-9]+)\.html$/i,
  )?.[1];
  return (
    tennisWarehouseCode?.toUpperCase()
    ?? pathname.split("/").filter(Boolean).at(-1)?.replace(/\.html$/i, "")
    ?? pathname
  );
}

function rawValues(
  input: CatalogExpansionInput,
  role: CatalogExpansionSource["role"],
  measurementBasis: CatalogExpansionSource["measurementBasis"],
  sourceUrl: string,
  capturedValues: CatalogExpansionRawSpec,
): Record<string, string | number | null> {
  return {
    evidence_manifest_version: CATALOG_EXPANSION_MANIFEST_VERSION,
    source_role: role,
    measurement_basis: measurementBasis,
    product_code: input.productCode,
    source_code: sourceCode(sourceUrl),
    captured_at: CATALOG_EXPANSION_CAPTURED_AT,
    ...capturedValues,
  };
}

function catalogEntry(input: CatalogExpansionInput): CatalogExpansionEntry {
  const requestedTennisWarehouseFields = new Set<CatalogExpansionField>([
    ...DEFAULT_TENNIS_WAREHOUSE_FIELDS,
    ...(input.tennisWarehouseSelectedFields ?? []),
  ]);
  const selectedSourceRole = (field: CatalogExpansionField) => {
    if (
      requestedTennisWarehouseFields.has(field)
      || input.manufacturerRawValues[field] === null
    ) {
      return "tennis_warehouse_measured" as const;
    }
    return "manufacturer_static" as const;
  };
  const tennisWarehouseFields = CATALOG_EXPANSION_REVIEWED_FIELDS.filter(
    (field) => selectedSourceRole(field) === "tennis_warehouse_measured",
  );
  const manufacturerFields = CATALOG_EXPANSION_REVIEWED_FIELDS.filter(
    (field) => selectedSourceRole(field) === "manufacturer_static",
  );
  const normalizationDecisions = CATALOG_EXPANSION_REVIEWED_FIELDS.map(
    (field): CatalogExpansionNormalizationDecision => {
      const role = selectedSourceRole(field);
      const selectedRawValue = role === "manufacturer_static"
        ? input.manufacturerRawValues[field]
        : input.tennisWarehouseRawValues[field];
      const alternateRawValue = role === "manufacturer_static"
        ? input.tennisWarehouseRawValues[field]
        : input.manufacturerRawValues[field];
      if (selectedRawValue === null) {
        throw new Error(
          `Selected source does not publish ${input.slug} ${field}.`,
        );
      }
      const selectionBasis = role === "manufacturer_static"
        ? "the canonical static specification uses the manufacturer's unstrung basis"
        : input.manufacturerRawValues[field] === null
          ? "the manufacturer page does not publish this field"
          : "the reviewed policy uses Tennis Warehouse's strung measurement for this field";
      const alternate = alternateRawValue === null
        ? "The alternate source does not publish a value."
        : `The alternate source value (${alternateRawValue}) remains recorded for comparison.`;
      return {
        field,
        selectedSourceRole: role,
        reason:
          `${CATALOG_EXPANSION_MANIFEST_VERSION}: selected ${role} raw value `
          + `"${selectedRawValue}" because ${selectionBasis}; normalized to `
          + `"${input.normalizedSpec[field]}". ${alternate}`,
      };
    },
  );
  const scoringInput: RacketSpecInput = input.normalizedSpec;
  const axisScores = computeAxisScores(scoringInput);

  if (
    axisScores.length !== 5
    || axisScores.some(
      ({ score }) => !Number.isInteger(score) || score < 0 || score > 100,
    )
  ) {
    throw new Error(`Invalid v3 scores for ${input.brand} ${input.modelName}.`);
  }

  const imageUrl =
    `https://img.tennis-warehouse.com/watermark/rs.php?path=${input.productCode}-1.jpg&nw=500`;

  return {
    brand: input.brand,
    modelName: input.modelName,
    slug: input.slug,
    releaseYear: input.releaseYear,
    segment: input.segment,
    productCode: input.productCode,
    imageUrl,
    normalizedSpec: input.normalizedSpec,
    sources: [
      {
        role: "manufacturer_static",
        sourceType: "manufacturer",
        sourceUrl: input.manufacturerUrl,
        measurementBasis: "unstrung",
        reviewedFields: manufacturerFields,
        rawValues: rawValues(
          input,
          "manufacturer_static",
          "unstrung",
          input.manufacturerUrl,
          input.manufacturerRawValues,
        ),
        capturedAt: CATALOG_EXPANSION_CAPTURED_AT,
      },
      {
        role: "tennis_warehouse_measured",
        sourceType: "retailer_measurement",
        sourceUrl: input.tennisWarehouseUrl,
        measurementBasis: "strung",
        reviewedFields: tennisWarehouseFields,
        rawValues: rawValues(
          input,
          "tennis_warehouse_measured",
          "strung",
          input.tennisWarehouseUrl,
          input.tennisWarehouseRawValues,
        ),
        capturedAt: CATALOG_EXPANSION_CAPTURED_AT,
      },
    ],
    normalizationDecisions,
    axisScores,
  };
}

export const RACKET_CATALOG_EXPANSION: readonly CatalogExpansionEntry[] = [
  catalogEntry({
    brand: "Wilson",
    modelName: "Blade 98 16x19 V10",
    slug: "wilson-blade-98-16x19-v10-2026",
    releaseYear: 2026,
    segment: "advanced",
    productCode: "WB9810",
    manufacturerUrl: "https://au.wilson.com/products/blade-98-16x19-v10-tennis-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Blade_98_16x19_v10/descpage-WB9810.html",
    manufacturerRawValues: {
      headSizeSqIn: "98 sq in / 632 sq cm",
      weightG: "305 g unstrung",
      balanceMm: "32 cm unstrung / -7 HL",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: null,
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "13 in / 33.02 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "21.5 mm / 21.5 mm / 20.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "322",
      stiffnessRa: "61",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "21.5/21.5/20.5", stringPattern: "16x19",
      swingWeightKgCm2: 322, stiffnessRa: 61,
    },
  }),
  catalogEntry({
    brand: "Wilson",
    modelName: "Ultra 100 V5",
    slug: "wilson-ultra-100-v5-2025",
    releaseYear: 2025,
    segment: "intermediate",
    productCode: "WU1005",
    manufacturerUrl: "https://au.wilson.com/products/ultra-100-v5-tennis-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Ultra_100_v5/descpage-WU1005.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 sq in / 645 sq cm",
      weightG: "300 g unstrung",
      balanceMm: "32 cm unstrung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: null,
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "11.2 oz / 318 g strung",
      balanceMm: "13 in / 33.02 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "24 mm / 26.5 mm / 24.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "322",
      stiffnessRa: "67",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "24/26.5/24.5", stringPattern: "16x19",
      swingWeightKgCm2: 322, stiffnessRa: 67,
    },
  }),
  catalogEntry({
    brand: "Head",
    modelName: "Radical MP 2025",
    slug: "head-radical-mp-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "HRMP",
    manufacturerUrl: "https://www.head.com/en_US/product/radical-mp-2025-231015",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Radical_MP_2025/descpage-HRMP.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "300 g / 10.6 oz unstrung",
      balanceMm: "320 mm / 1 in HL unstrung",
      lengthMm: null,
      beamWidthMm: "20 / 23 / 21 mm",
      stringPattern: "16 / 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.2 oz / 318 g strung",
      balanceMm: "13 in / 33.02 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "20 mm / 23 mm / 21 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "323",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 300, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "20/23/21", stringPattern: "16x19",
      swingWeightKgCm2: 323, stiffnessRa: 66,
    },
  }),
  catalogEntry({
    brand: "Babolat",
    modelName: "Pure Drive 98 Gen11",
    slug: "babolat-pure-drive-98-gen11-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "PD98R",
    manufacturerUrl: "https://www.babolat.com/us/pure-drive-98-gen11-unstrung/100-101551.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Babolat_Pure_Drive_98_2025/descpageRCBAB-PD98R.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "305 g +/- 7 / 10.8 oz unstrung",
      balanceMm: "325 mm +/- 7 mm unstrung",
      lengthMm: "685 mm / 27 in",
      beamWidthMm: "21 / 23 / 22 mm",
      stringPattern: "16 / 20",
      swingWeightKgCm2: "300",
      stiffnessRa: "73 +/- 3",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "13.18 in / 33.48 cm / 3 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "21 mm / 23 mm / 21 mm",
      stringPattern: "16 Mains / 20 Crosses",
      swingWeightKgCm2: "326",
      stiffnessRa: "69",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "21/23/22", stringPattern: "16x20",
      swingWeightKgCm2: 326, stiffnessRa: 69,
    },
  }),
  catalogEntry({
    brand: "Wilson",
    modelName: "Clash 100 V3",
    slug: "wilson-clash-100-v3-2025",
    releaseYear: 2025,
    segment: "beginner",
    productCode: "CL103V",
    manufacturerUrl: "https://au.wilson.com/products/clash-100-v3-tennis-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/descpage-CL103V.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 sq in",
      weightG: "293 g unstrung",
      balanceMm: "31 cm / -10 pts unstrung",
      lengthMm: "27 in",
      beamWidthMm: null,
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "11 oz / 312 g strung",
      balanceMm: "12.59 in / 31.98 cm / 7 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "24.5 mm / 24.5 mm / 24.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "308",
      stiffnessRa: "54",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 293, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "24.5/24.5/24.5", stringPattern: "16x19",
      swingWeightKgCm2: 308, stiffnessRa: 54,
    },
  }),
  catalogEntry({
    brand: "Yonex",
    modelName: "VCORE 95 8th Gen",
    slug: "yonex-vcore-95-8th-gen-2026",
    releaseYear: 2026,
    segment: "advanced",
    productCode: "VC958G",
    manufacturerUrl: "https://us.yonex.com/products/vcore-95",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_VCORE_95_8th_Gen/descpage-VC958G.html",
    manufacturerRawValues: {
      headSizeSqIn: "95 (unit unstated)",
      weightG: "310 g / 10.9 oz unstrung",
      balanceMm: null,
      lengthMm: "27 (unit unstated)",
      beamWidthMm: "22.0 mm / 22.0 mm / 21.0 mm",
      stringPattern: "16 x 20",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "95 in² / 612.9 cm²",
      weightG: "11.5 oz / 326 g strung",
      balanceMm: "12.59 in / 31.98 cm / 7 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 22 mm / 22 mm",
      stringPattern: "16 Mains / 20 Crosses",
      swingWeightKgCm2: "323",
      stiffnessRa: "62",
    },
    normalizedSpec: {
      headSizeSqIn: 95, weightG: 310, balanceMm: 319.8, lengthMm: 685.8,
      beamWidthMm: "22/22/21", stringPattern: "16x20",
      swingWeightKgCm2: 323, stiffnessRa: 62,
    },
  }),
  catalogEntry({
    brand: "Yonex",
    modelName: "EZONE 98 Tour",
    slug: "yonex-ezone-98-tour-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "TEZ98B",
    manufacturerUrl: "https://us.yonex.com/products/ezone-98-tour",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Yonex_EZONE_98_Tour_2025/descpageRCYONEX-TEZ98B.html",
    manufacturerRawValues: {
      headSizeSqIn: "98 (unit unstated)",
      weightG: "315 g / 11.1 oz unstrung",
      balanceMm: "320 mm unstrung",
      lengthMm: "27 (unit unstated)",
      beamWidthMm: "23.8 mm / 24.5 mm / 19.5 mm",
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.7 oz / 332 g strung",
      balanceMm: "12.99 in / 32.99 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "23.8 mm / 24.5 mm / 19.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "335",
      stiffnessRa: "62",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 315, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "23.8/24.5/19.5", stringPattern: "16x19",
      swingWeightKgCm2: 335, stiffnessRa: 62,
    },
  }),
  catalogEntry({
    brand: "Tecnifibre",
    modelName: "T-FIGHT 300",
    slug: "tecnifibre-t-fight-300-2025",
    releaseYear: 2025,
    segment: "intermediate",
    productCode: "TF30ST",
    manufacturerUrl: "https://www.tecnifibre.com/en/collections/raquettes-de-tennis/products/t-fight-300",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TFight_300/descpageRCTFUSA-TF30ST.html",
    manufacturerRawValues: {
      headSizeSqIn: "645 cm² / 100 in²",
      weightG: "300 g / 10.6 oz unstrung",
      balanceMm: "320 mm unstrung",
      lengthMm: "68.6 cm",
      beamWidthMm: "23 mm / 23.5 mm / 23 mm",
      stringPattern: "16 x 19 unstrung",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "11.2 oz / 318 g strung",
      balanceMm: "12.99 in / 32.99 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22.5 mm / 22.5 mm / 22.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "318",
      stiffnessRa: "65",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "23/23.5/23", stringPattern: "16x19",
      swingWeightKgCm2: 318, stiffnessRa: 65,
    },
  }),
  catalogEntry({
    brand: "Prince",
    modelName: "Tour 98",
    slug: "prince-tour-98-2026",
    releaseYear: 2026,
    segment: "advanced",
    productCode: "PTR698",
    manufacturerUrl: "https://princetennis.jp/product-category/tennis/tennis-racket/tennis-racket-tour-2026",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Prince_Tour_98_2026/descpage-PTR698.html",
    manufacturerRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "305 g average",
      balanceMm: "315 mm",
      lengthMm: "27 in",
      beamWidthMm: "23.5 mm / 23.5 mm / 21 mm",
      stringPattern: "16 x 19",
      swingWeightKgCm2: "290",
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "12.79 in / 32.49 cm / 6 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "23 mm / 23 mm / 20 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "323",
      stiffnessRa: "64",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, lengthMm: 685.8,
      beamWidthMm: "23.5/23.5/21", stringPattern: "16x19",
      swingWeightKgCm2: 323, stiffnessRa: 64,
    },
  }),
  catalogEntry({
    brand: "Wilson",
    modelName: "Blade 100 V10",
    slug: "wilson-blade-100-v10-2026",
    releaseYear: 2026,
    segment: "intermediate",
    productCode: "WB1001",
    manufacturerUrl: "https://au.wilson.com/products/blade-100-v10-tennis-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Blade_100_v10/descpage-WB1001.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 sq in / 645 sq cm",
      weightG: "300 g unstrung",
      balanceMm: "-7 HL / 32 cm unstrung",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: null,
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "11.2 oz / 318 g strung",
      balanceMm: "13 in / 33.02 cm / 4 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 22 mm / 22 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "319",
      stiffnessRa: "61",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "22/22/22", stringPattern: "16x19",
      swingWeightKgCm2: 319, stiffnessRa: 61,
    },
  }),
  catalogEntry({
    brand: "Wilson",
    modelName: "Ultra 99 Pro V5",
    slug: "wilson-ultra-99-pro-v5-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "WU99P5",
    manufacturerUrl: "https://au.wilson.com/products/ultra-99-pro-v5-tennis-racket",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Wilson_Ultra_99_Pro_v5/descpage-WU99P5.html",
    manufacturerRawValues: {
      headSizeSqIn: "99 sq in / 639 sq cm",
      weightG: "305 g unstrung",
      balanceMm: "32.5 cm unstrung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: null,
      stringPattern: "16 x 18",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "99 in² / 638.71 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "13.17 in / 33.45 cm / 3 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 23.5 mm / 21.5 mm",
      stringPattern: "16 Mains / 18 Crosses",
      swingWeightKgCm2: "330",
      stiffnessRa: "69",
    },
    normalizedSpec: {
      headSizeSqIn: 99, weightG: 305, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "22/23.5/21.5", stringPattern: "16x18",
      swingWeightKgCm2: 330, stiffnessRa: 69,
    },
  }),
  catalogEntry({
    brand: "Head",
    modelName: "Radical Pro 2025",
    slug: "head-radical-pro-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "HPRR",
    manufacturerUrl: "https://www.head.com/en_US/product/radical-pro-2025-231005",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Radical_Pro_2025/descpageRCHEAD-HPRR.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "315 g / 11.1 oz unstrung",
      balanceMm: "315 mm / 1 in HL unstrung",
      lengthMm: null,
      beamWidthMm: "20 mm / 21.5 mm / 21 mm",
      stringPattern: "16 / 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.7 oz / 332 g strung",
      balanceMm: "12.75 in / 32.39 cm / 6 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "20 mm / 21.5 mm / 21 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "329",
      stiffnessRa: "65",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 315, balanceMm: 315, lengthMm: 685.8,
      beamWidthMm: "20/21.5/21", stringPattern: "16x19",
      swingWeightKgCm2: 329, stiffnessRa: 65,
    },
  }),
  catalogEntry({
    brand: "Head",
    modelName: "Extreme Pro 2024",
    slug: "head-extreme-pro-2024",
    releaseYear: 2024,
    segment: "advanced",
    productCode: "HREP24",
    manufacturerUrl: "https://www.head.com/en_US/product/extreme-pro-2024-231104",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Extreme_Pro_2024/descpage-HREP24.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "305 g / 10.8 oz unstrung",
      balanceMm: "315 mm / 1 in HL unstrung",
      lengthMm: null,
      beamWidthMm: "22 mm / 23 mm / 21 mm",
      stringPattern: "16 / 19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in² / 632.26 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "12.79 in / 32.49 cm / 6 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 23 mm / 21 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "322",
      stiffnessRa: "64",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, lengthMm: 685.8,
      beamWidthMm: "22/23/21", stringPattern: "16x19",
      swingWeightKgCm2: 322, stiffnessRa: 64,
    },
  }),
  catalogEntry({
    brand: "Head",
    modelName: "Gravity Team 2025",
    slug: "head-gravity-team-2025",
    releaseYear: 2025,
    segment: "beginner",
    productCode: "HRTMPG",
    manufacturerUrl: "https://www.head.com/en_US/product/gravity-team-2025-231145",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Head_Gravity_Team_2025/descpage-HRTMPG.html",
    manufacturerRawValues: {
      headSizeSqIn: "670 cm² / 104 in²",
      weightG: "270 g / 9.5 oz unstrung",
      balanceMm: "325 mm / 0.7 in HL unstrung",
      lengthMm: null,
      beamWidthMm: "24 mm",
      stringPattern: "16 / 20",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "104 in² / 670.97 cm²",
      weightG: "10 oz / 283 g strung",
      balanceMm: "13.18 in / 33.48 cm / 3 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "24 mm / 24 mm / 24 mm",
      stringPattern: "16 Mains / 20 Crosses",
      swingWeightKgCm2: "304",
      stiffnessRa: "57",
    },
    normalizedSpec: {
      headSizeSqIn: 104, weightG: 270, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "24/24/24", stringPattern: "16x20",
      swingWeightKgCm2: 304, stiffnessRa: 57,
    },
  }),
  catalogEntry({
    brand: "Prince",
    modelName: "Tour 100P 305g",
    slug: "prince-tour-100p-305g-2026",
    releaseYear: 2026,
    segment: "advanced",
    productCode: "PTR61P",
    manufacturerUrl: "https://princetennis-hk.com/en/products/prince-tour-100p-305g-2026-tennis-racket-unstrung",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Prince_Tour_100P_2026/descpageRCTWABG-PTR61P.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "305 g unstrung; 323 g strung",
      balanceMm: "31.98 cm / 7 pts HL (basis unstated)",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 23 mm / 20 mm",
      stringPattern: "18 x 20",
      swingWeightKgCm2: "325 (basis unstated)",
      stiffnessRa: "61 (basis unstated)",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in² / 645.16 cm²",
      weightG: "11.4 oz / 323 g strung",
      balanceMm: "12.59 in / 31.98 cm / 7 pts HL strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 23 mm / 20 mm",
      stringPattern: "18 Mains / 20 Crosses",
      swingWeightKgCm2: "325",
      stiffnessRa: "61",
    },
    tennisWarehouseSelectedFields: ["balanceMm"],
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 305, balanceMm: 319.8, lengthMm: 685.8,
      beamWidthMm: "22/23/20", stringPattern: "18x20",
      swingWeightKgCm2: 325, stiffnessRa: 61,
    },
  }),
] as const;
