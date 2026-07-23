import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  CANONICAL_SUPABASE_PROJECT_REF,
  EXPECTED_ACTIVE_KR_RACKET_COUNT,
  RACKET_SCORE_EVIDENCE,
  parseBackfillArgs,
  validateActiveCatalogIdentities,
} from "../src/data/racket-score-evidence";
import {
  assertApplyWorkflowState,
  assertCanonicalDatabaseUrl,
  isCanonicalGitRemote,
} from "../scripts/backfill-racket-evidence";
import { computeAxisScores } from "../src/modules/recommendation/scoring-core";

test("the evidence manifest covers exactly 39 unique active KR identities", () => {
  assert.equal(CANONICAL_SUPABASE_PROJECT_REF, "ublovozxpoplfvacrmnh");
  assert.equal(EXPECTED_ACTIVE_KR_RACKET_COUNT, 39);
  assert.equal(RACKET_SCORE_EVIDENCE.length, EXPECTED_ACTIVE_KR_RACKET_COUNT);

  const lookupKeys = RACKET_SCORE_EVIDENCE.map(
    ({ identity }) => `${identity.brand}\u0000${identity.lookupModelName}`,
  );
  const canonicalKeys = RACKET_SCORE_EVIDENCE.map(
    ({ identity }) => `${identity.brand}\u0000${identity.modelName}\u0000${identity.releaseYear}`,
  );
  assert.equal(new Set(lookupKeys).size, EXPECTED_ACTIVE_KR_RACKET_COUNT);
  assert.equal(new Set(canonicalKeys).size, EXPECTED_ACTIVE_KR_RACKET_COUNT);
  assert.doesNotThrow(() => validateActiveCatalogIdentities(lookupKeys));
  assert.throws(
    () => validateActiveCatalogIdentities(lookupKeys.slice(1)),
    /39 active KR racket identities/,
  );
});

