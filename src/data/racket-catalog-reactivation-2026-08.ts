import {
  computeAxisScores,
  type AxisScore,
  type RacketSpecInput,
} from "@/modules/recommendation/scoring-core";
import {
  CATALOG_EXPANSION_REVIEWED_FIELDS,
  type CatalogExpansionField,
  type CatalogExpansionNormalizationDecision,
  type CatalogExpansionRawSpec,
  type CatalogExpansionSource,
  type CatalogExpansionSpec,
} from "./racket-catalog-expansion";

/**
 * 2026-08-06 reactivation manifest.
 *
 * These 16 Dunlop / Prince / Tecnifibre models already exist in the canonical
 * database as discontinued rows with published specs on the retailer strung
 * basis. Reactivation re-normalizes each spec to the canonical measurement
 * policy (manufacturer unstrung static fields, Tennis Warehouse strung
 * swingweight and stiffness), records dual-source evidence, and recomputes v3
 * axis scores.
 *
 * The original 17-model port list also contained "TF40 305 16x19"; it is
 * excluded here because it is the same product (TW code TF40R1) as the active
 * "TF-40 305 2024" identity.
 */
export const CATALOG_REACTIVATION_MANIFEST_VERSION =
  "racket-catalog-reactivation-2026-08-06-v1";
export const CATALOG_REACTIVATION_CAPTURED_AT =
  "2026-08-06T00:00:00.000+09:00";
export const CATALOG_REACTIVATION_COUNT = 16;
export const TARGET_ACTIVE_KR_RACKET_COUNT_AFTER_REACTIVATION = 70;

export type CatalogReactivationSegment =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "pro";

export type CatalogReactivationEntry = {
  brand: string;
  modelName: string;
  slug: string;
  releaseYear: number;
  segment: CatalogReactivationSegment;
  productCode: string;
  imageUrl: string;
  normalizedSpec: CatalogExpansionSpec;
  /**
   * Two sources (manufacturer + Tennis Warehouse) when an official
   * manufacturer page for the exact product generation exists; a single
   * Tennis Warehouse source when it does not (retailer-exclusive releases).
   */
  sources: readonly CatalogExpansionSource[];
  normalizationDecisions: readonly CatalogExpansionNormalizationDecision[];
  axisScores: readonly AxisScore[];
};

type CatalogReactivationInput = Omit<
  CatalogReactivationEntry,
  "imageUrl" | "sources" | "normalizationDecisions" | "axisScores"
> & {
  /** null when no official page for this exact product generation exists. */
  manufacturerUrl: string | null;
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
    /(?:descpage(?:RC[A-Z]+)?-|racquet_reviews\/)([A-Z0-9]+?)(?:review)?\.html$/i,
  )?.[1];
  return (
    tennisWarehouseCode?.toUpperCase()
    ?? pathname.split("/").filter(Boolean).at(-1)?.replace(/\.html$/i, "")
    ?? pathname
  );
}

function rawValues(
  input: CatalogReactivationInput,
  role: CatalogExpansionSource["role"],
  measurementBasis: CatalogExpansionSource["measurementBasis"],
  sourceUrl: string,
  capturedValues: CatalogExpansionRawSpec,
): Record<string, string | number | null> {
  return {
    evidence_manifest_version: CATALOG_REACTIVATION_MANIFEST_VERSION,
    source_role: role,
    measurement_basis: measurementBasis,
    product_code: input.productCode,
    source_code: sourceCode(sourceUrl),
    captured_at: CATALOG_REACTIVATION_CAPTURED_AT,
    ...capturedValues,
  };
}

