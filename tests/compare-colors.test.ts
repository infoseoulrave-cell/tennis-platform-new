import assert from "node:assert/strict";
import test from "node:test";
import { colorForRacket } from "../src/lib/compare-colors";

test("a filtered comparison series keeps the color assigned in the header", () => {
  const ids = ["first", "missing-scores", "third"];
  assert.equal(colorForRacket("third", ids), "#10b981");
});

