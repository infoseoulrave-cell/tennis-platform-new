import assert from "node:assert/strict";
import test from "node:test";

import { generateSlug, rowToScores, scoresFromSpec } from "../src/lib/queries";

const VERIFIED_SNAPSHOT = { completeness: 1, confidence: 1 };

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

test("complete score sets are converted and clamped to the public range", () => {
  assert.deepEqual(
    rowToScores([
      { score: 120, axis_key: "power", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 60, axis_key: "control", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 50, axis_key: "spin", input_snapshot: VERIFIED_SNAPSHOT },
      { score: 40, axis_key: "comfort", input_snapshot: VERIFIED_SNAPSHOT },
      { score: -20, axis_key: "stability", input_snapshot: VERIFIED_SNAPSHOT },
    ]),
    { power: 5, control: 1, spin: 0, comfort: -1, stability: -5 },
  );
});

test("persisted scores without reliable v2 snapshots are hidden", () => {
  const rows = ["power", "control", "spin", "comfort", "stability"].map((axis_key) => ({
    axis_key,
    score: 50,
    input_snapshot: axis_key === "spin"
      ? { completeness: 4 / 7, confidence: 0.59 }
      : VERIFIED_SNAPSHOT,
  }));

  assert.equal(rowToScores(rows), null);
  assert.equal(rowToScores(rows.map(({ input_snapshot: _, ...row }) => row)), null);
});

test("missing persisted v2 rows fall back to a fresh v2 calculation from complete specs", () => {
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
  assert.equal(scores.power >= -5 && scores.power <= 5, true);
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
