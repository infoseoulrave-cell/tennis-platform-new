import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

import {
  CATALOG_EXPANSION_COUNT,
  CATALOG_EXPANSION_MANIFEST_VERSION,
  RACKET_CATALOG_EXPANSION,
} from "../src/data/racket-catalog-expansion";
import {
  activeIdentityKey,
  CANONICAL_SUPABASE_PROJECT_REF,
  EVIDENCE_MANIFEST_VERSION,
  EXPECTED_ACTIVE_KR_RACKET_COUNT,
  parseBackfillArgs,
  RACKET_SCORE_EVIDENCE,
  type RacketScoreEvidence,
  validateActiveCatalogIdentities,
} from "../src/data/racket-score-evidence";
import {
  AXIS_DEFINITIONS,
  computeAxisScores,
  SCORING_VERSION,
} from "../src/modules/recommendation/scoring-core";

const EXPECTED_SUPABASE_HOST = "ublovozxpoplfvacrmnh.supabase.co";
const EXPECTED_DIRECT_DATABASE_HOST = "db.ublovozxpoplfvacrmnh.supabase.co";
const EXPECTED_POOLER_DATABASE_HOST = "aws-1-ap-northeast-2.pooler.supabase.com";
const EXPECTED_POOLER_DATABASE_USER = "postgres.ublovozxpoplfvacrmnh";
const EXPECTED_VERCEL_PROJECT_ID = "prj_wPzKAFzr9oLIrMfLMRBDdJukdMi7";
const EXPECTED_VERCEL_ORG_ID = "team_B761Aj9bfMMOo5L3FJIVAMU3";
const EXPECTED_GIT_REMOTE = "https://github.com/infoseoulrave-cell/tennis-platform-new";
const REVIEWED_FIELDS = [
  "headSizeSqIn",
  "weightG",
  "balanceMm",
  "beamWidthMm",
  "stringPattern",
  "swingWeightKgCm2",
  "stiffnessRa",
] as const;

type ExpansionSourceRecord = {
  source_role: string | null;
  source_url: string | null;
  source_type: string;
  raw_values: Record<string, unknown>;
  verified_by_admin: boolean;
};

type ExpansionDecisionRecord = {
  field: string;
  resolved_value: string;
  reason: string;
};

type ExpansionScoreRecord = {
  axis_key: string;
  score: string | number;
};

export type ActiveCatalogRow = {
  model_id: string;
  spec_id: string;
  brand: string;
  model_name: string;
  release_year: number | null;
  head_size_sq_in: string | number | null;
  weight_g: string | number | null;
  balance_mm: string | number | null;
  swing_weight_kg_cm2: string | number | null;
  stiffness_ra: string | number | null;
  length_mm: string | number | null;
  beam_width_mm: string | null;
  string_pattern: string | null;
  ingestion_state: string | null;
  expansion_sources: ExpansionSourceRecord[];
  expansion_decisions: ExpansionDecisionRecord[];
  expansion_scores: ExpansionScoreRecord[];
};

type BackfillTarget = {
  row: ActiveCatalogRow;
  evidence: RacketScoreEvidence;
};

function catalogIdentityKey(
  brand: string,
  modelName: string,
  releaseYear: number | null,
): string {
  return `${activeIdentityKey(brand, modelName)}\u0000${releaseYear ?? ""}`;
}

function numericSpecMatches(
  actual: string | number | null,
  expected: number,
): boolean {
  return actual !== null && Number(actual) === expected;
}

