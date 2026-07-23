import assert from "node:assert/strict";
import test from "node:test";

import {
  PUBLIC_AXIS_KEYS,
  formatPublicAxisScore,
  formatPublicTotal,
  publicAxisScoreToFraction,
  publicAxisScoreToPercent,
  rawScoresToPublicAxisScores,
  sumPublicAxisScores,
  type RawAxisScores100,
} from "../src/lib/score-display";

function rawScores(values: readonly number[]): RawAxisScores100 {
  return Object.fromEntries(
    PUBLIC_AXIS_KEYS.map((axis, index) => [axis, values[index]]),
  ) as RawAxisScores100;
}

test("canonical public axes are fixed in deterministic tie-break order", () => {
  assert.deepEqual(
    PUBLIC_AXIS_KEYS,
    ["power", "control", "spin", "comfort", "stability"],
  );
});

test("raw v3 scores project to five bounded integers whose sum is the 10..15 total", () => {
  const projected = rawScoresToPublicAxisScores(
    rawScores([100, 60, 50, 40, 0]),
  );

  assert.deepEqual(projected, {
    power: 5,
    control: 3,
    spin: 3,
    comfort: 2,
    stability: 0,
  });
  assert.deepEqual(Object.keys(projected), [...PUBLIC_AXIS_KEYS]);
  assert.equal("total" in projected, false);
  assert.equal(sumPublicAxisScores(projected), 13);
});

test("largest-remainder ties use raw score descending then canonical axis order", () => {
  assert.deepEqual(
    rawScoresToPublicAxisScores(rawScores([10, 90, 30, 70, 50])),
    {
      power: 0,
      control: 5,
      spin: 1,
      comfort: 4,
      stability: 3,
    },
  );
  assert.deepEqual(
    rawScoresToPublicAxisScores(rawScores([50, 50, 50, 50, 50])),
    {
      power: 3,
      control: 3,
      spin: 3,
      comfort: 2,
      stability: 2,
    },
  );
});

test("projection invariants hold deterministically across the bounded raw grid", () => {
  const grid = [0, 20, 40, 60, 80, 100];
  for (const power of grid) {
    for (const control of grid) {
      for (const spin of grid) {
        for (const comfort of grid) {
          for (const stability of grid) {
            const raw = { power, control, spin, comfort, stability };
            const projected = rawScoresToPublicAxisScores(raw);
            const expectedTotal = Math.round(
              10 + Object.values(raw).reduce((sum, value) => sum + value, 0) / 100,
            );

            assert.deepEqual(rawScoresToPublicAxisScores(raw), projected);
            assert.equal(sumPublicAxisScores(projected), expectedTotal);
            assert.ok(
              PUBLIC_AXIS_KEYS.every((axis) =>
                Number.isInteger(projected[axis])
                && projected[axis] >= 0
                && projected[axis] <= 5
              ),
            );
          }
        }
      }
    }
  }
});

test("axis and total labels are integer-only and use their own scales", () => {
  const scores = rawScoresToPublicAxisScores(rawScores([50, 50, 50, 50, 50]));

  assert.equal(formatPublicAxisScore(scores.power), "3/5");
  assert.equal(formatPublicTotal(scores), "13/15");
  assert.doesNotMatch(formatPublicAxisScore(scores.power), /\./);
  assert.doesNotMatch(formatPublicTotal(scores), /\./);
});

test("axis fractions and percentages use zero as center and five as edge", () => {
  assert.equal(publicAxisScoreToFraction(-1), 0);
  assert.equal(publicAxisScoreToFraction(2), 0.4);
  assert.equal(publicAxisScoreToFraction(6), 1);
  assert.equal(publicAxisScoreToPercent(-1), 0);
  assert.equal(publicAxisScoreToPercent(2), 40);
  assert.equal(publicAxisScoreToPercent(6), 100);
});
