import type { RacketSpecInput } from "./scoring-core";

export type RankingAnswers = {
  play_profile?: { experience?: string };
  swing_style?: { swingSpeed?: number };
  pain_points?: string[];
  priority_tradeoffs?: { first?: string; second?: string };
};

export function calculatePlayerWeights(
  axisRows: { axisKey: string; weightDefault: string | number }[],
  answers: RankingAnswers,
): Map<string, number> {
  const weights = new Map<string, number>();

  for (const axis of axisRows) {
    // The answer priorities should materially change the ordering. Halving the
    // neutral defaults leaves room for those preferences without discarding
    // the other three axes.
    weights.set(axis.axisKey, Number(axis.weightDefault) * 0.5);
  }

  const first = answers.priority_tradeoffs?.first;
  const second = answers.priority_tradeoffs?.second;
  if (first && weights.has(first)) weights.set(first, (weights.get(first) ?? 0) + 0.3);
  if (second && weights.has(second)) weights.set(second, (weights.get(second) ?? 0) + 0.2);

  const total = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0);
  if (total > 0) {
    for (const [key, weight] of weights) weights.set(key, weight / total);
  }
  return weights;
}

export function suitabilityAdjustment(spec: RacketSpecInput, answers: RankingAnswers): number {
  const experience = answers.play_profile?.experience;
  const swingSpeed = answers.swing_style?.swingSpeed ?? 0.5;
  const painPoints = new Set(answers.pain_points ?? []);
  const weight = spec.weightG;
  const swingWeight = spec.swingWeightKgCm2;
  const headSize = spec.headSizeSqIn;
  const stiffness = spec.stiffnessRa;
  let adjustment = 0;

  const rampAbove = (value: number | null, start: number, full: number, max: number) =>
    value == null ? 0 : Math.max(0, Math.min(max, ((value - start) / (full - start)) * max));
  const rampBelow = (value: number | null, start: number, full: number, max: number) =>
    value == null ? 0 : Math.max(0, Math.min(max, ((start - value) / (start - full)) * max));
  const triangle = (value: number | null, center: number, radius: number, max: number) =>
    value == null ? 0 : Math.max(0, max * (1 - Math.abs(value - center) / radius));

  if (experience === "less_1_year" || swingSpeed < 0.4) {
    adjustment -= rampAbove(weight, 285, 330, 25);
    adjustment -= rampAbove(swingWeight, 300, 340, 15);
    adjustment -= rampBelow(headSize, 100, 95, 8);
    adjustment += triangle(weight, 270, 30, 10);
    adjustment += rampAbove(headSize, 100, 110, 8);
    adjustment += rampBelow(swingWeight, 300, 280, 5);
  } else if (experience === "1_3_years") {
    adjustment -= rampAbove(weight, 305, 340, 18);
    adjustment -= rampBelow(weight, 280, 250, 8);
    adjustment -= rampAbove(headSize, 103, 115, 8);
    adjustment += triangle(weight, 292.5, 17.5, 3);
  }

  if (painPoints.has("elbow_pain") || painPoints.has("wrist_pain")) {
    adjustment -= rampAbove(stiffness, 62, 72, 18);
    adjustment += rampBelow(stiffness, 62, 55, 8);
    adjustment -= rampAbove(swingWeight, 320, 340, 12);
  }

  if (painPoints.has("heavy_racket")) {
    adjustment -= rampAbove(weight, 290, 325, 15);
    adjustment += rampBelow(weight, 290, 270, 6);
  }

  return Math.round(adjustment * 100) / 100;
}
