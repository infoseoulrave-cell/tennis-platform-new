import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  generateSlug,
  rowToScores,
  scoresFromSpec,
  unwrapSupabaseData,
} from "../src/lib/queries";

const VERIFIED_SNAPSHOT = {
  scoringVersion: "v3",
  normalizedInputs: {
    headSize: 50,
    weight: 50,
    balance: 50,
    swingWeight: 50,
    stiffness: 50,
    beamWidth: 50,
    stringDensity: 50,
  },
  usedInputs: ["headSize", "swingWeight", "stiffness"],
  completeness: 1,
  confidence: 1,
};

test("Supabase failures are not disguised as empty catalog data", () => {
  const failure = new Error("database unavailable");

  assert.throws(() => unwrapSupabaseData(null, failure, []), failure);
  assert.deepEqual(unwrapSupabaseData(null, null, []), []);
  assert.deepEqual(unwrapSupabaseData(["racket"], null, []), ["racket"]);
});

test("slug generation does not repeat a release year already in the model", () => {
  assert.equal(
    generateSlug("Yonex", "Percept 97 2025", 2025),
    "yonex-percept-97-2025",
  );
  assert.equal(
    generateSlug("Yonex", "Percept 97", 2025),
    "yonex-percept-97-2025",
  );
});

test("an incomplete axis set is not presented as a complete five-axis score", () => {
  assert.equal(
    rowToScores([
      { score: 80, axis_key: "power", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 60, axis_key: "control", input_snapshot: VERIFIED_SNAPSHOT },
    ]),
    null,
  );
});

test("complete in-range score sets are converted to the public range", () => {
  assert.deepEqual(
    rowToScores([
      { score: 100, axis_key: "power", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 60, axis_key: "control", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 50, axis_key: "spin", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 40, axis_key: "comfort", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 0, axis_key: "stability", input_snapshot: VERIFIED_SNAPSHOT },
    ]),
    { power: 15, control: 13, spin: 12.5, comfort: 12, stability: 10 },
  );
});

test("persisted raw scores outside 0-100 fail closed instead of being clamped", () => {
  const rows = ["power", "control", "spin", "comfort", "stability"].map(
    (axis_key) => ({
      score: 50,
      axis_key,
      input_snapshot: VERIFIED_SNAPSHOT,
    }),
  );

  assert.equal(rowToScores(rows.map((row) =>
    row.axis_key === "power" ? { ...row, score: 120 } : row
  )), null);
  assert.equal(rowToScores(rows.map((row) =>
    row.axis_key === "stability" ? { ...row, score: -20 } : row
  )), null);
});

test("persisted score reads require the joined axis definition to be v3", () => {
  const queries = readFileSync(
    new URL("../src/lib/queries.ts", import.meta.url),
    "utf8",
  );

  assert.match(queries, /axis_definitions!inner\(axis_key\)/);
  assert.match(
    queries,
    /\.eq\("axis_definitions\.version", SCORING_VERSION\)/,
  );
});

test("public scores require exactly one row for each official v3 axis", () => {
  const row = (axis_key: string) => ({
    score: 50,
    axis_key,
    input_snapshot: VERIFIED_SNAPSHOT,
  });

  assert.equal(rowToScores([
    row("power"),
    row("power"),
    row("spin"),
    row("comfort"),
    row("stability"),
  ]), null);
  assert.equal(rowToScores([
    row("power"),
    row("unknown"),
    row("spin"),
    row("comfort"),
    row("stability"),
  ]), null);
  assert.equal(rowToScores([
    row("power"),
    row("control"),
    row("spin"),
    row("comfort"),
    row("stability"),
    row("control"),
  ]), null);
  assert.equal(rowToScores([
    row("penetration"),
    row("control"),
    row("spin"),
    row("comfort"),
    row("stability"),
  ]), null);
});

test("persisted scores without reliable v3 snapshots are hidden", () => {
  const rows = ["power", "control", "spin", "comfort", "stability"].map((axis_key) => ({
    axis_key,
    score: 50,
    input_snapshot: axis_key === "spin"
      ? { scoringVersion: "v3", completeness: 4 / 7, confidence: 0.59 }
      : VERIFIED_SNAPSHOT,
  }));

  assert.equal(rowToScores(rows), null);
  assert.equal(rowToScores(rows.map(({ axis_key, score }) => ({
    axis_key,
    score,
  }))), null);
});

test("missing persisted v3 rows fall back to a fresh v3 calculation from complete specs", () => {
  const scores = scoresFromSpec({
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 320,
    stiffnessRa: 65,
    beamWidthMm: "23/26/23",
    stringPattern: "16x19",
  });

  assert.ok(scores);
  assert.deepEqual(Object.keys(scores).sort(), ["comfort", "control", "power", "spin", "stability"]);
  assert.equal(
    Object.values(scores).every((score) => score >= 10 && score <= 15),
    true,
  );
});

test("read-time fallback remains hidden when specs cannot support all five axes", () => {
  assert.equal(scoresFromSpec({
    headSizeSqIn: 100,
    weightG: null,
    balanceMm: null,
    swingWeightKgCm2: null,
    stiffnessRa: null,
    beamWidthMm: null,
    stringPattern: null,
  }), null);
});

test("read-time fallback requires at least five verified inputs and 0.60 confidence per axis", () => {
  assert.equal(scoresFromSpec({
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: null,
    swingWeightKgCm2: 320,
    stiffnessRa: 65,
    beamWidthMm: null,
    stringPattern: "16x19",
  }) !== null, true);

  assert.equal(scoresFromSpec({
    headSizeSqIn: 100,
    weightG: null,
    balanceMm: null,
    swingWeightKgCm2: 320,
    stiffnessRa: 65,
    beamWidthMm: null,
    stringPattern: "16x19",
  }), null);
});
