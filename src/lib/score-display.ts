export function clampPublicScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(-5, Math.min(5, score));
}

export function formatPublicScore(score: number): string {
  const clamped = clampPublicScore(score);
  const rounded = Math.sign(clamped) * Math.round(Math.abs(clamped));
  if (Object.is(rounded, -0) || rounded === 0) return "0";
  return rounded > 0 ? `+${rounded}` : String(rounded);
}

export function publicScoreToPercent(score: number): number {
  return ((clampPublicScore(score) + 5) / 10) * 100;
}
