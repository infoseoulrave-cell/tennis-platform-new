/**
 * Evaluation Harness v1
 *
 * Curated player scenarios with known-fit expectations.
 * Run this offline to verify that the scoring engine produces
 * reasonable results before deploying scoring changes.
 *
 * Usage: npx tsx src/modules/recommendation/evaluation-harness.ts
 */

import {
  computeAxisScores,
  type RacketSpecInput,
} from "./scoring";
import {
  generateExplanationFragments,
  computeConfidence,
  type DiagnosisAnswers,
} from "./explanation-templates";
import { calculatePlayerWeights, suitabilityAdjustment } from "./ranking";

// ---------------------------------------------------------------------------
// Test rackets — representative models from the seed catalog
// ---------------------------------------------------------------------------

const RACKETS: Record<string, RacketSpecInput> = {
  // Pro Staff RF97 — heavy, small head, flexible, dense strings. The control king.
  proStaffRF97: {
    headSizeSqIn: 97,
    weightG: 340,
    balanceMm: 310,
    swingWeightKgCm2: 338,
    stiffnessRa: 62,
    beamWidthMm: "21/21/21",
    stringPattern: "16x19",
  },
  // Pure Drive — the all-rounder. Stiff, medium weight, large head.
  pureDrive: {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 320,
    stiffnessRa: 72,
    beamWidthMm: "23/26/22",
    stringPattern: "16x19",
  },
  // EZONE 100 — comfort-oriented, medium-stiff, spin-friendly.
  ezone100: {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 315,
    stiffnessRa: 65,
    beamWidthMm: "23/25/22",
    stringPattern: "16x19",
  },
  // Pure Aero — spin monster. Open string pattern, stiff, aerodynamic.
  pureAero: {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 318,
    stiffnessRa: 67,
    beamWidthMm: "21/23/21",
    stringPattern: "16x19",
  },
  // Clash 100 — maximum comfort, very flexible.
  clash100: {
    headSizeSqIn: 100,
    weightG: 295,
    balanceMm: 320,
    swingWeightKgCm2: 312,
    stiffnessRa: 55,
    beamWidthMm: "24/27/22",
    stringPattern: "16x19",
  },
  // HEAD Prestige Tour — control-oriented, thin beam, flexible.
  prestigeTour: {
    headSizeSqIn: 95,
    weightG: 305,
    balanceMm: 315,
    swingWeightKgCm2: 318,
    stiffnessRa: 58,
    beamWidthMm: "20/22/20",
    stringPattern: "18x20",
  },
  // HEAD Instinct MP — lightweight beginner, large head, very stiff.
  instinctMP: {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 314,
    stiffnessRa: 68,
    beamWidthMm: "25/28/22",
    stringPattern: "16x19",
  },
  // Prince Textreme Tour 100 — beginner/intermediate, light, big head.
  textremeTour100: {
    headSizeSqIn: 100,
    weightG: 290,
    balanceMm: 325,
    swingWeightKgCm2: 305,
    stiffnessRa: 62,
    beamWidthMm: "24/26/22",
    stringPattern: "16x18",
  },
  // Wilson Ultra 100 v4 — stiff, thick beam, power-oriented beginner.
  ultra100v4: {
    headSizeSqIn: 100,
    weightG: 300,
    balanceMm: 320,
    swingWeightKgCm2: 316,
    stiffnessRa: 70,
    beamWidthMm: "25/28/22",
    stringPattern: "16x19",
  },
  // Lightweight oversize — extreme beginner frame.
  lightOversize: {
    headSizeSqIn: 115,
    weightG: 255,
    balanceMm: 345,
    swingWeightKgCm2: 280,
    stiffnessRa: 70,
    beamWidthMm: "28/30/26",
    stringPattern: "16x18",
  },
};

// ---------------------------------------------------------------------------
// Player scenarios
// ---------------------------------------------------------------------------

interface Scenario {
  name: string;
  description: string;
  answers: DiagnosisAnswers;
  expectations: {
    topAxisKey: string; // which axis should score highest on the best-fit racket
    racketRanking: string[]; // expected rough ordering (at least top 1-2)
    explanationMustInclude?: string; // substring in a positive fragment
    tradeoffAxis?: string; // if current racket known, expect a tradeoff on this axis
  };
}

