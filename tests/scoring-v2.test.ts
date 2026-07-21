import assert from "node:assert/strict";
import test from "node:test";

import {
  computeAxisScores,
  SCORING_VERSION,
  type RacketSpecInput,
} from "../src/modules/recommendation/scoring-core";

const EMPTY_SPEC: RacketSpecInput = {
  headSizeSqIn: null,
  weightG: null,
  balanceMm: null,
  swingWeightKgCm2: null,
  stiffnessRa: null,
  beamWidthMm: null,
  stringPattern: null,
};

test("v2 does not invent average scores when every source field is missing", () => {
  assert.equal(SCORING_VERSION, "v2");
  assert.deepEqual(computeAxisScores(EMPTY_SPEC), []);
});

test("v2 re-normalizes each formula over only the inputs actually present", () => {
  const scores = computeAxisScores({ ...EMPTY_SPEC, headSizeSqIn: 115 });
  const power = scores.find((score) => score.axisKey === "power");

  assert.ok(power);
  assert.equal(power.score, 100);
  assert.equal(power.inputSnapshot.completeness, 1 / 7);
  assert.equal(power.inputSnapshot.confidence, 0.2);
  assert.deepEqual(power.inputSnapshot.usedInputs, ["headSize"]);
});

test("spin ignores balance and comfort ignores beam width in v2", () => {
  const scores = computeAxisScores({
    ...EMPTY_SPEC,
    balanceMm: 350,
    beamWidthMm: "30",
  });

  assert.equal(scores.some((score) => score.axisKey === "spin"), false);
  assert.equal(scores.some((score) => score.axisKey === "comfort"), false);
});

test("a complete verified spec records full completeness and confidence", () => {
  const scores = computeAxisScores({
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 320,
    stiffnessRa: 65,
    beamWidthMm: "23/26/23",
    stringPattern: "16x19",
  });

  assert.equal(scores.length, 5);
  for (const score of scores) {
    assert.equal(score.inputSnapshot.scoringVersion, "v2");
    assert.equal(score.inputSnapshot.completeness, 1);
    assert.equal(score.inputSnapshot.confidence, 1);
  }
});
