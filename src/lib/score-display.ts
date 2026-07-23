export const PUBLIC_AXIS_KEYS = [
  "power",
  "control",
  "spin",
  "comfort",
  "stability",
] as const;

export type PublicAxisKey = typeof PUBLIC_AXIS_KEYS[number];
export type PublicAxisScores5 = Record<PublicAxisKey, number>;
export type RawAxisScores100 = Record<PublicAxisKey, number>;

const PUBLIC_AXIS_MIN = 0;
const PUBLIC_AXIS_MAX = 5;
const PUBLIC_TOTAL_MIN = 10;
const PUBLIC_TOTAL_MAX = 15;
const TIE_PRECISION = 1e12;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function safeRawScore(value: number): number {
  if (Number.isFinite(value)) return clamp(value, 0, 100);
  return value === Number.POSITIVE_INFINITY ? 100 : 0;
}

function boundedSimplexProjection(
  values: readonly number[],
  target: number,
): number[] {
  let lowerShift = -PUBLIC_AXIS_MAX;
  let upperShift = PUBLIC_AXIS_MAX;

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const shift = (lowerShift + upperShift) / 2;
    const sum = values.reduce(
      (total, value) =>
        total + clamp(value + shift, PUBLIC_AXIS_MIN, PUBLIC_AXIS_MAX),
      0,
    );
    if (sum < target) {
      lowerShift = shift;
    } else {
      upperShift = shift;
    }
  }

  const shift = (lowerShift + upperShift) / 2;
  return values.map((value) =>
    clamp(value + shift, PUBLIC_AXIS_MIN, PUBLIC_AXIS_MAX)
  );
}

export function rawScoresToPublicAxisScores(
  rawScores: RawAxisScores100,
): PublicAxisScores5 {
  const rawValues = PUBLIC_AXIS_KEYS.map((axis) => safeRawScore(rawScores[axis]));
  const rawTotal = rawValues.reduce((total, value) => total + value, 0);
  const targetTotal = Math.round(PUBLIC_TOTAL_MIN + rawTotal / 100);
  const projected = boundedSimplexProjection(
    rawValues.map((value) => value / 20),
    targetTotal,
  );
  const allocations = projected.map((value, index) => {
    const integer = Math.floor(value);
    return {
      index,
      integer,
      raw: rawValues[index],
      remainder: Math.round((value - integer) * TIE_PRECISION) / TIE_PRECISION,
    };
  });

  let remaining = targetTotal
    - allocations.reduce((total, allocation) => total + allocation.integer, 0);
  const priority = [...allocations]
    .filter(({ integer }) => integer < PUBLIC_AXIS_MAX)
    .sort((left, right) =>
      right.remainder - left.remainder
      || right.raw - left.raw
      || left.index - right.index
    );

  for (const allocation of priority) {
    if (remaining === 0) break;
    allocations[allocation.index].integer += 1;
    remaining -= 1;
  }
  if (remaining !== 0) {
    throw new Error("Unable to allocate the bounded public score total.");
  }

  return Object.fromEntries(
    PUBLIC_AXIS_KEYS.map((axis, index) => [axis, allocations[index].integer]),
  ) as PublicAxisScores5;
}

export function sumPublicAxisScores(scores: PublicAxisScores5): number {
  return PUBLIC_AXIS_KEYS.reduce((total, axis) => total + scores[axis], 0);
}

export function formatPublicAxisScore(score: number): string {
  const safeScore = Number.isFinite(score)
    ? score
    : score === Number.POSITIVE_INFINITY
      ? PUBLIC_AXIS_MAX
      : PUBLIC_AXIS_MIN;
  return `${Math.round(clamp(safeScore, PUBLIC_AXIS_MIN, PUBLIC_AXIS_MAX))}/5`;
}

export function formatPublicTotal(scores: PublicAxisScores5): string {
  const total = Math.round(clamp(
    sumPublicAxisScores(scores),
    PUBLIC_TOTAL_MIN,
    PUBLIC_TOTAL_MAX,
  ));
  return `${total}/15`;
}

export function publicAxisScoreToFraction(score: number): number {
  const safeScore = Number.isFinite(score)
    ? score
    : score === Number.POSITIVE_INFINITY
      ? PUBLIC_AXIS_MAX
      : PUBLIC_AXIS_MIN;
  return clamp(safeScore, PUBLIC_AXIS_MIN, PUBLIC_AXIS_MAX) / PUBLIC_AXIS_MAX;
}

export function publicAxisScoreToPercent(score: number): number {
  return publicAxisScoreToFraction(score) * 100;
}