const SCENARIOS: Scenario[] = [
  {
    name: "Advanced control seeker with elbow pain",
    description:
      "5+ year player, plays 2-3x/week, moderate swing, prefers control > comfort, has elbow pain. Currently uses Pure Drive.",
    answers: {
      current_racket: { racketModelId: "pureDrive", selection: "search" },
      play_profile: { experience: "5_plus_years", frequency: "2_3_weekly" },
      swing_style: { swingSpeed: 0.65, playStyle: "balanced" },
      pain_points: ["elbow_pain"],
      priority_tradeoffs: { first: "control", second: "comfort" },
      confirmation: true,
    },
    expectations: {
      topAxisKey: "control",
      racketRanking: ["proStaffRF97", "prestigeTour"],
      explanationMustInclude: "컨트롤",
    },
  },
  {
    name: "Beginner seeking power and spin",
    description:
      "First racket purchase, plays once a week, slow swing, wants power and spin.",
    answers: {
      current_racket: { selection: "first_purchase" },
      play_profile: { experience: "less_1_year", frequency: "once_weekly" },
      swing_style: { swingSpeed: 0.3, playStyle: "baseline" },
      pain_points: [],
      priority_tradeoffs: { first: "power", second: "spin" },
      confirmation: true,
    },
    expectations: {
      topAxisKey: "power",
      racketRanking: ["lightOversize", "ultra100v4"],
    },
  },
  {
    name: "Intermediate comfort-first player with wrist pain",
    description:
      "3 years experience, 4-5x/week, moderate-fast swing, comfort > stability priority, wrist pain.",
    answers: {
      current_racket: { racketModelId: "pureAero", selection: "search" },
      play_profile: { experience: "3_5_years", frequency: "4_5_weekly" },
      swing_style: { swingSpeed: 0.7, playStyle: "aggressive_baseline" },
      pain_points: ["wrist_pain"],
      priority_tradeoffs: { first: "comfort", second: "stability" },
      confirmation: true,
    },
    expectations: {
      topAxisKey: "comfort",
      racketRanking: ["clash100"],
    },
  },
  {
    name: "Spin-focused intermediate",
    description:
      "2 years experience, plays 2-3x/week, fast swing, wants spin > control.",
    answers: {
      current_racket: { selection: "unknown" },
      play_profile: { experience: "1_3_years", frequency: "2_3_weekly" },
      swing_style: { swingSpeed: 0.8, playStyle: "aggressive_baseline" },
      pain_points: [],
      priority_tradeoffs: { first: "spin", second: "control" },
      confirmation: true,
    },
    expectations: {
      topAxisKey: "spin",
      racketRanking: ["textremeTour100", "pureAero"],
    },
  },
  {
    name: "Pro-level stability seeker",
    description:
      "10+ years, daily player, very fast swing, wants stability > control. Uses Blade 98.",
    answers: {
      current_racket: { racketModelId: "ezone100", selection: "search" },
      play_profile: { experience: "10_plus_years", frequency: "daily" },
      swing_style: { swingSpeed: 0.9, playStyle: "all_court" },
      pain_points: [],
      priority_tradeoffs: { first: "stability", second: "control" },
      confirmation: true,
    },
    expectations: {
      topAxisKey: "stability",
      racketRanking: ["proStaffRF97"],
    },
  },
];

// ---------------------------------------------------------------------------
// Scoring + ranking logic (mirrors engine.ts weighted-sum approach)
// ---------------------------------------------------------------------------

function scoreRackets(
  racketScores: Map<string, Record<string, number>>,
  answers: DiagnosisAnswers
): { name: string; totalScore: number; axisScores: Record<string, number> }[] {
  const axisKeys = ["power", "control", "comfort", "spin", "stability"];
  const weights = calculatePlayerWeights(
    axisKeys.map((axisKey) => ({ axisKey, weightDefault: 0.2 })),
    answers,
  );

  const scored = Array.from(racketScores.entries()).map(([name, axes]) => {
    let totalScore = 0;
    for (const [axisKey, weight] of weights.entries()) {
      totalScore += weight * (axes[axisKey] ?? 0);
    }
    totalScore += suitabilityAdjustment(RACKETS[name], answers);
    totalScore = Math.max(0, Math.min(100, totalScore));
    return { name, totalScore, axisScores: axes };
  });

  scored.sort((a, b) => b.totalScore - a.totalScore);
  return scored;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string[];
}

