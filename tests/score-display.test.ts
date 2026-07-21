import assert from "node:assert/strict";
import test from "node:test";

import {
  clampPublicScore,
  formatPublicScore,
  publicScoreToPercent,
} from "../src/lib/score-display";

test("public scores are clamped to the documented -5 to +5 range", () => {
  assert.equal(clampPublicScore(-8), -5);
  assert.equal(clampPublicScore(7), 5);
  assert.equal(clampPublicScore(2.4), 2.4);
});

test("public score labels never render signed or negative zero", () => {
  assert.equal(formatPublicScore(-0.4), "0");
  assert.equal(formatPublicScore(0), "0");
  assert.equal(formatPublicScore(2.6), "+3");
  assert.equal(formatPublicScore(-2.6), "-3");
  assert.equal(formatPublicScore(-2.5), "-3");
});

test("bar percentages stay inside the visible track", () => {
  assert.equal(publicScoreToPercent(-8), 0);
  assert.equal(publicScoreToPercent(0), 50);
  assert.equal(publicScoreToPercent(7), 100);
});
