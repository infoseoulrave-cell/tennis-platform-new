import { db } from "@/db";
import {
  axisDefinitions,
  racketAxisScores,
  racketModels,
  racketSpecs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  computeAxisScores,
  SCORING_VERSION,
  type AxisScore,
  type RacketSpecInput,
} from "./scoring-core";

export {
  computeAxisScores,
  parseBeamWidth,
  parseStringDensity,
  SCORING_VERSION,
  type AxisScore,
  type RacketSpecInput,
} from "./scoring-core";

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