export function validateExpansionState(
  rows: readonly ActiveCatalogRow[],
): 0 | typeof CATALOG_EXPANSION_COUNT {
  const expectedByModelIdentity = new Map(
    RACKET_CATALOG_EXPANSION.map((entry) => [
      activeIdentityKey(entry.brand, entry.modelName),
      entry,
    ]),
  );
  const expansionRows = rows.filter(({ brand, model_name }) =>
    expectedByModelIdentity.has(activeIdentityKey(brand, model_name))
  );

  if (expansionRows.length === 0) return 0;
  if (expansionRows.length !== CATALOG_EXPANSION_COUNT) {
    throw new Error(
      `Catalog expansion state must contain exactly 0 or ${CATALOG_EXPANSION_COUNT} `
      + `rows; received ${expansionRows.length}.`,
    );
  }

  const expectedIdentities = new Set(
    RACKET_CATALOG_EXPANSION.map(({ brand, modelName, releaseYear }) =>
      catalogIdentityKey(brand, modelName, releaseYear)
    ),
  );
  const actualIdentities = expansionRows.map(
    ({ brand, model_name, release_year }) =>
      catalogIdentityKey(brand, model_name, release_year),
  );
  if (
    new Set(actualIdentities).size !== CATALOG_EXPANSION_COUNT
    || actualIdentities.some((identity) => !expectedIdentities.has(identity))
  ) {
    throw new Error(
      "Catalog expansion must contain exactly 15 unique expected brand/model/year identities.",
    );
  }

  for (const row of expansionRows) {
    const entry = expectedByModelIdentity.get(
      activeIdentityKey(row.brand, row.model_name),
    );
    if (!entry || !row.spec_id) {
      throw new Error(`Catalog expansion is missing a required spec for ${row.brand} ${row.model_name}.`);
    }
    const spec = entry.normalizedSpec;
    const specMatches =
      numericSpecMatches(row.head_size_sq_in, spec.headSizeSqIn)
      && numericSpecMatches(row.weight_g, spec.weightG)
      && numericSpecMatches(row.balance_mm, spec.balanceMm)
      && numericSpecMatches(row.swing_weight_kg_cm2, spec.swingWeightKgCm2)
      && numericSpecMatches(row.stiffness_ra, spec.stiffnessRa)
      && numericSpecMatches(row.length_mm, spec.lengthMm)
      && row.beam_width_mm === spec.beamWidthMm
      && row.string_pattern === spec.stringPattern
      && row.ingestion_state === "published";
    if (!specMatches) {
      throw new Error(`Catalog expansion spec verification failed for ${entry.slug}.`);
    }

    if (row.expansion_sources.length !== entry.sources.length) {
      throw new Error(`Catalog expansion source verification failed for ${entry.slug}.`);
    }
    for (const expectedSource of entry.sources) {
      const source = row.expansion_sources.find(
        ({ source_role }) => source_role === expectedSource.role,
      );
      if (
        !source
        || source.source_url !== expectedSource.sourceUrl
        || source.source_type !== expectedSource.sourceType
        || source.verified_by_admin
      ) {
        throw new Error(`Catalog expansion source verification failed for ${entry.slug}.`);
      }
      for (const [field, expectedValue] of Object.entries(expectedSource.rawValues)) {
        if (source.raw_values[field] !== expectedValue) {
          throw new Error(`Catalog expansion raw evidence verification failed for ${entry.slug} ${field}.`);
        }
      }
      const reviewedFields = source.raw_values.reviewed_fields;
      if (
        !Array.isArray(reviewedFields)
        || reviewedFields.length !== expectedSource.reviewedFields.length
        || expectedSource.reviewedFields.some((field) => !reviewedFields.includes(field))
      ) {
        throw new Error(`Catalog expansion reviewed-field verification failed for ${entry.slug}.`);
      }
    }

    if (row.expansion_decisions.length !== entry.normalizationDecisions.length) {
      throw new Error(`Catalog expansion decision verification failed for ${entry.slug}.`);
    }
    for (const expectedDecision of entry.normalizationDecisions) {
      const decision = row.expansion_decisions.find(
        ({ field }) => field === expectedDecision.field,
      );
      if (
        !decision
        || decision.resolved_value !== String(spec[expectedDecision.field])
        || decision.reason !== expectedDecision.reason
      ) {
        throw new Error(`Catalog expansion decision verification failed for ${entry.slug} ${expectedDecision.field}.`);
      }
    }

    if (row.expansion_scores.length !== entry.axisScores.length) {
      throw new Error(`Catalog expansion ${SCORING_VERSION} score verification failed for ${entry.slug}.`);
    }
    for (const expectedScore of entry.axisScores) {
      const score = row.expansion_scores.find(
        ({ axis_key }) => axis_key === expectedScore.axisKey,
      );
      if (!score || Number(score.score) !== expectedScore.score) {
        throw new Error(`Catalog expansion ${SCORING_VERSION} score verification failed for ${entry.slug}.`);
      }
    }
  }

  return CATALOG_EXPANSION_COUNT;
}

