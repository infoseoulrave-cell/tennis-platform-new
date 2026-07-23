export const SCORING_VERSION = "v3";
export const MIN_SCORE_COMPLETENESS = 5 / 7;
export const MIN_AXIS_CONFIDENCE = 0.60;

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
const INPUT_KEYS = Object.keys(NORM_RANGES) as InputKey[];
const INPUT_KEY_SET = new Set<string>(INPUT_KEYS);

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

export interface AxisDefinition {
  axisKey: "power" | "control" | "spin" | "comfort" | "stability";
  axisName: string;
  axisNameKo: string;
  description: string;
  scoringFormula: string;
  weightDefault: number;
  formula: FormulaInput[];
}

export const AXIS_DEFINITIONS: readonly AxisDefinition[] = [
  {
    axisKey: "power",
    axisName: "Power",
    axisNameKo: "파워",
    description: "Swingweight-centered power estimate from measured and static specifications.",
    scoringFormula: "0.55*SW + 0.20*RA + 0.15*head + 0.10*beam",
    weightDefault: 0.20,
    formula: [
      { key: "swingWeight", weight: 0.55 },
      { key: "stiffness", weight: 0.20 },
      { key: "headSize", weight: 0.15 },
      { key: "beamWidth", weight: 0.10 },
    ],
  },
  {
    axisKey: "control",
    axisName: "Control",
    axisNameKo: "컨트롤",
    description: "Control proxy from head size, string density, beam, and stiffness; not a direct measurement.",
    scoringFormula: "0.35*inverse(head) + 0.35*density + 0.15*inverse(beam) + 0.15*inverse(RA)",
    weightDefault: 0.20,
    formula: [
      { key: "headSize", weight: 0.35, inverse: true },
      { key: "stringDensity", weight: 0.35 },
      { key: "beamWidth", weight: 0.15, inverse: true },
      { key: "stiffness", weight: 0.15, inverse: true },
    ],
  },
  {
    axisKey: "spin",
    axisName: "Spin",
    axisNameKo: "스핀",
    description: "Spin-access proxy from string density, head size, and inverse swingweight for comparable effort.",
    scoringFormula: "0.55*inverse(density) + 0.25*head + 0.20*inverse(SW)",
    weightDefault: 0.20,
    formula: [
      { key: "stringDensity", weight: 0.55, inverse: true },
      { key: "headSize", weight: 0.25 },
      { key: "swingWeight", weight: 0.20, inverse: true },
    ],
  },
  {
    axisKey: "comfort",
    axisName: "Comfort",
    axisNameKo: "편안함",
    description: "Comfort estimate led by inverse stiffness with measured swingweight and static weight.",
    scoringFormula: "0.60*inverse(RA) + 0.25*SW + 0.15*weight",
    weightDefault: 0.20,
    formula: [
      { key: "stiffness", weight: 0.60, inverse: true },
      { key: "swingWeight", weight: 0.25 },
      { key: "weight", weight: 0.15 },
    ],
  },
  {
    axisKey: "stability",
    axisName: "Stability",
    axisNameKo: "안정성",
    description: "Stability estimate from measured swingweight and static weight only.",
    scoringFormula: "0.55*SW + 0.45*weight",
    weightDefault: 0.20,
    formula: [
      { key: "swingWeight", weight: 0.55 },
      { key: "weight", weight: 0.45 },
    ],
  },
] as const;

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function isReliableScoreSnapshot(snapshot: unknown): boolean {
  if (!isPlainObject(snapshot)) return false;
  const value = snapshot as {
    scoringVersion?: unknown;
    normalizedInputs?: unknown;
    usedInputs?: unknown;
    completeness?: unknown;
    confidence?: unknown;
  };
  if (!isPlainObject(value.normalizedInputs) || !Array.isArray(value.usedInputs)) {
    return false;
  }

  const normalizedKeys = Reflect.ownKeys(value.normalizedInputs);
  if (
    normalizedKeys.some((key) =>
      typeof key !== "string" || !INPUT_KEY_SET.has(key)
    )
  ) {
    return false;
  }
  for (const key of normalizedKeys) {
    const normalizedValue = value.normalizedInputs[key as InputKey];
    if (
      typeof normalizedValue !== "number"
      || !Number.isFinite(normalizedValue)
      || normalizedValue < 0
      || normalizedValue > 100
    ) {
      return false;
    }
  }

  if (
    value.usedInputs.length === 0
    || value.usedInputs.some((key) =>
      typeof key !== "string" || !INPUT_KEY_SET.has(key)
    )
    || new Set(value.usedInputs).size !== value.usedInputs.length
    || value.usedInputs.some((key) =>
      !Object.prototype.hasOwnProperty.call(value.normalizedInputs, key)
    )
  ) {
    return false;
  }

  if (
    value.scoringVersion !== SCORING_VERSION
    || typeof value.completeness !== "number"
    || !Number.isFinite(value.completeness)
    || value.completeness < 0
    || value.completeness > 1
    || typeof value.confidence !== "number"
    || !Number.isFinite(value.confidence)
    || value.confidence < 0
    || value.confidence > 1
  ) {
    return false;
  }

  const expectedCompleteness = normalizedKeys.length / INPUT_KEYS.length;
  return Math.abs(value.completeness - expectedCompleteness) <= 1e-9
    && value.completeness >= MIN_SCORE_COMPLETENESS
    && value.confidence >= MIN_AXIS_CONFIDENCE;
}

export function hasReliableAxisScores(scores: readonly AxisScore[]): boolean {
  if (scores.length !== AXIS_DEFINITIONS.length) return false;
  const required = new Set<string>(AXIS_DEFINITIONS.map(({ axisKey }) => axisKey));
  return scores.every(({ axisKey, inputSnapshot }) =>
    required.delete(axisKey) && isReliableScoreSnapshot(inputSnapshot)
  ) && required.size === 0;
}

export function computeAxisScores(spec: RacketSpecInput): AxisScore[] {
  const inputs = normalizeInputs(spec);
  const completeness = Object.keys(inputs).length / Object.keys(NORM_RANGES).length;

  return AXIS_DEFINITIONS.flatMap(({ axisKey, formula }) => {
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