function reactivationEntry(
  input: CatalogReactivationInput,
): CatalogReactivationEntry {
  const requestedTennisWarehouseFields = new Set<CatalogExpansionField>([
    ...DEFAULT_TENNIS_WAREHOUSE_FIELDS,
    ...(input.tennisWarehouseSelectedFields ?? []),
  ]);
  const selectedSourceRole = (field: CatalogExpansionField) => {
    if (
      input.manufacturerUrl === null
      || requestedTennisWarehouseFields.has(field)
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
        : input.manufacturerUrl === null
          ? "no official manufacturer page exists for this exact product generation"
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
          `${CATALOG_REACTIVATION_MANIFEST_VERSION}: selected ${role} raw value `
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

  const manufacturerSource: CatalogExpansionSource | null =
    input.manufacturerUrl === null
      ? null
      : {
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
          capturedAt: CATALOG_REACTIVATION_CAPTURED_AT,
        };
  const tennisWarehouseSource: CatalogExpansionSource = {
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
    capturedAt: CATALOG_REACTIVATION_CAPTURED_AT,
  };

  return {
    brand: input.brand,
    modelName: input.modelName,
    slug: input.slug,
    releaseYear: input.releaseYear,
    segment: input.segment,
    productCode: input.productCode,
    imageUrl,
    normalizedSpec: input.normalizedSpec,
    sources: manufacturerSource
      ? [manufacturerSource, tennisWarehouseSource]
      : [tennisWarehouseSource],
    normalizationDecisions,
    axisScores,
  };
}

export const RACKET_CATALOG_REACTIVATION: readonly CatalogReactivationEntry[] = [
  // ── Dunlop ────────────────────────────────────────────────────────────
  reactivationEntry({
    brand: "Dunlop",
    modelName: "CX 200 Tour 16x19",
    slug: "dunlop-cx-200-tour-16x19-2024",
    releaseYear: 2024,
    segment: "advanced",
    productCode: "DCX2T6",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/cx-series/cx-200-tour-tennis-racket/CX200T1619-24.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_CX_200_Tour_16x19/descpageRCDUNLOP-DCX2T6.html",
    manufacturerRawValues: {
      headSizeSqIn: "613 / 95 head size (sq cm / sq in)",
      weightG: "310 g / 10.9 oz unstrung",
      balanceMm: "310 mm / 10 pts HL unstrung",
      lengthMm: "68.6 cm / 27 in",
      beamWidthMm: "20.5 mm",
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: "65 RA",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "95 in²",
      weightG: "326 g strung",
      balanceMm: "31.98 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "20.5 mm / 20.5 mm / 20.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "314",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 95, weightG: 310, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "20.5", stringPattern: "16x19",
      swingWeightKgCm2: 314, stiffnessRa: 66,
    },
  }),
  reactivationEntry({
    brand: "Dunlop",
    modelName: "CX 200 Tour 18x20",
    slug: "dunlop-cx-200-tour-18x20-2024",
    releaseYear: 2024,
    segment: "pro",
    productCode: "DCX2T8",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/cx-series/cx-200-tour-18x20-tennis-racket/CX200T1820-24.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_CX_200_Tour_18x20/descpageRCDUNLOP-DCX2T8.html",
    manufacturerRawValues: {
      headSizeSqIn: "613 / 95 head size (sq cm / sq in)",
      weightG: "315 g / 11.1 oz unstrung",
      balanceMm: "310 mm / 10 pts HL unstrung",
      lengthMm: "68.6 cm / 27 in",
      beamWidthMm: "20.5 mm",
      stringPattern: "18 x 20",
      swingWeightKgCm2: null,
      stiffnessRa: "65 RA",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "95 in²",
      weightG: "332 g strung",
      balanceMm: "31.98 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "20.5 mm / 20.5 mm / 20.5 mm",
      stringPattern: "18 Mains / 20 Crosses",
      swingWeightKgCm2: "316",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 95, weightG: 315, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "20.5", stringPattern: "18x20",
      swingWeightKgCm2: 316, stiffnessRa: 66,
    },
  }),
  reactivationEntry({
    brand: "Dunlop",
    modelName: "CX 200 LS",
    slug: "dunlop-cx-200-ls-2024",
    releaseYear: 2024,
    segment: "intermediate",
    productCode: "DCX2LS",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/cx-series/cx-200-ls-tennis-racket/CX200LS-24.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_CX_200_LS/descpageRCDUNLOP-DCX2LS.html",
    manufacturerRawValues: {
      headSizeSqIn: "632 / 98 head size (sq cm / sq in)",
      weightG: "290 g / 10.2 oz unstrung",
      balanceMm: "325 mm / 6 pts HL unstrung",
      lengthMm: "68.6 cm / 27 in",
      beamWidthMm: "21.5 mm",
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: "65 RA",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "303 g strung",
      balanceMm: "33.48 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "21.5 mm / 21.5 mm / 21.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "309",
      stiffnessRa: "63",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 290, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "21.5", stringPattern: "16x19",
      swingWeightKgCm2: 309, stiffnessRa: 63,
    },
  }),
  reactivationEntry({
    brand: "Dunlop",
    modelName: "CX 400 Tour",
    slug: "dunlop-cx-400-tour-2024",
    releaseYear: 2024,
    segment: "intermediate",
    productCode: "DCX4T",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/cx-series/cx-400-tour-tennis-racket/CX400T-24.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_CX_400_Tour/descpageRCDUNLOP-DCX4T.html",
    manufacturerRawValues: {
      headSizeSqIn: "645 / 100 head size (sq cm / sq in)",
      weightG: "300 g / 10.6 oz unstrung",
      balanceMm: "320 mm / 7 pts HL unstrung",
      lengthMm: "68.6 cm / 27 in",
      beamWidthMm: "23 mm",
      stringPattern: "16 x 19",
      swingWeightKgCm2: null,
      stiffnessRa: "68 RA",
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "318 g strung",
      balanceMm: "33.02 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "23 mm / 23 mm / 23 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "317",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 300, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "23", stringPattern: "16x19",
      swingWeightKgCm2: 317, stiffnessRa: 66,
    },
  }),
  reactivationEntry({
    brand: "Dunlop",
    modelName: "FX 500 LS",
    slug: "dunlop-fx-500-ls-2025",
    releaseYear: 2025,
    segment: "intermediate",
    productCode: "DF50LS",
    manufacturerUrl: "https://us.dunlopsports.com/dunlop/tennis/rackets/fx-series/fx-500-ls/10369904.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Dunlop_FX_500_LS/descpageRCDUNLOP-DF50LS.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 sq in / 645 cm²",
      weightG: "285 g / 10.1 oz unstrung",
      balanceMm: "325 mm / 6 pts HL",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: "23-26-23 mm",
      stringPattern: "16x19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "301 g strung",
      balanceMm: "33.48 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "23 mm / 26 mm / 23 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "307",
      stiffnessRa: "67",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 285, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "23/26/23", stringPattern: "16x19",
      swingWeightKgCm2: 307, stiffnessRa: 67,
    },
  }),

  // ── Tecnifibre ────────────────────────────────────────────────────────
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "TFight 315S",
    slug: "tecnifibre-tfight-315s-2025",
    releaseYear: 2025,
    segment: "pro",
    productCode: "TF315S",
    manufacturerUrl: "https://b2b.tecnifibre.com/en/p/14FI315S5.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TFight_315S/descpageRCTFUSA-TF315S.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "315 g / 11,1 oz unstrung",
      balanceMm: "310 mm unstrung",
      lengthMm: "68,6 cm",
      beamWidthMm: "22,5-23-22,5 mm",
      stringPattern: "16x19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "332 g strung",
      balanceMm: "31.98 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22.5 mm / 22.5 mm / 22.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "325",
      stiffnessRa: "65",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 315, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "22.5/23/22.5", stringPattern: "16x19",
      swingWeightKgCm2: 325, stiffnessRa: 65,
    },
  }),
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "TFight 300S",
    slug: "tecnifibre-tfight-300s-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "TF300S",
    manufacturerUrl: "https://b2b.tecnifibre.com/en/p/14FI300S5.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/TF300Sreview.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "298 g / 10,5 oz unstrung",
      balanceMm: "320 mm unstrung",
      lengthMm: "68,6 cm",
      beamWidthMm: null,
      stringPattern: "16x19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "318 g strung",
      balanceMm: "33.02 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22.5 mm / 22.5 mm / 22.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "321",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 298, balanceMm: 320, lengthMm: 685.8,
      beamWidthMm: "22.5/22.5/22.5", stringPattern: "16x19",
      swingWeightKgCm2: 321, stiffnessRa: 66,
    },
  }),
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "TF40 315 18x20",
    slug: "tecnifibre-tf40-315-18x20-2024",
    releaseYear: 2024,
    segment: "pro",
    productCode: "TF3158",
    manufacturerUrl: "https://b2b.tecnifibre.com/en/p/14TF44158.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TF40_315_18x20/descpageRCTFUSA-TF3158.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "315 g / 11,1 oz unstrung",
      balanceMm: "310 mm unstrung",
      lengthMm: "68,6 cm",
      beamWidthMm: "21,7 mm",
      stringPattern: "18x20",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "335 g strung",
      balanceMm: "31.98 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 22 mm / 22 mm",
      stringPattern: "18 Mains / 20 Crosses",
      swingWeightKgCm2: "316",
      stiffnessRa: "64",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 315, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "21.7", stringPattern: "18x20",
      swingWeightKgCm2: 316, stiffnessRa: 64,
    },
  }),
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "TF40 290 16x19",
    slug: "tecnifibre-tf40-290-16x19-2024",
    releaseYear: 2024,
    segment: "intermediate",
    productCode: "TF40R9",
    manufacturerUrl: "https://b2b.tecnifibre.com/en/p/14TF44906.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TF40_290g_16x19/descpageRCTFUSA-TF40R9.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "290 g / 10,2 oz unstrung",
      balanceMm: "325 mm unstrung",
      lengthMm: "68,6 cm",
      beamWidthMm: "21,7 mm",
      stringPattern: "16x19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "303 g strung",
      balanceMm: "33.20 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 22 mm / 22 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "312",
      stiffnessRa: "65",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 290, balanceMm: 325, lengthMm: 685.8,
      beamWidthMm: "21.7", stringPattern: "16x19",
      swingWeightKgCm2: 312, stiffnessRa: 65,
    },
  }),
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "Fire 305S",
    slug: "tecnifibre-fire-305s-2026",
    releaseYear: 2026,
    segment: "intermediate",
    productCode: "TFFI35",
    manufacturerUrl: "https://www.tecnifibre.com/en/products/fire-305s",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_Fire_305S/descpageRCTFUSA-TFFI35.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "305 g / 10.7 oz unstrung",
      balanceMm: "315 mm",
      lengthMm: "685 mm",
      beamWidthMm: "23-23-22.5 mm",
      stringPattern: "16x19 - Unstrung",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "323 g strung",
      balanceMm: "32.49 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "23 mm / 23 mm / 22.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "325",
      stiffnessRa: "66",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, lengthMm: 685,
      beamWidthMm: "23/23/22.5", stringPattern: "16x19",
      swingWeightKgCm2: 325, stiffnessRa: 66,
    },
  }),
  reactivationEntry({
    brand: "Tecnifibre",
    modelName: "TF-X1 305 V2",
    slug: "tecnifibre-tf-x1-305-v2-2024",
    releaseYear: 2024,
    segment: "intermediate",
    productCode: "TFX135",
    manufacturerUrl: "https://b2b.tecnifibre.com/en/p/14TFX3054.html",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/Tecnifibre_TF-X1_305_v2/descpageRCTFUSA-TFX135.html",
    manufacturerRawValues: {
      headSizeSqIn: "630 cm² / 98 in²",
      weightG: "305 g / 10,8 oz unstrung",
      balanceMm: "315 mm unstrung",
      lengthMm: "68,5 cm",
      beamWidthMm: "24,5-25,4-25 mm",
      stringPattern: "16x19",
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "323 g strung",
      balanceMm: "32.49 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "24.5 mm / 24.5 mm / 24.5 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "333",
      stiffnessRa: "70",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 305, balanceMm: 315, lengthMm: 685,
      beamWidthMm: "24.5/25.4/25", stringPattern: "16x19",
      swingWeightKgCm2: 333, stiffnessRa: 70,
    },
  }),

  // ── Prince ────────────────────────────────────────────────────────────
  // Prince closed its own web stores (princetennis.com and princesports.com)
  // after 2024; official product pages survive only as web.archive.org
  // snapshots. The Phantom 2024 editions are cosmetic refreshes of the same
  // molds documented on those pages. The 2025 Ripstick releases have no
  // official page for their exact generation, so they carry a single
  // Tennis Warehouse source.
  reactivationEntry({
    brand: "Prince",
    modelName: "Phantom 100X 305g",
    slug: "prince-phantom-100x-305g-2024",
    releaseYear: 2024,
    segment: "advanced",
    productCode: "PHNX5",
    manufacturerUrl: "https://web.archive.org/web/20200804065008/https://princetennis.com/txt-ats-phantom-100x-305",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/PHNX5review.html",
    tennisWarehouseSelectedFields: ["beamWidthMm"],
    manufacturerRawValues: {
      headSizeSqIn: "100 in / 645 cm head size",
      weightG: "305 g / 10.8 oz unstrung",
      balanceMm: "31.5 cm / 9 pts HL unstrung",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: "22 - 18 mm cross section (two-point taper)",
      stringPattern: "16 x 18",
      swingWeightKgCm2: "290 (manufacturer, unstrung)",
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "323 g strung",
      balanceMm: "32.49 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 20.5 mm / 18 mm",
      stringPattern: "16 Mains / 18 Crosses",
      swingWeightKgCm2: "320",
      stiffnessRa: "59",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 305, balanceMm: 315, lengthMm: 685.8,
      beamWidthMm: "22/20.5/18", stringPattern: "16x18",
      swingWeightKgCm2: 320, stiffnessRa: 59,
    },
  }),
  reactivationEntry({
    brand: "Prince",
    modelName: "Phantom 100P 310g",
    slug: "prince-phantom-100p-310g-2024",
    releaseYear: 2024,
    segment: "advanced",
    productCode: "PHNP1",
    manufacturerUrl: "https://web.archive.org/web/20200804064957/https://princetennis.com/txt-ats-phantom-100p",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/PHNP1review.html",
    tennisWarehouseSelectedFields: ["beamWidthMm"],
    manufacturerRawValues: {
      headSizeSqIn: "100 in / 645 cm head size",
      weightG: "310 g / 10.9 oz unstrung",
      balanceMm: "31.5 cm / 9 pts HL unstrung",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: "20 - 16 mm cross section (two-point taper)",
      stringPattern: "16 x 18",
      swingWeightKgCm2: "295 (manufacturer, unstrung)",
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "326 g strung",
      balanceMm: "32.49 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "20.5 mm / 19.5 mm / 16.5 mm",
      stringPattern: "16 Mains / 18 Crosses",
      swingWeightKgCm2: "324",
      stiffnessRa: "59",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 310, balanceMm: 315, lengthMm: 685.8,
      beamWidthMm: "20.5/19.5/16.5", stringPattern: "16x18",
      swingWeightKgCm2: 324, stiffnessRa: 59,
    },
  }),
  reactivationEntry({
    brand: "Prince",
    modelName: "Ripstick 98",
    slug: "prince-ripstick-98-2025",
    releaseYear: 2025,
    segment: "advanced",
    productCode: "2RIP98",
    manufacturerUrl: null,
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/2RIP98review.html",
    manufacturerRawValues: {
      headSizeSqIn: null,
      weightG: null,
      balanceMm: null,
      lengthMm: null,
      beamWidthMm: null,
      stringPattern: null,
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "98 in²",
      weightG: "323 g strung",
      balanceMm: "32.13 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "27 mm / 25.5 mm / 22 mm",
      stringPattern: "16 Mains / 18 Crosses",
      swingWeightKgCm2: "328",
      stiffnessRa: "67",
    },
    normalizedSpec: {
      headSizeSqIn: 98, weightG: 323, balanceMm: 321.3, lengthMm: 685.8,
      beamWidthMm: "27/25.5/22", stringPattern: "16x18",
      swingWeightKgCm2: 328, stiffnessRa: 67,
    },
  }),
  reactivationEntry({
    brand: "Prince",
    modelName: "Ripstick 100",
    slug: "prince-ripstick-100-2025",
    releaseYear: 2025,
    segment: "intermediate",
    productCode: "25RIPH",
    manufacturerUrl: null,
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/25RIPHreview.html",
    manufacturerRawValues: {
      headSizeSqIn: null,
      weightG: null,
      balanceMm: null,
      lengthMm: null,
      beamWidthMm: null,
      stringPattern: null,
      swingWeightKgCm2: null,
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "318 g strung",
      balanceMm: "33.02 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "27 mm / 25.5 mm / 22 mm",
      stringPattern: "16 Mains / 19 Crosses",
      swingWeightKgCm2: "326",
      stiffnessRa: "67",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 318, balanceMm: 330.2, lengthMm: 685.8,
      beamWidthMm: "27/25.5/22", stringPattern: "16x19",
      swingWeightKgCm2: 326, stiffnessRa: 67,
    },
  }),
  reactivationEntry({
    brand: "Prince",
    modelName: "Tour 100 310g",
    slug: "prince-tour-100-310g-2022",
    releaseYear: 2022,
    segment: "advanced",
    productCode: "ATR310",
    manufacturerUrl: "https://web.archive.org/web/20231128134028/https://www.princesports.com/products/tour-100-310g-white-teal-orange",
    tennisWarehouseUrl: "https://www.tennis-warehouse.com/learning_center/racquet_reviews/ATR310review.html",
    manufacturerRawValues: {
      headSizeSqIn: "100 in / 645 cm head size",
      weightG: "310 g / 10.9 oz unstrung",
      balanceMm: "31.0 cm / 10 pts HL unstrung",
      lengthMm: "27 in / 68.6 cm",
      beamWidthMm: "22-23-20 mm cross section",
      stringPattern: "16 x 18",
      swingWeightKgCm2: "290 (manufacturer, unstrung)",
      stiffnessRa: null,
    },
    tennisWarehouseRawValues: {
      headSizeSqIn: "100 in²",
      weightG: "326 g strung",
      balanceMm: "31.98 cm strung",
      lengthMm: "27 in / 68.58 cm",
      beamWidthMm: "22 mm / 23 mm / 20 mm",
      stringPattern: "16 Mains / 18 Crosses",
      swingWeightKgCm2: "323",
      stiffnessRa: "62",
    },
    normalizedSpec: {
      headSizeSqIn: 100, weightG: 310, balanceMm: 310, lengthMm: 685.8,
      beamWidthMm: "22/23/20", stringPattern: "16x18",
      swingWeightKgCm2: 323, stiffnessRa: 62,
    },
  }),
] as const;

/** Total spec_sources rows the apply step inserts (dual- and single-source mix). */
export const CATALOG_REACTIVATION_SOURCE_INSERTS =
  RACKET_CATALOG_REACTIVATION.reduce(
    (total, entry) => total + entry.sources.length,
    0,
  );