test("every normalized spec records manufacturer unstrung and TW strung evidence", () => {
  const staticFields = [
    "headSizeSqIn",
    "weightG",
    "balanceMm",
    "beamWidthMm",
    "stringPattern",
  ] as const;

  for (const entry of RACKET_SCORE_EVIDENCE) {
    assert.equal(entry.sources.length, 2);
    assert.equal(entry.sources[0].role, "manufacturer_static");
    assert.equal(entry.sources[0].measurementBasis, "unstrung");
    assert.match(entry.sources[0].sourceUrl, /^https:\/\//);
    assert.deepEqual(entry.sources[0].reviewedFields, staticFields);

    assert.equal(entry.sources[1].role, "tennis_warehouse_measured");
    assert.equal(entry.sources[1].measurementBasis, "strung");
    assert.match(
      entry.sources[1].sourceUrl,
      /^https:\/\/www\.tennis-warehouse\.com\//,
    );
    assert.deepEqual(entry.sources[1].reviewedFields, [
      "swingWeightKgCm2",
      "stiffnessRa",
    ]);

    for (const source of entry.sources) {
      assert.equal(source.rawValues.evidence_manifest_version, "racket-score-evidence-2026-07-23-v1");
      assert.equal(source.rawValues.source_role, source.role);
      assert.equal(source.rawValues.measurement_basis, source.measurementBasis);
      assert.equal(source.rawValues.product_code, entry.identity.productCode);
      assert.equal(typeof source.rawValues.source_code, "string");
      assert.ok(Number.isFinite(Date.parse(String(source.rawValues.captured_at))));
    }

    for (const field of staticFields) {
      assert.equal(
        entry.sources[0].rawValues[field],
        entry.normalizedSpec[field],
        `${entry.identity.modelName}: ${field}`,
      );
    }
    assert.equal(
      entry.sources[1].rawValues.swingWeightKgCm2,
      entry.normalizedSpec.swingWeightKgCm2,
    );
    assert.equal(
      entry.sources[1].rawValues.stiffnessRa,
      entry.normalizedSpec.stiffnessRa,
    );
  }
});

test("confirmed identity and measurement corrections are pinned", () => {
  const byModel = new Map(
    RACKET_SCORE_EVIDENCE.map((entry) => [entry.identity.modelName, entry]),
  );

  assert.deepEqual(
    [
      byModel.get("Speed Pro 2026")?.normalizedSpec.swingWeightKgCm2,
      byModel.get("Speed Pro 2026")?.normalizedSpec.stiffnessRa,
      byModel.get("Speed MP 2026")?.normalizedSpec.swingWeightKgCm2,
      byModel.get("Speed MP 2026")?.normalizedSpec.stiffnessRa,
      byModel.get("Speed MP L 2026")?.normalizedSpec.swingWeightKgCm2,
      byModel.get("Speed MP L 2026")?.normalizedSpec.stiffnessRa,
    ],
    [328, 61, 329, 60, 316, 61],
  );

  const prestige = byModel.get("Prestige MP 2023");
  assert.equal(prestige?.identity.lookupModelName, "Prestige MP 2025");
  assert.deepEqual(prestige?.identity.legacyModelNames, ["Prestige MP 2025"]);
  assert.deepEqual(prestige?.normalizedSpec, {
    headSizeSqIn: 99,
    weightG: 310,
    balanceMm: 320,
    beamWidthMm: "21.5",
    stringPattern: "18x19",
    swingWeightKgCm2: 327,
    stiffnessRa: 62,
  });

  const tfight = byModel.get("T-Fight 305 Isoflex 2022");
  assert.equal(tfight?.identity.lookupModelName, "T-Fight 305 Isoflex 2024");
  assert.equal(tfight?.identity.releaseYear, 2022);
  assert.equal(tfight?.identity.productCode, "ISO305");
  assert.deepEqual(
    {
      weightG: tfight?.normalizedSpec.weightG,
      headSizeSqIn: tfight?.normalizedSpec.headSizeSqIn,
      stringPattern: tfight?.normalizedSpec.stringPattern,
      beamWidthMm: tfight?.normalizedSpec.beamWidthMm,
      balanceMm: tfight?.normalizedSpec.balanceMm,
      swingWeightKgCm2: tfight?.normalizedSpec.swingWeightKgCm2,
      stiffnessRa: tfight?.normalizedSpec.stiffnessRa,
    },
    {
      weightG: 305,
      headSizeSqIn: 98,
      stringPattern: "18x19",
      beamWidthMm: "22.5",
      balanceMm: 325,
      swingWeightKgCm2: 338,
      stiffnessRa: 64,
    },
  );

  assert.equal(byModel.get("Pure Aero 2026")?.normalizedSpec.balanceMm, 321);
  assert.equal(byModel.get("Pure Drive 2025")?.normalizedSpec.beamWidthMm, "23/26/23");
  assert.equal(byModel.get("Blade 98 16x19 V9")?.normalizedSpec.balanceMm, 320);
  assert.equal(byModel.get("Blade 100L V9")?.normalizedSpec.balanceMm, 330);
  assert.equal(byModel.get("VCORE 98 2026")?.normalizedSpec.balanceMm, 315);
  assert.deepEqual(
    {
      balanceMm: byModel.get("TF-40 305 2024")?.normalizedSpec.balanceMm,
      beamWidthMm: byModel.get("TF-40 305 2024")?.normalizedSpec.beamWidthMm,
    },
    { balanceMm: 325, beamWidthMm: "21.7" },
  );
  assert.equal(byModel.get("CX 200 2025")?.normalizedSpec.swingWeightKgCm2, 308);

  assert.match(
    byModel.get("Pure Strike 100 2024")?.sources[1].note ?? "",
    /alternate cosmetic/i,
  );
  assert.match(
    byModel.get("Blade 98 16x19 V9")?.sources[0].note ?? "",
    /alternate cosmetic/i,
  );
  assert.match(
    byModel.get("Percept 100D 2025")?.sources[1].note ?? "",
    /alternate cosmetic/i,
  );
  assert.match(
    byModel.get("FX 500 2025")?.sources[0].note ?? "",
    /generation\/year label/i,
  );
});

test("the manifest deterministically produces exactly 195 v3 axis scores", () => {
  const first = RACKET_SCORE_EVIDENCE.flatMap((entry) =>
    computeAxisScores(entry.normalizedSpec),
  );
  const second = RACKET_SCORE_EVIDENCE.flatMap((entry) =>
    computeAxisScores(entry.normalizedSpec),
  );

  assert.equal(first.length, 39 * 5);
  assert.deepEqual(first, second);
  assert.ok(first.every(({ score }) => score >= 0 && score <= 100));
});

test("backfill argument parsing is dry-run by default and requires exact --apply", () => {
  assert.deepEqual(parseBackfillArgs([]), { apply: false });
  assert.deepEqual(parseBackfillArgs(["--apply"]), { apply: true });
  assert.throws(() => parseBackfillArgs(["--write"]), /Unknown argument/);
});

test("the backfill is one guarded transaction with no DDL or REST mutation path", async () => {
  const source = await readFile(
    new URL("../scripts/backfill-racket-evidence.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /ublovozxpoplfvacrmnh/);
  assert.match(source, /prj_wPzKAFzr9oLIrMfLMRBDdJukdMi7/);
  assert.match(source, /team_B761Aj9bfMMOo5L3FJIVAMU3/);
  assert.match(source, /infoseoulrave-cell\/tennis-platform-new/);
  assert.match(source, /branch\s*!==\s*"main"/);
  assert.match(source, /safe\.directory=/);
  assert.match(source, /sql\.begin/);
  assert.match(source, /if\s*\(!apply\)/);
  assert.match(source, /39\s*\*\s*5/);
  assert.doesNotMatch(source, /\b(?:CREATE|ALTER|DROP)\s+(?:TABLE|TYPE|INDEX)\b/i);
  assert.doesNotMatch(source, /createClient|@supabase\/supabase-js/);
});

test("database and Git guards validate parsed canonical coordinates, not marker substrings", () => {
  assert.doesNotThrow(() =>
    assertCanonicalDatabaseUrl(
      "postgresql://postgres:secret@db.ublovozxpoplfvacrmnh.supabase.co:5432/postgres",
    )
  );
  assert.doesNotThrow(() =>
    assertCanonicalDatabaseUrl(
      "postgresql://postgres.ublovozxpoplfvacrmnh:secret@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true",
    )
  );
  assert.throws(
    () => assertCanonicalDatabaseUrl(
      "postgresql://postgres:ublovozxpoplfvacrmnh@db.unrelated.supabase.co:5432/postgres",
    ),
    /canonical Supabase database/,
  );
  assert.throws(
    () => assertCanonicalDatabaseUrl(
      "postgresql://postgres.wrongref:secret@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?ref=ublovozxpoplfvacrmnh",
    ),
    /canonical Supabase database/,
  );
  assert.throws(
    () => assertCanonicalDatabaseUrl(
      "postgresql://postgres.ublovozxpoplfvacrmnh:secret@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres",
    ),
    /canonical Supabase database/,
  );
  assert.throws(
    () => assertCanonicalDatabaseUrl(
      "https://postgres.ublovozxpoplfvacrmnh:secret@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres",
    ),
    /canonical Supabase database/,
  );

  assert.equal(
    isCanonicalGitRemote("https://github.com/infoseoulrave-cell/tennis-platform-new.git"),
    true,
  );
  assert.equal(
    isCanonicalGitRemote("https://github.com/infoseoulrave-cell/tennis-platform-new"),
    true,
  );
  assert.equal(
    isCanonicalGitRemote("https://example.com/infoseoulrave-cell/tennis-platform-new.git"),
    false,
  );
  assert.equal(
    isCanonicalGitRemote("git@github.com:infoseoulrave-cell/tennis-platform-new.git"),
    false,
  );
});

test("apply requires a clean worktree exactly at origin/main while dry-run permits dirt", () => {
  assert.doesNotThrow(() =>
    assertApplyWorkflowState(false, "?? untracked.ts", "local", "origin")
  );
  assert.doesNotThrow(() =>
    assertApplyWorkflowState(true, "", "abc123", "abc123")
  );
  assert.throws(
    () => assertApplyWorkflowState(true, " M src/file.ts", "abc123", "abc123"),
    /clean worktree/,
  );
  assert.throws(
    () => assertApplyWorkflowState(true, "", "abc123", "def456"),
    /origin\/main/,
  );
});