export function loadEnvironment(): Record<string, string> {
  const loaded: Record<string, string> = {};
  for (const line of readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const name = match[1].trim();
    const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    loaded[name] = process.env[name] ?? value;
  }
  return loaded;
}

export function assertCanonicalDatabaseUrl(databaseUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL is not the canonical Supabase database URL.");
  }

  const supportedProtocol = parsed.protocol === "postgres:"
    || parsed.protocol === "postgresql:";
  const database = parsed.pathname === "/postgres";
  const direct = parsed.hostname === EXPECTED_DIRECT_DATABASE_HOST
    && decodeURIComponent(parsed.username) === "postgres"
    && (parsed.port === "" || parsed.port === "5432");
  const pooler = parsed.hostname === EXPECTED_POOLER_DATABASE_HOST
    && decodeURIComponent(parsed.username) === EXPECTED_POOLER_DATABASE_USER
    && parsed.port === "6543";

  if (!supportedProtocol || !database || (!direct && !pooler)) {
    throw new Error("DATABASE_URL is not the canonical Supabase database URL.");
  }
}

export function isCanonicalGitRemote(remote: string): boolean {
  return remote.trim().replace(/\.git$/, "") === EXPECTED_GIT_REMOTE;
}

export function assertApplyWorkflowState(
  apply: boolean,
  porcelainStatus: string,
  head: string,
  originMain: string,
): void {
  if (!apply) return;
  if (porcelainStatus.trim()) {
    throw new Error("Apply requires a clean worktree, including no untracked files.");
  }
  if (head.trim() !== originMain.trim()) {
    throw new Error("Apply requires HEAD to equal origin/main.");
  }
}

export function assertCanonicalWorkflow(
  environment: Record<string, string>,
  apply: boolean,
): string {
  const supabaseUrl = environment.NEXT_PUBLIC_SUPABASE_URL;
  const databaseUrl = environment.DATABASE_URL;
  if (!supabaseUrl || !databaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and DATABASE_URL are required.");
  }

  const parsedSupabaseUrl = new URL(supabaseUrl);
  if (
    parsedSupabaseUrl.protocol !== "https:"
    || parsedSupabaseUrl.hostname !== EXPECTED_SUPABASE_HOST
    || parsedSupabaseUrl.hostname.split(".")[0] !== CANONICAL_SUPABASE_PROJECT_REF
  ) {
    throw new Error("Refusing to run against a non-canonical Supabase project.");
  }
  assertCanonicalDatabaseUrl(databaseUrl);

  const vercelProject = JSON.parse(
    readFileSync(resolve(".vercel", "project.json"), "utf8"),
  ) as { projectId?: string; orgId?: string };
  if (
    vercelProject.projectId !== EXPECTED_VERCEL_PROJECT_ID
    || vercelProject.orgId !== EXPECTED_VERCEL_ORG_ID
  ) {
    throw new Error("Refusing to run outside the canonical racketlab Vercel project.");
  }

  const safeDirectory = `safe.directory=${resolve(".")}`;
  const branch = execFileSync("git", ["-c", safeDirectory, "branch", "--show-current"], {
    encoding: "utf8",
  }).trim();
  if (branch !== "main") {
    throw new Error(`Expected the main workflow branch; received ${branch || "detached HEAD"}.`);
  }
  const remote = execFileSync("git", ["-c", safeDirectory, "remote", "get-url", "origin"], {
    encoding: "utf8",
  }).trim();
  if (!isCanonicalGitRemote(remote)) {
    throw new Error("Refusing to run outside infoseoulrave-cell/tennis-platform-new.");
  }
  if (apply) {
    const porcelainStatus = execFileSync(
      "git",
      ["-c", safeDirectory, "status", "--porcelain"],
      { encoding: "utf8" },
    );
    const head = execFileSync(
      "git",
      ["-c", safeDirectory, "rev-parse", "HEAD"],
      { encoding: "utf8" },
    );
    const originMain = execFileSync(
      "git",
      ["-c", safeDirectory, "rev-parse", "origin/main"],
      { encoding: "utf8" },
    );
    assertApplyWorkflowState(apply, porcelainStatus, head, originMain);
  }

  return databaseUrl;
}