function runScenario(scenario: Scenario): TestResult {
  const details: string[] = [];
  let passed = true;

  // 1. Compute axis scores for all test rackets
  const allScores = new Map<string, Record<string, number>>();
  for (const [name, spec] of Object.entries(RACKETS)) {
    const scores = computeAxisScores(spec);
    const scoreMap: Record<string, number> = {};
    for (const s of scores) scoreMap[s.axisKey] = s.score;
    allScores.set(name, scoreMap);
  }

  // 2. Rank rackets using player weights
  const ranked = scoreRackets(allScores, scenario.answers);
  const topRacket = ranked[0];

  details.push(`Top ranked: ${topRacket.name} (score: ${topRacket.totalScore.toFixed(1)})`);
  details.push(`Top 5: ${ranked.slice(0, 5).map((r) => `${r.name}(${r.totalScore.toFixed(0)})`).join(", ")}`);

  // 3. Check: top axis expectation
  const expectedAxisKey = scenario.expectations.topAxisKey;
  const topRacketAxes = allScores.get(topRacket.name)!;

  // Find the best axis value among expected ranking rackets
  for (const expectedRacket of scenario.expectations.racketRanking) {
    const axes = allScores.get(expectedRacket);
    if (!axes) {
      details.push(`WARN: expected racket "${expectedRacket}" not found in test set`);
      continue;
    }
    const axisVal = axes[expectedAxisKey] ?? 0;
    details.push(`${expectedRacket}.${expectedAxisKey} = ${axisVal}`);
  }

  // 4. Check: expected racket ordering
  const top3Names = ranked.slice(0, 3).map((r) => r.name);
  const expectedTop = scenario.expectations.racketRanking[0];
  if (expectedTop && !top3Names.includes(expectedTop)) {
    details.push(`FAIL: expected "${expectedTop}" in top 3, got: ${top3Names.join(", ")}`);
    passed = false;
  } else if (expectedTop) {
    details.push(`OK: "${expectedTop}" found in top 3`);
  }

  // 5. Check: explanation fragments
  const currentAxes = scenario.answers.current_racket?.racketModelId
    ? allScores.get(scenario.answers.current_racket.racketModelId) ?? null
    : null;

  const fragments = generateExplanationFragments(
    topRacketAxes,
    scenario.answers,
    currentAxes
  );

  details.push(`Fragments (${fragments.length}): ${fragments.map((f) => `[${f.type}] ${f.textKo}`).join(" | ")}`);

  if (scenario.expectations.explanationMustInclude) {
    const found = fragments.some(
      (f) => f.type === "positive" && f.textKo.includes(scenario.expectations.explanationMustInclude!)
    );
    if (!found) {
      details.push(
        `FAIL: expected fragment containing "${scenario.expectations.explanationMustInclude}"`
      );
      passed = false;
    } else {
      details.push(
        `OK: found fragment containing "${scenario.expectations.explanationMustInclude}"`
      );
    }
  }

  // 6. Check: confidence
  const answersCount = Object.keys(scenario.answers).length;
  const confidence = computeConfidence(answersCount, 3);
  details.push(`Confidence: ${confidence.level} (${confidence.labelKo})`);

  return { scenario: scenario.name, passed, details };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function runEvaluation(): TestResult[] {
  return SCENARIOS.map(runScenario);
}

// CLI entry point
if (process.argv[1]?.endsWith("evaluation-harness.ts") || process.argv[1]?.endsWith("evaluation-harness")) {
  console.log("=== Five-Axis Scoring Evaluation Harness v1 ===\n");

  // First, show raw scores for all test rackets
  console.log("--- Raw Axis Scores ---\n");
  for (const [name, spec] of Object.entries(RACKETS)) {
    const scores = computeAxisScores(spec);
    const scoreStr = scores.map((s) => `${s.axisKey}:${s.score}`).join("  ");
    console.log(`  ${name.padEnd(20)} ${scoreStr}`);
  }
  console.log();

  // Run scenarios
  console.log("--- Scenario Results ---\n");
  const results = runEvaluation();

  let passCount = 0;
  let failCount = 0;

  for (const result of results) {
    const icon = result.passed ? "PASS" : "FAIL";
    console.log(`[${icon}] ${result.scenario}`);
    for (const detail of result.details) {
      console.log(`       ${detail}`);
    }
    console.log();

    if (result.passed) passCount++;
    else failCount++;
  }

  console.log(`\n=== Results: ${passCount} passed, ${failCount} failed out of ${results.length} ===`);

  if (failCount > 0) {
    process.exit(1);
  }
}
