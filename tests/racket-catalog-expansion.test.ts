import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CATALOG_EXPANSION_COUNT,
  CATALOG_EXPANSION_REVIEWED_FIELDS,
  RACKET_CATALOG_EXPANSION,
  TARGET_ACTIVE_KR_RACKET_COUNT,
} from "../src/data/racket-catalog-expansion";
import { RACKET_SCORE_EVIDENCE } from "../src/data/racket-score-evidence";
import { resolveRacketImage } from "../src/lib/racket-images";
import {
  assertCatalogExpansionApproval,
  parseCatalogExpansionArgs,
  validateCatalogExpansionPreflight,
} from "../scripts/expand-racket-catalog";
import {
  type ActiveCatalogRow,
  validateExpansionState,
} from "../scripts/backfill-racket-evidence";

function expansionStateRows(): ActiveCatalogRow[] {
  return RACKET_CATALOG_EXPANSION.map((entry, index) => ({
    model_id: `model-${index}`,
    spec_id: `spec-${index}`,
    brand: entry.brand,
    model_name: entry.modelName,
    release_year: entry.releaseYear,
    head_size_sq_in: entry.normalizedSpec.headSizeSqIn,
    weight_g: entry.normalizedSpec.weightG,
    balance_mm: entry.normalizedSpec.balanceMm,
    swing_weight_kg_cm2: entry.normalizedSpec.swingWeightKgCm2,
    stiffness_ra: entry.normalizedSpec.stiffnessRa,
    length_mm: entry.normalizedSpec.lengthMm,
    beam_width_mm: entry.normalizedSpec.beamWidthMm,
    string_pattern: entry.normalizedSpec.stringPattern,
    ingestion_state: "published",
    expansion_sources: entry.sources.map((source) => ({
      source_role: source.role,
      source_url: source.sourceUrl,
      source_type: source.sourceType,
      raw_values: {
        ...source.rawValues,
        reviewed_fields: source.reviewedFields,
      },
      verified_by_admin: false,
    })),
    expansion_decisions: entry.normalizationDecisions.map((decision) => ({
      field: decision.field,
      resolved_value: String(entry.normalizedSpec[decision.field]),
      reason: decision.reason,
    })),
    expansion_scores: entry.axisScores.map((score) => ({
      axis_key: score.axisKey,
      score: score.score,
    })),
  }));
}

test("phase 1 adds exactly 15 unique catalog identities for a target total of 54", () => {
  assert.equal(CATALOG_EXPANSION_COUNT, 15);
  assert.equal(TARGET_ACTIVE_KR_RACKET_COUNT, 54);
  assert.equal(RACKET_CATALOG_EXPANSION.length, CATALOG_EXPANSION_COUNT);

  const identities = RACKET_CATALOG_EXPANSION.map(
    ({ brand, modelName, releaseYear }) =>
      `${brand}\u0000${modelName}\u0000${releaseYear}`,
  );
  const slugs = RACKET_CATALOG_EXPANSION.map(({ slug }) => slug);
  const productCodes = RACKET_CATALOG_EXPANSION.map(
    ({ productCode }) => productCode,
  );

  assert.equal(new Set(identities).size, CATALOG_EXPANSION_COUNT);
  assert.equal(new Set(slugs).size, CATALOG_EXPANSION_COUNT);
  assert.equal(new Set(productCodes).size, CATALOG_EXPANSION_COUNT);
});

