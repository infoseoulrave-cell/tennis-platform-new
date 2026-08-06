import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

import {
  CATALOG_REACTIVATION_COUNT,
  CATALOG_REACTIVATION_MANIFEST_VERSION,
  CATALOG_REACTIVATION_SOURCE_INSERTS,
  RACKET_CATALOG_REACTIVATION,
  TARGET_ACTIVE_KR_RACKET_COUNT_AFTER_REACTIVATION,
} from "../src/data/racket-catalog-reactivation-2026-08";
import {
  CATALOG_EXPANSION_REVIEWED_FIELDS,
  RACKET_CATALOG_EXPANSION,
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

type CatalogModelRow = {
  id: string;
  brand: string;
  model_name: string;
  discontinued: boolean;
};

export type CatalogReactivationPreflight = {
  activeBefore: number;
  reactivateCount: number;
  missingModels: string[];
  alreadyActive: string[];
  modelsWithoutSpec: string[];
  modelsWithExistingEvidence: string[];
  modelsWithoutKrVariant: string[];
};

export function parseCatalogReactivationArgs(
  args: readonly string[],
): { apply: boolean } {
  for (const argument of args) {
    if (argument !== "--apply") {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return { apply: args.includes("--apply") };
}

export function assertCatalogReactivationApproval(
  apply: boolean,
  approval: string | undefined,
): void {
  if (
    apply
    && approval !== "canonical-operating-apply-approved"
  ) {
    throw new Error(
      "Apply requires RACKETLAB_CATALOG_REACTIVATION_APPROVAL="
      + "canonical-operating-apply-approved.",
    );
  }
}

/**
 * The frozen 39-identity legacy validation still applies: the current active
 * catalog is (39 legacy + 15 expansion). Reactivation preflight subtracts the
 * 2026-07-24 expansion identities before running the legacy validator, and
 * separately asserts that every expansion identity is still active.
 */
export function validateReactivationCatalogState(
  activeRows: readonly { brand: string; model_name: string }[],
): void {
  const expansionKeys = new Set(
    RACKET_CATALOG_EXPANSION.map(({ brand, modelName }) =>
      activeIdentityKey(brand, modelName)
    ),
  );
  const activeKeys = activeRows.map(({ brand, model_name }) =>
    activeIdentityKey(brand, model_name)
  );
  const activeKeySet = new Set(activeKeys);
  const missingExpansion = [...expansionKeys].filter(
    (key) => !activeKeySet.has(key),
  );
  if (missingExpansion.length > 0) {
    throw new Error(
      `Expected every 2026-07-24 expansion identity to stay active; missing ${missingExpansion.length}.`,
    );
  }
  validateActiveCatalogIdentities(
    activeKeys.filter((key) => !expansionKeys.has(key)),
  );
}

export function validateCatalogReactivationPreflight(
  allModelRows: readonly CatalogModelRow[],
  activeRows: readonly { brand: string; model_name: string }[],
  specModelIds: ReadonlySet<string>,
  evidenceModelIds: ReadonlySet<string>,
  krVariantModelIds: ReadonlySet<string>,
): CatalogReactivationPreflight {
  validateReactivationCatalogState(activeRows);

  const byIdentity = new Map(
    allModelRows.map((row) => [
      activeIdentityKey(row.brand, row.model_name),
      row,
    ]),
  );

  const missingModels: string[] = [];
  const alreadyActive: string[] = [];
  const modelsWithoutSpec: string[] = [];
  const modelsWithExistingEvidence: string[] = [];
  const modelsWithoutKrVariant: string[] = [];

  for (const entry of RACKET_CATALOG_REACTIVATION) {
    const label = `${entry.brand} ${entry.modelName}`;
    const row = byIdentity.get(activeIdentityKey(entry.brand, entry.modelName));
    if (!row) {
      missingModels.push(label);
      continue;
    }
    if (!row.discontinued) alreadyActive.push(label);
    if (!specModelIds.has(row.id)) modelsWithoutSpec.push(label);
    if (evidenceModelIds.has(row.id)) modelsWithExistingEvidence.push(label);
    if (!krVariantModelIds.has(row.id)) modelsWithoutKrVariant.push(label);
  }

  return {
    activeBefore: activeRows.length,
    reactivateCount: CATALOG_REACTIVATION_COUNT
      - missingModels.length
      - alreadyActive.length,
    missingModels,
    alreadyActive,
    modelsWithoutSpec,
    modelsWithExistingEvidence,
    modelsWithoutKrVariant,
  };
}

function preflightBlockers(preflight: CatalogReactivationPreflight): string[] {
  return [
    ...preflight.missingModels.map((m) => `missing model: ${m}`),
    ...preflight.alreadyActive.map((m) => `already active: ${m}`),
    ...preflight.modelsWithoutSpec.map((m) => `no published spec row: ${m}`),
    ...preflight.modelsWithExistingEvidence.map(
      (m) => `evidence rows already exist: ${m}`,
    ),
    ...preflight.modelsWithoutKrVariant.map((m) => `no KR variant: ${m}`),
  ];
}

function printDryRun(preflight: CatalogReactivationPreflight): void {
  const blockers = preflightBlockers(preflight);
  console.log("DRY RUN — no database mutations were executed.");
  console.log(`Current active KR rackets: ${preflight.activeBefore}`);
  console.log(`Models to reactivate: ${preflight.reactivateCount}`);
  console.log(`Spec updates (strung → canonical unstrung basis): ${preflight.reactivateCount}`);
  console.log(
    `Evidence source inserts: ${CATALOG_REACTIVATION_SOURCE_INSERTS}`,
  );
  console.log(
    `Normalization decision inserts: ${preflight.reactivateCount * CATALOG_EXPANSION_REVIEWED_FIELDS.length}`,
  );
  console.log(
    `${SCORING_VERSION} axis score inserts: ${preflight.reactivateCount * AXIS_DEFINITIONS.length}`,
  );
  console.log(`Blockers: ${blockers.length}`);
  for (const blocker of blockers) console.log(`  ${blocker}`);
  console.log(
    `Expected active KR catalog after apply: ${TARGET_ACTIVE_KR_RACKET_COUNT_AFTER_REACTIVATION}`,
  );
  console.log(
    blockers.length === 0 ? "Apply readiness: ready" : "Apply readiness: blocked",
  );
  console.log("Run with the exact --apply flag to execute the guarded transaction.");
}

async function main(): Promise<void> {
  const { apply } = parseCatalogReactivationArgs(process.argv.slice(2));
  const environment = loadEnvironment();
  const databaseUrl = assertCanonicalWorkflow(environment, apply);
  assertCatalogReactivationApproval(
    apply,
    environment.RACKETLAB_CATALOG_REACTIVATION_APPROVAL,
  );

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  // Sequential on purpose: pipelining parallel queries over one pooled
  // transaction-mode connection stalls against the Supabase pooler.
  const loadState = async (transaction: postgres.Sql | postgres.TransactionSql) => {
    const allModelRows = await transaction<CatalogModelRow[]>`
      SELECT rm.id, b.name AS brand, rm.name AS model_name, rm.discontinued
      FROM racket_models rm
      JOIN brands b ON b.id = rm.brand_id
    `;
    const activeRows = await transaction<{ brand: string; model_name: string }[]>`
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
    `;
    const specRows = await transaction<{ racket_model_id: string }[]>`
      SELECT racket_model_id FROM racket_specs
      WHERE ingestion_state = 'published'
    `;
    const evidenceRows = await transaction<{ racket_model_id: string }[]>`
      SELECT rs.racket_model_id
      FROM spec_sources ss
      JOIN racket_specs rs ON rs.id = ss.racket_specs_id
    `;
    const krVariantRows = await transaction<{ racket_model_id: string }[]>`
      SELECT racket_model_id FROM racket_variants
      WHERE region_code = 'KR' AND available_in_korea = TRUE
    `;
    return {
      allModelRows,
      activeRows,
      specModelIds: new Set(specRows.map((r) => r.racket_model_id)),
      evidenceModelIds: new Set(evidenceRows.map((r) => r.racket_model_id)),
      krVariantModelIds: new Set(krVariantRows.map((r) => r.racket_model_id)),
    };
  };

  try {
    if (!apply) {
      const state = await loadState(sql);
      const preflight = validateCatalogReactivationPreflight(
        state.allModelRows,
        state.activeRows,
        state.specModelIds,
        state.evidenceModelIds,
        state.krVariantModelIds,
      );
      printDryRun(preflight);
      return;
    }

    const result = await sql.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(
          hashtext(${CATALOG_REACTIVATION_MANIFEST_VERSION})
        )
      `;

      const state = await loadState(transaction);
      const preflight = validateCatalogReactivationPreflight(
        state.allModelRows,
        state.activeRows,
        state.specModelIds,
        state.evidenceModelIds,
        state.krVariantModelIds,
      );
      const blockers = preflightBlockers(preflight);
      if (blockers.length > 0) {
        throw new Error(`Reactivation blocked: ${blockers.join("; ")}.`);
      }

      const byIdentity = new Map(
        state.allModelRows.map((row) => [
          activeIdentityKey(row.brand, row.model_name),
          row,
        ]),
      );

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

      for (const entry of RACKET_CATALOG_REACTIVATION) {
        const model = byIdentity.get(
          activeIdentityKey(entry.brand, entry.modelName),
        );
        if (!model) {
          throw new Error(`Missing model for ${entry.brand} ${entry.modelName}.`);
        }

        await transaction`
          UPDATE racket_models SET
            discontinued = FALSE,
            segment = ${entry.segment},
            release_year = ${entry.releaseYear},
            image_url = ${entry.imageUrl},
            thumbnail_url = ${entry.imageUrl}
          WHERE id = ${model.id}
        `;

        const spec = entry.normalizedSpec;
        const [specRow] = await transaction<{ id: string }[]>`
          UPDATE racket_specs SET
            head_size_sq_in = ${spec.headSizeSqIn},
            weight_g = ${spec.weightG},
            balance_mm = ${spec.balanceMm},
            swing_weight_kg_cm2 = ${spec.swingWeightKgCm2},
            stiffness_ra = ${spec.stiffnessRa},
            length_mm = ${spec.lengthMm},
            beam_width_mm = ${spec.beamWidthMm},
            string_pattern = ${spec.stringPattern},
            ingestion_state = 'published',
            published_at = COALESCE(published_at, NOW())
          WHERE racket_model_id = ${model.id}
          RETURNING id
        `;
        if (!specRow) {
          throw new Error(`Missing spec row for ${entry.brand} ${entry.modelName}.`);
        }

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
              ${CATALOG_REACTIVATION_MANIFEST_VERSION}
            )
          `;
          insertedDecisions += 1;
        }

        await transaction`
          DELETE FROM racket_axis_scores
          WHERE racket_model_id = ${model.id}
            AND scoring_version = ${SCORING_VERSION}
        `;
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
      const expectedSources = CATALOG_REACTIVATION_SOURCE_INSERTS;
      const expectedDecisions =
        CATALOG_REACTIVATION_COUNT * CATALOG_EXPANSION_REVIEWED_FIELDS.length;
      const expectedScores = CATALOG_REACTIVATION_COUNT * AXIS_DEFINITIONS.length;
      if (
        verification.active_count !== TARGET_ACTIVE_KR_RACKET_COUNT_AFTER_REACTIVATION
        || insertedSources !== expectedSources
        || insertedDecisions !== expectedDecisions
        || insertedScores !== expectedScores
      ) {
        throw new Error(
          "Catalog reactivation after-verify failed; the transaction was rolled back.",
        );
      }

      return {
        models: CATALOG_REACTIVATION_COUNT,
        sources: insertedSources,
        decisions: insertedDecisions,
        scores: insertedScores,
        active: verification.active_count,
      };
    });

    console.log(
      `APPLIED atomically: ${result.models} models reactivated, ${result.sources} sources, `
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
