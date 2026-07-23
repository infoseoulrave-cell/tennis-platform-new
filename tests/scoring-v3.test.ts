import assert from "node:assert/strict";
import test from "node:test";

import {
  AXIS_DEFINITIONS,
  computeAxisScores,
  hasReliableAxisScores,
  isReliableScoreSnapshot,
  SCORING_VERSION,
  type RacketSpecInput,
} from "../src/modules/recommendation/scoring-core";

const COMPLETE_SPEC: RacketSpecInput = {
  headSizeSqIn: 100,
  weightG: 300,
  balanceMm: 320,
  swingWeightKgCm2: 320,
  stiffnessRa: 65,
  beamWidthMm: "23/26/23",
  stringPattern: "16x19",
};

function axis(spec: RacketSpecInput, axisKey: string) {
  const score = computeAxisScores(spec).find((candidate) => candidate.axisKey === axisKey);
  assert.ok(score);
  return score;
}

test("v3 exposes five raw 0..100 axis definitions and labels control as a proxy", () => {
  assert.equal(SCORING_VERSION, "v3");
  assert.deepEqual(
    AXIS_DEFINITIONS.map(({ axisKey }) => axisKey),
    ["power", "control", "spin", "comfort", "stability"],
  );
  assert.match(
    AXIS_DEFINITIONS.find(({ axisKey }) => axisKey === "control")?.description ?? "",
    /proxy/i,
  );

  const scores = computeAxisScores(COMPLETE_SPEC);
  assert.equal(scores.length, 5);
  assert.ok(scores.every(({ score }) => Number.isInteger(score)));
  assert.ok(scores.every(({ score }) => score >= 0 && score <= 100));
});

test("power is swingweight-centered and stability uses only swingweight plus weight", () => {
  const lowerSwingWeight = axis(
    { ...COMPLETE_SPEC, swingWeightKgCm2: 300 },
    "power",
  ).score;
  const higherSwingWeight = axis(
    { ...COMPLETE_SPEC, swingWeightKgCm2: 340 },
    "power",
  ).score;
  assert.ok(higherSwingWeight > lowerSwingWeight);

  const stability = axis(COMPLETE_SPEC, "stability");
  assert.deepEqual(stability.inputSnapshot.usedInputs, ["swingWeight", "weight"]);
  assert.equal(
    axis({ ...COMPLETE_SPEC, beamWidthMm: "18" }, "stability").score,
    axis({ ...COMPLETE_SPEC, beamWidthMm: "30" }, "stability").score,
  );
});

test("spin combines pattern and head size with inverse swingweight for same effort", () => {
  const normal = axis(COMPLETE_SPEC, "spin");
  assert.deepEqual(normal.inputSnapshot.usedInputs, [
    "stringDensity",
    "headSize",
    "swingWeight",
  ]);
  assert.ok(
    axis({ ...COMPLETE_SPEC, swingWeightKgCm2: 300 }, "spin").score
      > axis({ ...COMPLETE_SPEC, swingWeightKgCm2: 340 }, "spin").score,
  );
  assert.ok(
    axis({ ...COMPLETE_SPEC, stringPattern: "16x19" }, "spin").score
      > axis({ ...COMPLETE_SPEC, stringPattern: "18x20" }, "spin").score,
  );
});

test("comfort combines inverse RA with swingweight and static weight", () => {
  const comfort = axis(COMPLETE_SPEC, "comfort");
  assert.deepEqual(comfort.inputSnapshot.usedInputs, [
    "stiffness",
    "swingWeight",
    "weight",
  ]);
  assert.ok(
    axis({ ...COMPLETE_SPEC, stiffnessRa: 55 }, "comfort").score
      > axis({ ...COMPLETE_SPEC, stiffnessRa: 72 }, "comfort").score,
  );
});

test("v3 scoring and the shared fail-closed reliability gate are deterministic", () => {
  assert.deepEqual(computeAxisScores(COMPLETE_SPEC), computeAxisScores(COMPLETE_SPEC));
  const scores = computeAxisScores(COMPLETE_SPEC);
  assert.equal(hasReliableAxisScores(scores), true);
  assert.equal(isReliableScoreSnapshot(scores[0].inputSnapshot), true);
  assert.equal(
    isReliableScoreSnapshot({
      scoringVersion: "v3",
      completeness: 5 / 7,
      confidence: 0.60,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      scoringVersion: "v3",
      completeness: 4 / 7,
      confidence: 1,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      scoringVersion: "v3",
      completeness: 1,
      confidence: 0.59,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      scoringVersion: "v2",
      completeness: 1,
      confidence: 1,
    }),
    false,
  );
  assert.equal(
    hasReliableAxisScores(
      scores.map((score, index) => index === 0
        ? {
            ...score,
            inputSnapshot: { ...score.inputSnapshot, confidence: 0.59 },
          }
        : score),
    ),
    false,
  );
});

test("persisted v3 snapshots require internally consistent normalized input structure", () => {
  const valid = axis(COMPLETE_SPEC, "power").inputSnapshot;
  assert.equal(isReliableScoreSnapshot(valid), true);
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      normalizedInputs: { ...valid.normalizedInputs, unknownInput: 50 },
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      normalizedInputs: { ...valid.normalizedInputs, headSize: Number.NaN },
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      normalizedInputs: { ...valid.normalizedInputs, headSize: 101 },
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      usedInputs: [...valid.usedInputs, valid.usedInputs[0]],
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      usedInputs: [],
      confidence: 0.60,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      usedInputs: ["unknownInput"],
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      normalizedInputs: {
        weight: 50,
        balance: 50,
        swingWeight: 50,
        stiffness: 50,
        beamWidth: 50,
      },
      usedInputs: ["headSize"],
      completeness: 5 / 7,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      completeness: 6 / 7,
    }),
    false,
  );
  assert.equal(
    isReliableScoreSnapshot({
      ...valid,
      confidence: Number.POSITIVE_INFINITY,
    }),
    false,
  );
});
