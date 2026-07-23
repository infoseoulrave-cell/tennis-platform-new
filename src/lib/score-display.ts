export const PUBLIC_SCORE_MIN = 10;
export const PUBLIC_SCORE_MIDPOINT = 12.5;
export const PUBLIC_SCORE_MAX = 15;

export type PublicScores15 = {
  power: number;
  control: number;
  spin: number;
  comfort: number;
  stability: number;
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function rawScoreToPublicScore(rawScore: number): number {
  const safeRaw = Number.isFinite(rawScore)
    ? rawScore
    : rawScore === Number.POSITIVE_INFINITY
      ? 100
      : 0;
  const clampedRaw = Math.max(0, Math.min(100, safeRaw));
  return round1(PUBLIC_SCORE_MIN + clampedRaw / 20);
}

export function clampPublicScore(score: number): number {
  const safeScore = Number.isFinite(score)
    ? score
    : score === Number.POSITIVE_INFINITY
      ? PUBLIC_SCORE_MAX
      : PUBLIC_SCORE_MIN;
  return Math.max(PUBLIC_SCORE_MIN, Math.min(PUBLIC_SCORE_MAX, safeScore));
}

export function formatPublicScore(score: number): string {
  return `${clampPublicScore(score).toFixed(1)}/15`;
}

export function publicScoreToFraction(score: number): number {
  return (clampPublicScore(score) - PUBLIC_SCORE_MIN)
    / (PUBLIC_SCORE_MAX - PUBLIC_SCORE_MIN);
}

export function publicScoreToPercent(score: number): number {
  return publicScoreToFraction(score) * 100;
}
