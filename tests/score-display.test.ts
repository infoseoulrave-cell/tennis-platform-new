import assert from "node:assert/strict";
import test from "node:test";

import {
  clampPublicScore,
  formatPublicScore,
  publicScoreToFraction,
  publicScoreToPercent,
  rawScoreToPublicScore,
} from "../src/lib/score-display";

test("raw 0-100 scores convert to the fixed public 10-15 range", () => {
  assert.equal(rawScoreToPublicScore(0), 10);
  assert.equal(rawScoreToPublicScore(50), 12.5);
  assert.equal(rawScoreToPublicScore(100), 15);
  assert.equal(rawScoreToPublicScore(67), 13.4);
});

test("raw and public scores clamp safely, including non-finite values", () => {
  assert.equal(rawScoreToPublicScore(-20), 10);
  assert.equal(rawScoreToPublicScore(120), 15);
  assert.equal(rawScoreToPublicScore(Number.NaN), 10);
  assert.equal(rawScoreToPublicScore(Number.NEGATIVE_INFINITY), 10);
  assert.equal(rawScoreToPublicScore(Number.POSITIVE_INFINITY), 15);
  assert.equal(clampPublicScore(8), 10);
  assert.equal(clampPublicScore(16), 15);
  assert.equal(clampPublicScore(12.4), 12.4);
});

test("public score labels use one decimal, /15, and no signed notation", () => {
  assert.equal(formatPublicScore(10), "10.0/15");
  assert.equal(formatPublicScore(12.54), "12.5/15");
  assert.equal(formatPublicScore(15), "15.0/15");
  assert.doesNotMatch(formatPublicScore(14), /[+-]/);
});

test("radar fractions and bar percentages use 10 as the center and 15 as the edge", () => {
  assert.equal(publicScoreToFraction(8), 0);
  assert.equal(publicScoreToFraction(12.5), 0.5);
  assert.equal(publicScoreToFraction(16), 1);
  assert.equal(publicScoreToPercent(8), 0);
  assert.equal(publicScoreToPercent(12.5), 50);
  assert.equal(publicScoreToPercent(16), 100);
});
