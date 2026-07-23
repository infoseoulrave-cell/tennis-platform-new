import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  collectVerifiedEvidenceRoles,
  computeRecommendationConfidence,
} from "../src/modules/recommendation/engine";

test("the live recommendation engine uses v3 spec calculations and the shared reliability gate", async () => {
  const source = await readFile(
    new URL("../src/modules/recommendation/engine.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /SCORING_VERSION\s*=\s*["']v1["']/);
  assert.match(source, /computeAxisScores/);
  assert.match(source, /computedScoresByRacket/);
  assert.match(source, /hasReliableAxisScores\(scores\)/);
  assert.match(source, /eq\(racketModels\.discontinued,\s*false\)/);
  assert.match(source, /eq\(racketVariants\.regionCode,\s*"KR"\)/);
  assert.match(source, /eq\(racketVariants\.availableInKorea,\s*true\)/);
  assert.match(source, /eq\(specSources\.verifiedByAdmin,\s*true\)/);
  assert.match(source, /rawValues:\s*specSources\.rawValues/);
  assert.match(source, /\bexists\(/);
});

test("recommendation confidence requires two distinct verified evidence roles", () => {
  const rolesByRacket = collectVerifiedEvidenceRoles([
    {
      racketModelId: "racket-a",
      verifiedByAdmin: true,
      rawValues: { source_role: "manufacturer_static" },
    },
    {
      racketModelId: "racket-a",
      verifiedByAdmin: true,
      rawValues: { source_role: "manufacturer_static" },
    },
    {
      racketModelId: "racket-a",
      verifiedByAdmin: false,
      rawValues: { source_role: "tennis_warehouse_measured" },
    },
    {
      racketModelId: "racket-a",
      verifiedByAdmin: true,
      rawValues: { measurement_basis: "strung" },
    },
    {
      racketModelId: "racket-b",
      verifiedByAdmin: true,
      rawValues: { measurement_basis: "unstrung" },
    },
  ]);

  assert.deepEqual(
    [...(rolesByRacket.get("racket-a") ?? [])].sort(),
    ["manufacturer_static", "tennis_warehouse_measured"],
  );
  assert.deepEqual(
    [...(rolesByRacket.get("racket-b") ?? [])],
    ["manufacturer_static"],
  );
  assert.equal(
    computeRecommendationConfidence(6, rolesByRacket.get("racket-a")).level,
    "high",
  );
  assert.equal(
    computeRecommendationConfidence(6, rolesByRacket.get("racket-b")).level,
    "medium",
  );
  assert.equal(computeRecommendationConfidence(6, new Set()).level, "low");
});
