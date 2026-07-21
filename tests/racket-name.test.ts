import test from "node:test";
import assert from "node:assert/strict";

import { formatRacketName } from "../src/lib/racket-name";

test("does not append a release year already present in a model name", () => {
  assert.equal(formatRacketName("Pure Aero 98 2026", 2026), "Pure Aero 98 2026");
});

test("appends a release year when the model name does not contain it", () => {
  assert.equal(formatRacketName("Pure Aero 98", 2026), "Pure Aero 98 (2026)");
});

test("leaves names without a release year unchanged", () => {
  assert.equal(formatRacketName("Pure Aero 98", null), "Pure Aero 98");
});