function resolveTargets(rows: readonly ActiveCatalogRow[]): BackfillTarget[] {
  validateExpansionState(rows);
  const expansionIdentities = new Set(
    RACKET_CATALOG_EXPANSION.map(({ brand, modelName }) =>
      activeIdentityKey(brand, modelName)
    ),
  );
  const legacyRows = rows.filter(({ brand, model_name }) =>
    !expansionIdentities.has(activeIdentityKey(brand, model_name))
  );

  validateActiveCatalogIdentities(
    legacyRows.map(({ brand, model_name }) => activeIdentityKey(brand, model_name)),
  );

  const evidenceByAcceptedIdentity = new Map<string, RacketScoreEvidence>();
  for (const entry of RACKET_SCORE_EVIDENCE) {
    evidenceByAcceptedIdentity.set(
      activeIdentityKey(entry.identity.brand, entry.identity.lookupModelName),
      entry,
    );
    evidenceByAcceptedIdentity.set(
      activeIdentityKey(entry.identity.brand, entry.identity.modelName),
      entry,
    );
  }

  const targets = legacyRows.map((row) => {
    if (!row.spec_id) {
      throw new Error(`Active catalog is missing a required spec for ${row.brand} ${row.model_name}.`);
    }
    const entry = evidenceByAcceptedIdentity.get(
      activeIdentityKey(row.brand, row.model_name),
    );
    if (!entry) {
      throw new Error(`No evidence entry for ${row.brand} ${row.model_name}.`);
    }
    return { row, evidence: entry };
  });

  if (new Set(targets.map(({ evidence }) => evidence)).size !== RACKET_SCORE_EVIDENCE.length) {
    throw new Error("Active catalog identities do not map one-to-one to the evidence manifest.");
  }
  return targets;
}

function imageUrl(productCode: string): string {
  return `https://img.tennis-warehouse.com/watermark/rs.php?path=${productCode}-1.jpg&nw=500`;
}

function plannedScores(targets: readonly BackfillTarget[]) {
  const scores = targets.flatMap(({ row, evidence }) =>
    computeAxisScores(evidence.normalizedSpec).map((score) => ({
      modelId: row.model_id,
      modelName: evidence.identity.modelName,
      ...score,
    })),
  );
  if (scores.length !== 39 * 5) {
    throw new Error(`Expected 195 v3 scores; computed ${scores.length}.`);
  }
  return scores;
}