test("each new racket keeps explicit per-source raw values and decisions", () => {
  let unpublishedFieldCount = 0;
  for (const entry of RACKET_CATALOG_EXPANSION) {
    assert.equal(entry.sources.length, 2);
    assert.equal(entry.sources[0].role, "manufacturer_static");
    assert.equal(entry.sources[0].measurementBasis, "unstrung");
    assert.equal(entry.sources[1].role, "tennis_warehouse_measured");
    assert.equal(entry.sources[1].measurementBasis, "strung");
    assert.match(entry.sources[0].sourceUrl, /^https:\/\//);
    assert.match(
      entry.sources[1].sourceUrl,
      /^https:\/\/www\.tennis-warehouse\.com\//,
    );

    const selectedFields = entry.sources.flatMap(
      ({ reviewedFields }) => reviewedFields,
    );
    assert.equal(
      selectedFields.length,
      CATALOG_EXPANSION_REVIEWED_FIELDS.length,
      entry.slug,
    );
    assert.deepEqual(
      new Set(selectedFields),
      new Set(CATALOG_EXPANSION_REVIEWED_FIELDS),
      entry.slug,
    );

    for (const source of entry.sources) {
      for (const field of CATALOG_EXPANSION_REVIEWED_FIELDS) {
        assert.ok(Object.hasOwn(source.rawValues, field), `${entry.slug}: ${field}`);
        const rawValue = source.rawValues[field];
        assert.ok(rawValue === null || typeof rawValue === "string");
        if (rawValue === null) unpublishedFieldCount += 1;
      }
      for (const field of source.reviewedFields) {
        assert.notEqual(source.rawValues[field], null, `${entry.slug}: ${field}`);
      }
    }

    assert.equal(
      entry.normalizationDecisions.length,
      CATALOG_EXPANSION_REVIEWED_FIELDS.length,
    );
    assert.deepEqual(
      new Set(entry.normalizationDecisions.map(({ field }) => field)),
      new Set(CATALOG_EXPANSION_REVIEWED_FIELDS),
    );
    for (const decision of entry.normalizationDecisions) {
      const selectedSource = entry.sources.find(
        ({ role }) => role === decision.selectedSourceRole,
      );
      assert.notEqual(selectedSource?.rawValues[decision.field], null);
      assert.match(decision.reason, /selected .* raw value/);
      assert.match(decision.reason, /normalized to/);
    }
  }
  assert.ok(unpublishedFieldCount > 0);
});

test("unpublished manufacturer fields and reviewed measurements use TW", () => {
  for (const entry of RACKET_CATALOG_EXPANSION) {
    const tennisWarehouseFields = entry.sources[1].reviewedFields;
    assert.ok(tennisWarehouseFields.includes("swingWeightKgCm2"));
    assert.ok(tennisWarehouseFields.includes("stiffnessRa"));

    if (entry.brand === "Wilson") {
      assert.ok(tennisWarehouseFields.includes("beamWidthMm"), entry.slug);
    } else {
      assert.equal(
        tennisWarehouseFields.includes("beamWidthMm"),
        false,
        entry.slug,
      );
    }

    assert.equal(
      tennisWarehouseFields.includes("balanceMm"),
      [
        "yonex-vcore-95-8th-gen-2026",
        "prince-tour-100p-305g-2026",
      ].includes(entry.slug),
      entry.slug,
    );
    assert.equal(
      tennisWarehouseFields.includes("lengthMm"),
      entry.brand === "Head",
      entry.slug,
    );
  }
});

test("the expansion deterministically carries 75 integer v3 scores in range", () => {
  const scores = RACKET_CATALOG_EXPANSION.flatMap(({ axisScores }) => axisScores);
  assert.equal(scores.length, CATALOG_EXPANSION_COUNT * 5);
  assert.ok(
    scores.every(
      ({ score }) => Number.isInteger(score) && score >= 0 && score <= 100,
    ),
  );
});

test("all 15 browser-verified TW images pass the exact slug allowlist", () => {
  for (const entry of RACKET_CATALOG_EXPANSION) {
    assert.deepEqual(resolveRacketImage(entry.imageUrl, entry.slug), {
      url: entry.imageUrl,
      source: "Tennis Warehouse",
      kind: "verified-retailer-photo",
    });
  }
});

test("the CLI requires the exact apply argument and explicit operating approval", () => {
  assert.deepEqual(parseCatalogExpansionArgs([]), { apply: false });
  assert.deepEqual(parseCatalogExpansionArgs(["--apply"]), { apply: true });
  assert.throws(
    () => parseCatalogExpansionArgs(["--write"]),
    /Unknown argument/,
  );

  assert.doesNotThrow(() => assertCatalogExpansionApproval(false, undefined));
  assert.doesNotThrow(() =>
    assertCatalogExpansionApproval(
      true,
      "canonical-operating-apply-approved",
    )
  );
  assert.throws(
    () => assertCatalogExpansionApproval(true, "yes"),
    /RACKETLAB_CATALOG_EXPANSION_APPROVAL/,
  );
});

test("read-only preflight reports inserts and rejects unknown active identities", () => {
  const legacyRows = RACKET_SCORE_EVIDENCE.map(({ identity }) => ({
    brand: identity.brand,
    model_name: identity.modelName,
  }));
  const brands = [
    ...new Set([
      ...legacyRows.map(({ brand }) => brand),
      ...RACKET_CATALOG_EXPANSION.map(({ brand }) => brand),
    ]),
  ];
  const ready = validateCatalogExpansionPreflight(
    legacyRows,
    legacyRows,
    brands,
  );
  assert.deepEqual(ready, {
    activeBefore: 39,
    insertCount: 15,
    conflicts: [],
    missingBrands: [],
  });

  const firstExpansion = RACKET_CATALOG_EXPANSION[0];
  const conflictRow = {
    brand: firstExpansion.brand,
    model_name: firstExpansion.modelName,
  };
  const conflict = validateCatalogExpansionPreflight(
    [...legacyRows, conflictRow],
    legacyRows,
    brands,
  );
  assert.equal(conflict.insertCount, 14);
  assert.deepEqual(conflict.conflicts, [
    `${firstExpansion.brand} ${firstExpansion.modelName}`,
  ]);

  assert.throws(
    () => validateCatalogExpansionPreflight(
      [...legacyRows, { brand: "Unknown", model_name: "Mystery 100" }],
      [...legacyRows, { brand: "Unknown", model_name: "Mystery 100" }],
      brands,
    ),
    /39 active KR racket identities/,
  );
});

test("the expansion CLI is guarded, transactional, add-only, and has no DDL", async () => {
  const source = await readFile(
    new URL("../scripts/expand-racket-catalog.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /parseCatalogExpansionArgs/);
  assert.match(source, /if\s*\(!apply\)/);
  assert.match(source, /sql\.begin/);
  assert.match(source, /pg_advisory_xact_lock/);
  assert.match(source, /assertCanonicalWorkflow/);
  assert.match(source, /RACKETLAB_CATALOG_EXPANSION_APPROVAL/);
  assert.match(source, /validateCatalogExpansionPreflight/);
  assert.match(source, /INSERT INTO racket_models/);
  assert.match(source, /INSERT INTO racket_variants/);
  assert.match(source, /INSERT INTO racket_specs/);
  assert.match(source, /INSERT INTO spec_sources/);
  assert.match(source, /INSERT INTO normalization_decisions/);
  assert.match(source, /INSERT INTO racket_axis_scores/);
  assert.match(source, /verified_by_admin[\s\S]*FALSE/);
  assert.match(source, /decision\.reason/);
  assert.doesNotMatch(source, /\bUPDATE\b/i);
  assert.doesNotMatch(source, /\b(?:CREATE|ALTER|DROP|TRUNCATE)\b/i);
  assert.doesNotMatch(source, /ON\s+CONFLICT\s+.*DO\s+UPDATE/is);
});

test("the legacy backfill accepts only absent or fully verified expansion state", () => {
  const complete = expansionStateRows();
  assert.equal(validateExpansionState([]), 0);
  assert.equal(validateExpansionState(complete), CATALOG_EXPANSION_COUNT);
  assert.throws(
    () => validateExpansionState(complete.slice(1)),
    /exactly 0 or 15/,
  );
  assert.throws(
    () => validateExpansionState([
      ...complete.slice(1),
      { ...complete[1], model_id: "duplicate-model" },
    ]),
    /15 unique expected brand\/model\/year/,
  );
  assert.throws(
    () => validateExpansionState([
      { ...complete[0], release_year: complete[0].release_year! - 1 },
      ...complete.slice(1),
    ]),
    /15 unique expected brand\/model\/year/,
  );
  assert.throws(
    () => validateExpansionState([
      { ...complete[0], head_size_sq_in: null },
      ...complete.slice(1),
    ]),
    /spec verification failed/,
  );
  assert.throws(
    () => validateExpansionState([
      { ...complete[0], expansion_sources: complete[0].expansion_sources.slice(1) },
      ...complete.slice(1),
    ]),
    /source verification failed/,
  );
  assert.throws(
    () => validateExpansionState([
      { ...complete[0], expansion_decisions: complete[0].expansion_decisions.slice(1) },
      ...complete.slice(1),
    ]),
    /decision verification failed/,
  );
  assert.throws(
    () => validateExpansionState([
      { ...complete[0], expansion_scores: complete[0].expansion_scores.slice(1) },
      ...complete.slice(1),
    ]),
    /v3 score verification failed/,
  );
});

test("the legacy backfill queries and validates expansion evidence before filtering", async () => {
  const source = await readFile(
    new URL("../scripts/backfill-racket-evidence.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /RACKET_CATALOG_EXPANSION/);
  assert.match(source, /validateExpansionState\(rows\)/);
  assert.match(source, /release_year/);
  assert.match(source, /expansion_sources/);
  assert.match(source, /expansion_decisions/);
  assert.match(source, /expansion_scores/);
  assert.match(source, /const legacyRows = rows\.filter/);
  assert.match(source, /validateActiveCatalogIdentities\(\s*legacyRows\.map/);
  assert.match(source, /racket_model_id IN/);
});
