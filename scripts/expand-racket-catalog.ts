import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

import {
  CATALOG_EXPANSION_COUNT,
  CATALOG_EXPANSION_MANIFEST_VERSION,
  CATALOG_EXPANSION_REVIEWED_FIELDS,
  RACKET_CATALOG_EXPANSION,
  TARGET_ACTIVE_KR_RACKET_COUNT,
} from "../src/data/racket-catalog-expansion";
import {
  activeIdentityKey,
  validateActiveCatalogIdentities,
} from "../src/data/racket-score-evidence";
import {
  AXIS_DEFINITIONS,
  SCORING_VERSION,
} from "../src/modules/recommendation/scoring-core";
import {
  assertCanonicalWorkflow,
  loadEnvironment,
} from "./backfill-racket-evidence";

export type CatalogIdentityRow = {
  brand: string;
  model_name: string;
};

type BrandRow = {
  id: string;
  name: string;
};

export type CatalogExpansionPreflight = {
  activeBefore: number;
  insertCount: number;
  conflicts: string[];
  missingBrands: string[];
};

export function parseCatalogExpansionArgs(
  args: readonly string[],
): { apply: boolean } {
  for (const argument of args) {
    if (argument !== "--apply") {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { apply: args.includes("--apply") };
}

export function assertCatalogExpansionApproval(
  apply: boolean,
  approval: string | undefined,
): void {
  if (
    apply
    && approval !== "canonical-operating-apply-approved"
  ) {
    throw new Error(
      "Apply requires RACKETLAB_CATALOG_EXPANSION_APPROVAL="
      + "canonical-operating-apply-approved.",
    );
  }
}

export function validateCatalogExpansionPreflight(
  allCatalogRows: readonly CatalogIdentityRow[],
  activeCatalogRows: readonly CatalogIdentityRow[],
  existingBrandNames: readonly string[],
): CatalogExpansionPreflight {
  const expansionIdentityKeys = new Set(
    RACKET_CATALOG_EXPANSION.map(({ brand, modelName }) =>
      activeIdentityKey(brand, modelName)
    ),
  );
  const allIdentityKeys = new Set(
    allCatalogRows.map(({ brand, model_name }) =>
      activeIdentityKey(brand, model_name)
    ),
  );
  const conflicts = RACKET_CATALOG_EXPANSION
    .filter(({ brand, modelName }) =>
      allIdentityKeys.has(activeIdentityKey(brand, modelName))
    )
    .map(({ brand, modelName }) => `${brand} ${modelName}`);
  const legacyActiveRows = activeCatalogRows.filter(({ brand, model_name }) =>
    !expansionIdentityKeys.has(activeIdentityKey(brand, model_name))
  );

  validateActiveCatalogIdentities(
    legacyActiveRows.map(({ brand, model_name }) =>
      activeIdentityKey(brand, model_name)
    ),
  );

  const existingBrands = new Set(existingBrandNames);
  const missingBrands = [
    ...new Set(
      RACKET_CATALOG_EXPANSION
        .map(({ brand }) => brand)
        .filter((brand) => !existingBrands.has(brand)),
    ),
  ];

  return {
    activeBefore: activeCatalogRows.length,
    insertCount: CATALOG_EXPANSION_COUNT - conflicts.length,
    conflicts,
    missingBrands,
  };
}

function printDryRun(preflight: CatalogExpansionPreflight): void {
  const sourceCount = preflight.insertCount * 2;
  const decisionCount =
    preflight.insertCount * CATALOG_EXPANSION_REVIEWED_FIELDS.length;
  const scoreCount = preflight.insertCount * AXIS_DEFINITIONS.length;

  console.log("DRY RUN — no database mutations were executed.");
  console.log(`Current active KR rackets: ${preflight.activeBefore}`);
  console.log(`Racket model inserts: ${preflight.insertCount}`);
  console.log(`KR variant inserts: ${preflight.insertCount}`);
  console.log(`Published spec inserts: ${preflight.insertCount}`);
  console.log(`Evidence source inserts: ${sourceCount}`);
  console.log(`Normalization decision inserts: ${decisionCount}`);
  console.log(`${SCORING_VERSION} axis score inserts: ${scoreCount}`);
  console.log("Existing-row changes: 0");
  console.log(`Identity conflicts: ${preflight.conflicts.length}`);
  for (const conflict of preflight.conflicts) {
    console.log(`  conflict: ${conflict}`);
  }
  console.log(`Missing brands: ${preflight.missingBrands.length}`);
  for (const brand of preflight.missingBrands) {
    console.log(`  missing brand: ${brand}`);
  }
  console.log(
    `Expected active KR catalog after apply: ${TARGET_ACTIVE_KR_RACKET_COUNT}`,
  );
  console.log(
    preflight.conflicts.length === 0 && preflight.missingBrands.length === 0
      ? "Apply readiness: ready"
      : "Apply readiness: blocked",
  );
  console.log("Run with the exact --apply flag to execute the guarded transaction.");
}

async function main(): Promise<void> {
  const { apply } = parseCatalogExpansionArgs(process.argv.slice(2));
  const environment = loadEnvironment();
  const databaseUrl = assertCanonicalWorkflow(environment, apply);
  assertCatalogExpansionApproval(
    apply,
    environment.RACKETLAB_CATALOG_EXPANSION_APPROVAL,
  );

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    if (!apply) {
      const [allCatalogRows, activeCatalogRows, brandRows] = await Promise.all([
        sql<CatalogIdentityRow[]>`
          SELECT b.name AS brand, rm.name AS model_name
          FROM racket_models rm
          JOIN brands b ON b.id = rm.brand_id
        `,
        sql<CatalogIdentityRow[]>`
          SELECT b.name AS brand, rm.name AS model_name
          FROM racket_models rm
          JOIN brands b ON b.id = rm.brand_id
          WHERE rm.discontinued = FALSE
            AND EXISTS (
              SELECT 1
              FROM racket_variants rv
              WHERE rv.racket_model_id = rm.id
                AND rv.region_code = 'KR'
                AND rv.available_in_korea = TRUE
            )
        `,
        sql<BrandRow[]>`
          SELECT id, name
          FROM brands
        `,
      ]);
      const preflight = validateCatalogExpansionPreflight(
        allCatalogRows,
        activeCatalogRows,
        brandRows.map(({ name }) => name),
      );
      printDryRun(preflight);
      return;
    }

    const result = await sql.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(
          hashtext(${CATALOG_EXPANSION_MANIFEST_VERSION})
        )
      `;

      const [allCatalogRows, activeCatalogRows] = await Promise.all([
        transaction<CatalogIdentityRow[]>`
          SELECT b.name AS brand, rm.name AS model_name
          FROM racket_models rm
          JOIN brands b ON b.id = rm.brand_id
          FOR SHARE OF rm
        `,
        transaction<CatalogIdentityRow[]>`
          SELECT b.name AS brand, rm.name AS model_name
          FROM racket_models rm
          JOIN brands b ON b.id = rm.brand_id
          WHERE rm.discontinued = FALSE
            AND EXISTS (
              SELECT 1
              FROM racket_variants rv
              WHERE rv.racket_model_id = rm.id
                AND rv.region_code = 'KR'
                AND rv.available_in_korea = TRUE
            )
          FOR SHARE OF rm
        `,
      ]);

      const brandRows = await transaction<BrandRow[]>`
        SELECT id, name
        FROM brands
        FOR SHARE
      `;
      const preflight = validateCatalogExpansionPreflight(
        allCatalogRows,
        activeCatalogRows,
        brandRows.map(({ name }) => name),
      );
      if (preflight.conflicts.length > 0) {
        throw new Error(
          `Catalog expansion conflicts with existing identities: `
          + `${preflight.conflicts.join(", ")}.`,
        );
      }
      if (preflight.missingBrands.length > 0) {
        throw new Error(
          `Canonical catalog is missing required brands: `
          + `${preflight.missingBrands.join(", ")}.`,
        );
      }
      const brandIds = new Map(brandRows.map(({ id, name }) => [name, id]));

      const axisRows = await transaction<{ id: string; axis_key: string }[]>`
        SELECT id, axis_key
        FROM axis_definitions
        WHERE version = ${SCORING_VERSION}
        FOR SHARE
      `;
      const axisIds = new Map(axisRows.map(({ id, axis_key }) => [axis_key, id]));
      const expectedAxisKeys = new Set(
        AXIS_DEFINITIONS.map(({ axisKey }) => axisKey),
      );
      if (
        axisIds.size !== expectedAxisKeys.size
        || [...axisIds.keys()].some((key) => !expectedAxisKeys.has(key as never))
      ) {
        throw new Error(`Expected exactly five ${SCORING_VERSION} axis definitions.`);
      }

      let insertedSources = 0;
      let insertedDecisions = 0;
      let insertedScores = 0;

      for (const entry of RACKET_CATALOG_EXPANSION) {
        const brandId = brandIds.get(entry.brand);
        if (!brandId) {
          throw new Error(`Missing brand ID for ${entry.brand}.`);
        }

        const [model] = await transaction<{ id: string }[]>`
          INSERT INTO racket_models (
            brand_id,
            name,
            segment,
            release_year,
            discontinued,
            image_url,
            thumbnail_url
          )
          VALUES (
            ${brandId},
            ${entry.modelName},
            ${entry.segment},
            ${entry.releaseYear},
            FALSE,
            ${entry.imageUrl},
            ${entry.imageUrl}
          )
          RETURNING id
        `;

        await transaction`
          INSERT INTO racket_variants (
            racket_model_id,
            weight_variant,
            region_code,
            available_in_korea
          )
          VALUES (
            ${model.id},
            ${`${entry.normalizedSpec.weightG}g`},
            'KR',
            TRUE
          )
        `;

        const spec = entry.normalizedSpec;
        const [specRow] = await transaction<{ id: string }[]>`
          INSERT INTO racket_specs (
            racket_model_id,
            head_size_sq_in,
            weight_g,
            balance_mm,
            swing_weight_kg_cm2,
            stiffness_ra,
            length_mm,
            beam_width_mm,
            string_pattern,
            ingestion_state,
            published_at
          )
          VALUES (
            ${model.id},
            ${spec.headSizeSqIn},
            ${spec.weightG},
            ${spec.balanceMm},
            ${spec.swingWeightKgCm2},
            ${spec.stiffnessRa},
            ${spec.lengthMm},
            ${spec.beamWidthMm},
            ${spec.stringPattern},
            'published',
            NOW()
          )
          RETURNING id
        `;

        for (const source of entry.sources) {
          await transaction`
            INSERT INTO spec_sources (
              racket_specs_id,
              source_url,
              source_type,
              raw_values,
              confidence,
              captured_at,
              verified_by_admin
            )
            VALUES (
              ${specRow.id},
              ${source.sourceUrl},
              ${source.sourceType},
              ${transaction.json({
                ...source.rawValues,
                reviewed_fields: source.reviewedFields,
              })},
              ${source.role === "manufacturer_static" ? 1 : 0.95},
              ${source.capturedAt},
              FALSE
            )
          `;
          insertedSources += 1;
        }

        for (const decision of entry.normalizationDecisions) {
          const { field } = decision;
          const selectedSource = entry.sources.find(({ role }) =>
            role === decision.selectedSourceRole
          );
          if (!selectedSource) {
            throw new Error(`No selected source for ${entry.slug} ${field}.`);
          }
          const sourceComparison = entry.sources.map((source) => ({
            source_role: source.role,
            source_url: source.sourceUrl,
            measurement_basis: source.measurementBasis,
            raw_value: source.rawValues[field] ?? null,
          }));

          await transaction`
            INSERT INTO normalization_decisions (
              racket_specs_id,
              field,
              conflicting_sources,
              resolved_value,
              reason,
              reviewed_by
            )
            VALUES (
              ${specRow.id},
              ${field},
              ${transaction.json(sourceComparison)},
              ${String(spec[field])},
              ${decision.reason},
              ${CATALOG_EXPANSION_MANIFEST_VERSION}
            )
          `;
          insertedDecisions += 1;
        }

        for (const score of entry.axisScores) {
          const axisDefinitionId = axisIds.get(score.axisKey);
          if (!axisDefinitionId) {
            throw new Error(
              `Missing ${SCORING_VERSION} axis definition for ${score.axisKey}.`,
            );
          }
          await transaction`
            INSERT INTO racket_axis_scores (
              racket_model_id,
              axis_definition_id,
              scoring_version,
              score,
              input_snapshot,
              computed_at
            )
            VALUES (
              ${model.id},
              ${axisDefinitionId},
              ${SCORING_VERSION},
              ${score.score},
              ${transaction.json(score.inputSnapshot)},
              NOW()
            )
          `;
          insertedScores += 1;
        }
      }

      const [verification] = await transaction<{ active_count: number }[]>`
        SELECT count(*)::int AS active_count
        FROM racket_models rm
        WHERE rm.discontinued = FALSE
          AND EXISTS (
            SELECT 1
            FROM racket_variants rv
            WHERE rv.racket_model_id = rm.id
              AND rv.region_code = 'KR'
              AND rv.available_in_korea = TRUE
          )
      `;
      const expectedSources = CATALOG_EXPANSION_COUNT * 2;
      const expectedDecisions =
        CATALOG_EXPANSION_COUNT * CATALOG_EXPANSION_REVIEWED_FIELDS.length;
      const expectedScores = CATALOG_EXPANSION_COUNT * AXIS_DEFINITIONS.length;
      if (
        verification.active_count !== TARGET_ACTIVE_KR_RACKET_COUNT
        || insertedSources !== expectedSources
        || insertedDecisions !== expectedDecisions
        || insertedScores !== expectedScores
      ) {
        throw new Error(
          "Catalog expansion after-verify failed; the transaction was rolled back.",
        );
      }

      return {
        models: CATALOG_EXPANSION_COUNT,
        sources: insertedSources,
        decisions: insertedDecisions,
        scores: insertedScores,
        active: verification.active_count,
      };
    });

    console.log(
      `APPLIED atomically: ${result.models} models, ${result.sources} sources, `
      + `${result.decisions} decisions, ${result.scores} ${SCORING_VERSION} scores; `
      + `${result.active} active KR rackets.`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (import.meta.url === invokedPath) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