async function main(): Promise<void> {
  const { apply } = parseBackfillArgs(process.argv.slice(2));
  const databaseUrl = assertCanonicalWorkflow(loadEnvironment(), apply);
  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    if (!apply) {
      const activeRows = await sql<ActiveCatalogRow[]>`
        SELECT
          rm.id AS model_id,
          rs.id AS spec_id,
          b.name AS brand,
          rm.name AS model_name,
          rm.release_year,
          rs.head_size_sq_in,
          rs.weight_g,
          rs.balance_mm,
          rs.swing_weight_kg_cm2,
          rs.stiffness_ra,
          rs.length_mm,
          rs.beam_width_mm,
          rs.string_pattern,
          rs.ingestion_state,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'source_role', ss.raw_values ->> 'source_role',
                'source_url', ss.source_url,
                'source_type', ss.source_type,
                'raw_values', ss.raw_values,
                'verified_by_admin', ss.verified_by_admin
              )
              ORDER BY ss.raw_values ->> 'source_role'
            )
            FROM spec_sources ss
            WHERE ss.racket_specs_id = rs.id
              AND ss.raw_values ->> 'evidence_manifest_version'
                = ${CATALOG_EXPANSION_MANIFEST_VERSION}
          ), '[]'::jsonb) AS expansion_sources,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'field', nd.field,
                'resolved_value', nd.resolved_value,
                'reason', nd.reason
              )
              ORDER BY nd.field
            )
            FROM normalization_decisions nd
            WHERE nd.racket_specs_id = rs.id
              AND nd.reviewed_by = ${CATALOG_EXPANSION_MANIFEST_VERSION}
          ), '[]'::jsonb) AS expansion_decisions,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'axis_key', ad.axis_key,
                'score', ras.score
              )
              ORDER BY ad.axis_key
            )
            FROM racket_axis_scores ras
            JOIN axis_definitions ad ON ad.id = ras.axis_definition_id
            WHERE ras.racket_model_id = rm.id
              AND ras.scoring_version = ${SCORING_VERSION}
              AND ad.version = ${SCORING_VERSION}
          ), '[]'::jsonb) AS expansion_scores
        FROM racket_models rm
        JOIN brands b ON b.id = rm.brand_id
        LEFT JOIN racket_specs rs ON rs.racket_model_id = rm.id
        WHERE rm.discontinued = FALSE
          AND EXISTS (
            SELECT 1
            FROM racket_variants rv
            WHERE rv.racket_model_id = rm.id
              AND rv.region_code = 'KR'
              AND rv.available_in_korea = TRUE
          )
        ORDER BY b.name, rm.name
      `;
      const targets = resolveTargets(activeRows);
      const scores = plannedScores(targets);
      const identityCorrections = targets.filter(({ row, evidence }) =>
        row.model_name !== evidence.identity.modelName
        || row.release_year !== evidence.identity.releaseYear
      );

      console.log("DRY RUN — no database mutations were executed.");
      console.log(`Canonical active KR identities: ${targets.length}`);
      console.log(`Evidence sources to upsert: ${targets.length * 2}`);
      console.log(`Normalization decisions to upsert: ${targets.length * REVIEWED_FIELDS.length}`);
      console.log(`Axis definitions to upsert: ${AXIS_DEFINITIONS.length}`);
      console.log(`Deterministic ${SCORING_VERSION} scores to upsert: ${scores.length}`);
      console.log(`Identity corrections: ${identityCorrections.length}`);
      for (const { row, evidence } of identityCorrections) {
        console.log(
          `  ${row.brand}: ${row.model_name} (${row.release_year}) -> `
          + `${evidence.identity.modelName} (${evidence.identity.releaseYear})`,
        );
      }
      console.log("Run with the exact --apply flag to execute the guarded transaction.");
      return;
    }

    const result = await sql.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(hashtext(${EVIDENCE_MANIFEST_VERSION}))
      `;

      const activeRows = await transaction<ActiveCatalogRow[]>`
        SELECT
          rm.id AS model_id,
          rs.id AS spec_id,
          b.name AS brand,
          rm.name AS model_name,
          rm.release_year,
          rs.head_size_sq_in,
          rs.weight_g,
          rs.balance_mm,
          rs.swing_weight_kg_cm2,
          rs.stiffness_ra,
          rs.length_mm,
          rs.beam_width_mm,
          rs.string_pattern,
          rs.ingestion_state,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'source_role', ss.raw_values ->> 'source_role',
                'source_url', ss.source_url,
                'source_type', ss.source_type,
                'raw_values', ss.raw_values,
                'verified_by_admin', ss.verified_by_admin
              )
              ORDER BY ss.raw_values ->> 'source_role'
            )
            FROM spec_sources ss
            WHERE ss.racket_specs_id = rs.id
              AND ss.raw_values ->> 'evidence_manifest_version'
                = ${CATALOG_EXPANSION_MANIFEST_VERSION}
          ), '[]'::jsonb) AS expansion_sources,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'field', nd.field,
                'resolved_value', nd.resolved_value,
                'reason', nd.reason
              )
              ORDER BY nd.field
            )
            FROM normalization_decisions nd
            WHERE nd.racket_specs_id = rs.id
              AND nd.reviewed_by = ${CATALOG_EXPANSION_MANIFEST_VERSION}
          ), '[]'::jsonb) AS expansion_decisions,
          COALESCE((
            SELECT jsonb_agg(
              jsonb_build_object(
                'axis_key', ad.axis_key,
                'score', ras.score
              )
              ORDER BY ad.axis_key
            )
            FROM racket_axis_scores ras
            JOIN axis_definitions ad ON ad.id = ras.axis_definition_id
            WHERE ras.racket_model_id = rm.id
              AND ras.scoring_version = ${SCORING_VERSION}
              AND ad.version = ${SCORING_VERSION}
          ), '[]'::jsonb) AS expansion_scores
        FROM racket_models rm
        JOIN brands b ON b.id = rm.brand_id
        LEFT JOIN racket_specs rs ON rs.racket_model_id = rm.id
        WHERE rm.discontinued = FALSE
          AND EXISTS (
            SELECT 1
            FROM racket_variants rv
            WHERE rv.racket_model_id = rm.id
              AND rv.region_code = 'KR'
              AND rv.available_in_korea = TRUE
          )
        ORDER BY b.name, rm.name
        FOR UPDATE OF rm
      `;
      const targets = resolveTargets(activeRows);
      const scores = plannedScores(targets);

      for (const { row, evidence: entry } of targets) {
        await transaction`
          UPDATE racket_models
          SET
            name = ${entry.identity.modelName},
            release_year = ${entry.identity.releaseYear},
            image_url = ${imageUrl(entry.identity.productCode)},
            updated_at = NOW()
          WHERE id = ${row.model_id}
        `;

        for (const alias of entry.identity.legacyModelNames) {
          const existingAlias = await transaction<{ id: string }[]>`
            SELECT id
            FROM racket_aliases
            WHERE racket_model_id = ${row.model_id}
              AND lower(alias) = lower(${alias})
            LIMIT 1
          `;
          if (existingAlias.length === 0) {
            await transaction`
              INSERT INTO racket_aliases (racket_model_id, alias, alias_type)
              VALUES (${row.model_id}, ${alias}, 'community')
            `;
          }
        }

        const spec = entry.normalizedSpec;
        await transaction`
          UPDATE racket_specs
          SET
            head_size_sq_in = ${spec.headSizeSqIn},
            weight_g = ${spec.weightG},
            balance_mm = ${spec.balanceMm},
            beam_width_mm = ${spec.beamWidthMm},
            string_pattern = ${spec.stringPattern},
            swing_weight_kg_cm2 = ${spec.swingWeightKgCm2},
            stiffness_ra = ${spec.stiffnessRa},
            ingestion_state = 'published',
            updated_at = NOW()
          WHERE id = ${row.spec_id}
        `;

        for (const source of entry.sources) {
          const rawValues = {
            ...source.rawValues,
            reviewed_fields: source.reviewedFields,
            source_note: source.note ?? null,
          };
          const existingSource = await transaction<{ id: string }[]>`
            SELECT id
            FROM spec_sources
            WHERE racket_specs_id = ${row.spec_id}
              AND raw_values ->> 'evidence_manifest_version' = ${EVIDENCE_MANIFEST_VERSION}
              AND raw_values ->> 'source_role' = ${source.role}
            LIMIT 1
            FOR UPDATE
          `;
          if (existingSource[0]) {
            await transaction`
              UPDATE spec_sources
              SET
                source_url = ${source.sourceUrl},
                source_type = ${source.sourceType},
                raw_values = ${transaction.json(rawValues)},
                confidence = ${source.role === "manufacturer_static" ? 1 : 0.95},
                captured_at = ${source.capturedAt},
                verified_by_admin = TRUE
              WHERE id = ${existingSource[0].id}
            `;
          } else {
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
                ${row.spec_id},
                ${source.sourceUrl},
                ${source.sourceType},
                ${transaction.json(rawValues)},
                ${source.role === "manufacturer_static" ? 1 : 0.95},
                ${source.capturedAt},
                TRUE
              )
            `;
          }
        }

        for (const field of REVIEWED_FIELDS) {
          const selectedSource = entry.sources.find((source) =>
            source.reviewedFields.includes(field)
          );
          if (!selectedSource) {
            throw new Error(`No selected source for ${entry.identity.modelName} ${field}.`);
          }
          const resolvedValue = String(entry.normalizedSpec[field]);
          const sourceComparison = entry.sources.map((source) => ({
            source_role: source.role,
            source_url: source.sourceUrl,
            measurement_basis: source.measurementBasis,
            raw_value: source.rawValues[field] ?? null,
          }));
          const reason =
            `${EVIDENCE_MANIFEST_VERSION}: selected ${selectedSource.role} `
            + `(${selectedSource.measurementBasis}) under the explicit mixed-basis policy.`;
          const existingDecision = await transaction<{ id: string }[]>`
            SELECT id
            FROM normalization_decisions
            WHERE racket_specs_id = ${row.spec_id}
              AND field = ${field}
              AND reviewed_by = ${EVIDENCE_MANIFEST_VERSION}
            LIMIT 1
            FOR UPDATE
          `;
          if (existingDecision[0]) {
            await transaction`
              UPDATE normalization_decisions
              SET
                conflicting_sources = ${transaction.json(sourceComparison)},
                resolved_value = ${resolvedValue},
                reason = ${reason},
                reviewed_at = NOW()
              WHERE id = ${existingDecision[0].id}
            `;
          } else {
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
                ${row.spec_id},
                ${field},
                ${transaction.json(sourceComparison)},
                ${resolvedValue},
                ${reason},
                ${EVIDENCE_MANIFEST_VERSION}
              )
            `;
          }
        }
      }

      const axisDefinitionIds = new Map<string, string>();
      for (const definition of AXIS_DEFINITIONS) {
        const [axisDefinition] = await transaction<{ id: string; axis_key: string }[]>`
          INSERT INTO axis_definitions (
            version,
            axis_key,
            axis_name,
            axis_name_ko,
            description,
            scoring_formula,
            weight_default
          )
          VALUES (
            ${SCORING_VERSION},
            ${definition.axisKey},
            ${definition.axisName},
            ${definition.axisNameKo},
            ${definition.description},
            ${definition.scoringFormula},
            ${definition.weightDefault}
          )
          ON CONFLICT (version, axis_key)
          DO UPDATE SET
            axis_name = EXCLUDED.axis_name,
            axis_name_ko = EXCLUDED.axis_name_ko,
            description = EXCLUDED.description,
            scoring_formula = EXCLUDED.scoring_formula,
            weight_default = EXCLUDED.weight_default
          RETURNING id, axis_key
        `;
        axisDefinitionIds.set(axisDefinition.axis_key, axisDefinition.id);
      }

      for (const score of scores) {
        const axisDefinitionId = axisDefinitionIds.get(score.axisKey);
        if (!axisDefinitionId) {
          throw new Error(`Missing ${SCORING_VERSION} axis definition for ${score.axisKey}.`);
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
            ${score.modelId},
            ${axisDefinitionId},
            ${SCORING_VERSION},
            ${score.score},
            ${transaction.json(score.inputSnapshot)},
            NOW()
          )
          ON CONFLICT (racket_model_id, axis_definition_id, scoring_version)
          DO UPDATE SET
            score = EXCLUDED.score,
            input_snapshot = EXCLUDED.input_snapshot,
            computed_at = EXCLUDED.computed_at
        `;
      }

      const [verification] = await transaction<{
        score_count: number;
        source_count: number;
        decision_count: number;
        axis_count: number;
      }[]>`
        SELECT
          (
            SELECT count(*)::int
            FROM racket_axis_scores
            WHERE scoring_version = ${SCORING_VERSION}
              AND racket_model_id IN ${
                transaction(targets.map(({ row }) => row.model_id))
              }
          ) AS score_count,
          (
            SELECT count(*)::int
            FROM spec_sources
            WHERE raw_values ->> 'evidence_manifest_version' = ${EVIDENCE_MANIFEST_VERSION}
          ) AS source_count,
          (
            SELECT count(*)::int
            FROM normalization_decisions
            WHERE reviewed_by = ${EVIDENCE_MANIFEST_VERSION}
          ) AS decision_count,
          (
            SELECT count(*)::int
            FROM axis_definitions
            WHERE version = ${SCORING_VERSION}
          ) AS axis_count
      `;

      const expectedScoreCount = EXPECTED_ACTIVE_KR_RACKET_COUNT * 5;
      if (verification.score_count !== expectedScoreCount) {
        throw new Error(
          `After-verify failed: expected ${expectedScoreCount} ${SCORING_VERSION} scores, `
          + `received ${verification.score_count}.`,
        );
      }
      if (verification.source_count !== EXPECTED_ACTIVE_KR_RACKET_COUNT * 2) {
        throw new Error(`After-verify failed: source count ${verification.source_count}.`);
      }
      if (
        verification.decision_count
        !== EXPECTED_ACTIVE_KR_RACKET_COUNT * REVIEWED_FIELDS.length
      ) {
        throw new Error(`After-verify failed: decision count ${verification.decision_count}.`);
      }
      if (verification.axis_count !== AXIS_DEFINITIONS.length) {
        throw new Error(`After-verify failed: axis definition count ${verification.axis_count}.`);
      }

      return verification;
    });

    console.log(
      `APPLIED atomically: ${result.source_count} sources, ${result.decision_count} decisions, `
      + `${result.axis_count} axes, ${result.score_count} ${SCORING_VERSION} scores.`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
