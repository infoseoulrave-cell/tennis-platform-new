import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("the live recommendation engine uses v2 spec calculations instead of v1 rows", async () => {
  const source = await readFile(
    new URL("../src/modules/recommendation/engine.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /SCORING_VERSION\s*=\s*["']v1["']/);
  assert.match(source, /computeAxisScores/);
  assert.match(source, /computedScoresByRacket/);
});
