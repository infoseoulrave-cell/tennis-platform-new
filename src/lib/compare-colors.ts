export const COMPARE_COLORS = ["#111", "#3b82f6", "#10b981"] as const;

export function colorForRacket(racketId: string, orderedRacketIds: string[]): string {
  const index = orderedRacketIds.indexOf(racketId);
  return COMPARE_COLORS[index] ?? COMPARE_COLORS[0];
}

