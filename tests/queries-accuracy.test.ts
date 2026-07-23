import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  generateSlug,
  rawScoresFromSpec,
  resolveRacketRawScores,
  rowToRawScores,
  rowToScores,
  scoresFromSpec,
  unwrapSupabaseData,
} from "../src/lib/queries";
import {
  PUBLIC_AXIS_KEYS,
  rawScoresToPublicAxisScores,
  sumPublicAxisScores,
} from "../src/lib/score-display";

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

test("complete persisted rows preserve raw scores and derive bounded public axes", () => {
  const rows = [
    { score: 100, axis_key: "power", input_snapshot: VERIFIED_SNAPSHOT },
    { score: 60, axis_key: "control", input_snapshot: VERIFIED_SNAPSHOT },
    { score: 50, axis_key: "spin", input_snapshot: VERIFIED_SNAPSHOT },
    { score: 40, axis_key: "comfort", input_snapshot: VERIFIED_SNAPSHOT },
    { score: 0, axis_key: "stability", input_snapshot: VERIFIED_SNAPSHOT },
  ];

  assert.deepEqual(rowToRawScores(rows), {
    power: 100,
    control: 60,
    spin: 50,
    comfort: 40,
    stability: 0,
  });
  assert.deepEqual(rowToScores(rows), {
    power: 5,
    control: 3,
    spin: 3,
    comfort: 2,
    stability: 0,
  });
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

test("missing persisted v3 rows retain raw v3 fallback scores and derive integer axes", () => {
  const spec = {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 320,
    stiffnessRa: 65,
    beamWidthMm: "23/26/23",
    stringPattern: "16x19",
  };
  const rawScores = rawScoresFromSpec(spec);
  const scores = scoresFromSpec(spec);

  assert.ok(rawScores);
  assert.ok(scores);
  assert.deepEqual(Object.keys(rawScores), [...PUBLIC_AXIS_KEYS]);
  assert.deepEqual(Object.keys(scores), [...PUBLIC_AXIS_KEYS]);
  assert.equal(
    Object.values(rawScores).every((score) => score >= 0 && score <= 100),
    true,
  );
  assert.equal(
    Object.values(scores).every((score) =>
      Number.isInteger(score) && score >= 0 && score <= 5
    ),
    true,
  );
  assert.equal(
    sumPublicAxisScores(scores),
    Math.round(
      10 + Object.values(rawScores).reduce((sum, score) => sum + score, 0) / 100,
    ),
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

test("exact Speed 2026 evidence identities resolve raw v3 scores and 13/15 public totals", () => {
  const incompleteDatabaseSpec = {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: null,
    stiffnessRa: null,
    beamWidthMm: "23",
    stringPattern: "16x19",
  };
  const cases = [
    {
      model: "Speed Pro 2026",
      raw: { power: 59, control: 72, spin: 19, comfort: 62, stability: 70 },
    },
    {
      model: "Speed MP 2026",
      raw: { power: 59, control: 51, spin: 53, comfort: 63, stability: 66 },
    },
    {
      model: "Speed MP L 2026",
      raw: { power: 50, control: 50, spin: 57, comfort: 54, stability: 49 },
    },
  ] as const;

  for (const { model, raw } of cases) {
    const resolved = resolveRacketRawScores({
      persistedRawScores: null,
      databaseSpec: incompleteDatabaseSpec,
      identity: { brand: "Head", model, year: 2026 },
    });

    assert.deepEqual(resolved, raw);
    assert.equal(
      sumPublicAxisScores(rawScoresToPublicAxisScores(resolved)),
      13,
    );
  }
});

test("raw score resolution preserves persisted then reliable database precedence", () => {
  const persisted = {
    power: 1,
    control: 2,
    spin: 3,
    comfort: 4,
    stability: 5,
  };
  const databaseSpec = {
    headSizeSqIn: 98,
    weightG: 315,
    balanceMm: 310,
    swingWeightKgCm2: 340,
    stiffnessRa: 70,
    beamWidthMm: "20",
    stringPattern: "18x20",
  };
  const databaseRaw = rawScoresFromSpec(databaseSpec);
  assert.ok(databaseRaw);

  assert.deepEqual(resolveRacketRawScores({
    persistedRawScores: persisted,
    databaseSpec,
    identity: {
      brand: "Head",
      model: "Speed Pro 2026",
      year: 2026,
    },
  }), persisted);
  assert.deepEqual(resolveRacketRawScores({
    persistedRawScores: null,
    databaseSpec,
    identity: {
      brand: "Head",
      model: "Speed Pro 2026",
      year: 2026,
    },
  }), databaseRaw);
});

test("incomplete database specs outside an exact evidence identity fail closed", () => {
  const incompleteDatabaseSpec = {
    headSizeSqIn: 100,
    weightG: null,
    balanceMm: null,
    swingWeightKgCm2: null,
    stiffnessRa: null,
    beamWidthMm: null,
    stringPattern: null,
  };

  assert.equal(resolveRacketRawScores({
    persistedRawScores: null,
    databaseSpec: incompleteDatabaseSpec,
    identity: {
      brand: "Head",
      model: "Speed Pro",
      year: 2026,
    },
  }), null);
  assert.equal(resolveRacketRawScores({
    persistedRawScores: null,
    databaseSpec: incompleteDatabaseSpec,
    identity: {
      brand: "Head",
      model: "Speed Pro 2026",
      year: 2025,
    },
  }), null);
});
