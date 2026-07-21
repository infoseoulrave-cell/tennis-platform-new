export const SCORING_VERSION = "v2";

const NORM_RANGES = {
  headSize: { min: 93, max: 115 },
  weight: { min: 250, max: 345 },
  balance: { min: 300, max: 350 },
  swingWeight: { min: 275, max: 345 },
  stiffness: { min: 50, max: 75 },
  beamWidth: { min: 18, max: 30 },
  stringDensity: { min: 280, max: 370 },
} as const;

export function parseStringDensity(pattern: string | null): number | null {
  if (!pattern) return null;
  const match = pattern.match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10) * parseInt(match[2], 10);
}

export function parseBeamWidth(beam: string | null): number | null {
  if (!beam) return null;
  const parts = beam.split("/").map((part) => parseFloat(part.trim()));
  if (parts.some(isNaN) || parts.length === 0) return null;
  return parts.reduce((total, part) => total + part, 0) / parts.length;
}

function norm(value: number, rangeKey: InputKey): number {
  const range = NORM_RANGES[rangeKey];
  const normalized = ((value - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized * 100) / 100));
}

export interface RacketSpecInput {
  headSizeSqIn: number | null;
  weightG: number | null;
  balanceMm: number | null;
  swingWeightKgCm2: number | null;
  stiffnessRa: number | null;
  beamWidthMm: string | null;
  stringPattern: string | null;
}

interface NormalizedInputs {
  headSize: number;
  weight: number;
  balance: number;
  swingWeight: number;
  stiffness: number;
  beamWidth: number;
  stringDensity: number;
}

type InputKey = keyof NormalizedInputs;
type AvailableInputs = Partial<NormalizedInputs>;

function normalizeValue(value: number | null, rangeKey: InputKey): number | undefined {
  return value != null && Number.isFinite(value) ? norm(value, rangeKey) : undefined;
}

function normalizeInputs(spec: RacketSpecInput): AvailableInputs {
  const beamWidth = parseBeamWidth(spec.beamWidthMm);
  const stringDensity = parseStringDensity(spec.stringPattern);
  const values: Array<[InputKey, number | undefined]> = [
    ["headSize", normalizeValue(spec.headSizeSqIn, "headSize")],
    ["weight", normalizeValue(spec.weightG, "weight")],
    ["balance", normalizeValue(spec.balanceMm, "balance")],
    ["swingWeight", normalizeValue(spec.swingWeightKgCm2, "swingWeight")],
    ["stiffness", normalizeValue(spec.stiffnessRa, "stiffness")],
    ["beamWidth", normalizeValue(beamWidth, "beamWidth")],
    ["stringDensity", normalizeValue(stringDensity, "stringDensity")],
  ];

  return Object.fromEntries(
    values.filter((entry): entry is [InputKey, number] => entry[1] !== undefined),
  );
}

interface FormulaInput {
  key: InputKey;
  weight: number;
  inverse?: boolean;
}

const AXIS_FORMULAS: Record<string, FormulaInput[]> = {
  power: [
    { key: "swingWeight", weight: 0.35 },
    { key: "stiffness", weight: 0.25 },
    { key: "beamWidth", weight: 0.20 },
    { key: "headSize", weight: 0.20 },
  ],
  control: [
    { key: "headSize", weight: 0.30, inverse: true },
    { key: "stringDensity", weight: 0.25 },
    { key: "beamWidth", weight: 0.20, inverse: true },
    { key: "stiffness", weight: 0.25, inverse: true },
  ],
  spin: [
    { key: "stringDensity", weight: 0.65, inverse: true },
    { key: "headSize", weight: 0.35 },
  ],
  comfort: [
    { key: "stiffness", weight: 0.60, inverse: true },
    { key: "swingWeight", weight: 0.25 },
    { key: "weight", weight: 0.15 },
  ],
  stability: [
    { key: "swingWeight", weight: 0.45 },
    { key: "weight", weight: 0.35 },
    { key: "beamWidth", weight: 0.20 },
  ],
};

function computeFormula(
  inputs: AvailableInputs,
  formula: FormulaInput[],
): { score: number; confidence: number; usedInputs: InputKey[] } | null {
  const available = formula.filter(({ key }) => inputs[key] !== undefined);
  const availableWeight = available.reduce((total, input) => total + input.weight, 0);
  if (availableWeight === 0) return null;

  const weightedScore = available.reduce((total, input) => {
    const value = inputs[input.key]!;
    return total + (input.inverse ? 100 - value : value) * input.weight;
  }, 0);

  return {
    score: Math.round(weightedScore / availableWeight),
    confidence: Math.round(availableWeight * 100) / 100,
    usedInputs: available.map(({ key }) => key),
  };
}

export interface AxisScore {
  axisKey: string;
  score: number;
  inputSnapshot: {
    scoringVersion: typeof SCORING_VERSION;
    normalizedInputs: AvailableInputs;
    usedInputs: InputKey[];
    completeness: number;
    confidence: number;
  };
}

export function computeAxisScores(spec: RacketSpecInput): AxisScore[] {
  const inputs = normalizeInputs(spec);
  const completeness = Object.keys(inputs).length / Object.keys(NORM_RANGES).length;

  return Object.entries(AXIS_FORMULAS).flatMap(([axisKey, formula]) => {
    const result = computeFormula(inputs, formula);
    if (!result) return [];

    return [{
      axisKey,
      score: result.score,
      inputSnapshot: {
        scoringVersion: SCORING_VERSION,
        normalizedInputs: inputs,
        usedInputs: result.usedInputs,
        completeness,
        confidence: result.confidence,
      },
    }];
  });
}
