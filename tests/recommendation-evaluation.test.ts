import test from "node:test";
import assert from "node:assert/strict";

import { runEvaluation } from "../src/modules/recommendation/evaluation-harness";

test("curated player profiles produce plausible top-three recommendations", () => {
  const results = runEvaluation();
  assert.deepEqual(
    results.filter((result) => !result.passed).map((result) => result.scenario),
    [],
  );
});
