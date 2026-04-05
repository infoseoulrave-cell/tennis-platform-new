import { db } from "@/db";
import {
  axisDefinitions,
  racketAxisScores,
  racketModels,
  racketSpecs,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Constants — scoring version and normalization ranges
// ---------------------------------------------------------------------------

export const SCORING_VERSION = "v1";

/**
 * Normalization ranges for racket spec fields.
 * Based on the realistic range of tennis rackets on the Korean market
 * (from ultra-light beginner to heavy pro frames).
 * Values outside these ranges are clamped to [0, 100].
 */
const NORM_RANGES: Record<string, { min: number; max: number }> = {
  headSize: { min: 93, max: 115 },
  weight: { min: 250, max: 345 },
  balance: { min: 300, max: 350 },
  swingWeight: { min: 275, max: 345 },
  stiffness: { min: 50, max: 75 },
  beamWidth: { min: 18, max: 30 },
  stringDensity: { min: 280, max: 370 },
};

// ---------------------------------------------------------------------------
// Spec parsing helpers
// ---------------------------------------------------------------------------

/** Parse "16x19" → 16*19 = 304. Returns null if unparseable. */
export function parseStringDensity(pattern: string | null): number | null {
  if (!pattern) return null;
  const match = pattern.match(/^(\d+)\s*[xX×]\s*(\d+)$/);
  if (!match) return null;
  return parseInt(match[1], 10) * parseInt(match[2], 10);
}

/** Parse "21/23/21" or "22" → average numeric value. */
export function parseBeamWidth(beam: string | null): number | null {
  if (!beam) return null;
  const parts = beam.split("/").map((s) => parseFloat(s.trim()));
  if (parts.some(isNaN) || parts.length === 0) return null;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/** Linear normalization to 0–100, clamped. */
function norm(value: number, rangeKey: string): number {
  const range = NORM_RANGES[rangeKey];
  if (!range) return 50;
  const normalized = ((value - range.min) / (range.max - range.min)) * 100;
  return Math.max(0, Math.min(100, Math.round(normalized * 100) / 100));
}

/** Inverse normalization: 100 − norm(value). */
function invNorm(value: number, rangeKey: string): number {
  return 100 - norm(value, rangeKey);
}

// ---------------------------------------------------------------------------
// Per-axis scoring formulas (v1)
// ---------------------------------------------------------------------------

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

/**
 * Resolve all spec values into normalized 0-100 inputs.
 * Missing values fall back to the midpoint (50).
 */
function normalizeInputs(spec: RacketSpecInput): NormalizedInputs {
  const beamWidth = parseBeamWidth(spec.beamWidthMm);
  const stringDensity = parseStringDensity(spec.stringPattern);

  return {
    headSize: spec.headSizeSqIn != null ? norm(spec.headSizeSqIn, "headSize") : 50,
    weight: spec.weightG != null ? norm(spec.weightG, "weight") : 50,
    balance: spec.balanceMm != null ? norm(spec.balanceMm, "balance") : 50,
    swingWeight: spec.swingWeightKgCm2 != null ? norm(spec.swingWeightKgCm2, "swingWeight") : 50,
    stiffness: spec.stiffnessRa != null ? norm(spec.stiffnessRa, "stiffness") : 50,
    beamWidth: beamWidth != null ? norm(beamWidth, "beamWidth") : 50,
    stringDensity: stringDensity != null ? norm(stringDensity, "stringDensity") : 50,
  };
}

type AxisFormula = (inputs: NormalizedInputs) => number;

const AXIS_FORMULAS: Record<string, AxisFormula> = {
  // Power: bigger head, heavier swing, stiffer frame, heavier mass
  power: (i) =>
    0.35 * i.headSize +
    0.30 * i.swingWeight +
    0.20 * i.stiffness +
    0.15 * i.weight,

  // Control: smaller head, denser strings, heavier mass, lower stiffness
  control: (i) =>
    0.35 * (100 - i.headSize) +
    0.30 * i.stringDensity +
    0.20 * i.weight +
    0.15 * (100 - i.stiffness),

  // Comfort: lower stiffness, wider beam, lighter weight (less fatigue)
  comfort: (i) =>
    0.45 * (100 - i.stiffness) +
    0.35 * i.beamWidth +
    0.20 * (100 - i.weight),

  // Spin: open strings, larger head, head-heavy balance
  spin: (i) =>
    0.45 * (100 - i.stringDensity) +
    0.30 * i.headSize +
    0.25 * i.balance,

  // Stability: heavy mass, high swing weight, larger head
  stability: (i) =>
    0.35 * i.weight +
    0.35 * i.swingWeight +
    0.30 * i.headSize,
};

// ---------------------------------------------------------------------------
// Public: compute scores for a single racket
// ---------------------------------------------------------------------------

export interface AxisScore {
  axisKey: string;
  score: number;
  inputSnapshot: Record<string, number>;
}

/**
 * Compute all five axis scores for a single racket's specs.
 * Returns scores as 0-100 integers.
 */
export function computeAxisScores(spec: RacketSpecInput): AxisScore[] {
  const inputs = normalizeInputs(spec);
  const snapshot: Record<string, number> = { ...inputs };

  return Object.entries(AXIS_FORMULAS).map(([axisKey, formula]) => ({
    axisKey,
    score: Math.round(formula(inputs)),
    inputSnapshot: snapshot,
  }));
}

// ---------------------------------------------------------------------------
// Public: batch compute and persist scores for published rackets
// ---------------------------------------------------------------------------

export interface ComputeResult {
  racketModelId: string;
  racketName: string;
  scores: AxisScore[];
}

/**
 * Compute and persist axis scores for all published rackets (or a subset).
 * Replaces existing scores for the same racket + version.
 */
export async function computeAndPersistScores(
  racketModelIds?: string[]
): Promise<ComputeResult[]> {
  // 1. Load axis definitions for this version
  const axisDefs = await db
    .select({
      id: axisDefinitions.id,
      axisKey: axisDefinitions.axisKey,
    })
    .from(axisDefinitions)
    .where(eq(axisDefinitions.version, SCORING_VERSION));

  const axisDefByKey = new Map(axisDefs.map((a) => [a.axisKey, a.id]));

  // 2. Load published racket specs
  const specQuery = db
    .select({
      racketModelId: racketSpecs.racketModelId,
      racketName: racketModels.name,
      headSizeSqIn: racketSpecs.headSizeSqIn,
      weightG: racketSpecs.weightG,
      balanceMm: racketSpecs.balanceMm,
      swingWeightKgCm2: racketSpecs.swingWeightKgCm2,
      stiffnessRa: racketSpecs.stiffnessRa,
      beamWidthMm: racketSpecs.beamWidthMm,
      stringPattern: racketSpecs.stringPattern,
    })
    .from(racketSpecs)
    .innerJoin(racketModels, eq(racketModels.id, racketSpecs.racketModelId))
    .where(eq(racketSpecs.ingestionState, "published"));

  const rows = racketModelIds
    ? await specQuery.then((all) =>
        all.filter((r) => racketModelIds.includes(r.racketModelId))
      )
    : await specQuery;

  const results: ComputeResult[] = [];

  for (const row of rows) {
    const spec: RacketSpecInput = {
      headSizeSqIn: row.headSizeSqIn ? parseFloat(row.headSizeSqIn) : null,
      weightG: row.weightG ? parseFloat(row.weightG) : null,
      balanceMm: row.balanceMm ? parseFloat(row.balanceMm) : null,
      swingWeightKgCm2: row.swingWeightKgCm2 ? parseFloat(row.swingWeightKgCm2) : null,
      stiffnessRa: row.stiffnessRa ? parseFloat(row.stiffnessRa) : null,
      beamWidthMm: row.beamWidthMm,
      stringPattern: row.stringPattern,
    };

    const scores = computeAxisScores(spec);

    // Delete existing scores for this racket + version, then insert new ones
    await db
      .delete(racketAxisScores)
      .where(
        and(
          eq(racketAxisScores.racketModelId, row.racketModelId),
          eq(racketAxisScores.scoringVersion, SCORING_VERSION)
        )
      );

    const insertRows = scores
      .filter((s) => axisDefByKey.has(s.axisKey))
      .map((s) => ({
        racketModelId: row.racketModelId,
        axisDefinitionId: axisDefByKey.get(s.axisKey)!,
        scoringVersion: SCORING_VERSION,
        score: s.score.toFixed(2),
        inputSnapshot: s.inputSnapshot,
      }));

    if (insertRows.length > 0) {
      await db.insert(racketAxisScores).values(insertRows);
    }

    results.push({
      racketModelId: row.racketModelId,
      racketName: row.racketName,
      scores,
    });
  }

  return results;
}

/**
 * Compute and persist scores for a single racket (by model ID).
 * Called when a spec transitions to "published".
 */
export async function computeScoresForRacket(
  racketModelId: string
): Promise<ComputeResult | null> {
  const results = await computeAndPersistScores([racketModelId]);
  return results[0] ?? null;
}
