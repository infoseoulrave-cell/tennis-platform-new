import { db } from "@/db";
import {
  brands,
  racketModels,
  racketVariants,
  racketSpecs,
  specSources,
  ingestionBatches,
  normalizationDecisions,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import type { ImportRow } from "./validation";

type IngestionState = "raw" | "normalized" | "review" | "published" | "rejected";

const VALID_TRANSITIONS: Record<IngestionState, IngestionState[]> = {
  raw: ["normalized"],
  normalized: ["review"],
  review: ["published", "rejected"],
  published: ["raw"],
  rejected: ["raw"],
};

const REQUIRES_COMMENT: Set<string> = new Set([
  "review->published",
  "review->rejected",
  "published->raw",
]);

export function canTransition(from: IngestionState, to: IngestionState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionRequiresComment(from: IngestionState, to: IngestionState): boolean {
  return REQUIRES_COMMENT.has(`${from}->${to}`);
}

export async function transitionSpecState(
  specId: string,
  targetState: IngestionState,
  comment?: string,
): Promise<{ ok: boolean; error?: string }> {
  const [spec] = await db
    .select({ ingestionState: racketSpecs.ingestionState })
    .from(racketSpecs)
    .where(eq(racketSpecs.id, specId))
    .limit(1);

  if (!spec) return { ok: false, error: "Spec not found" };

  const currentState = spec.ingestionState as IngestionState;

  if (!canTransition(currentState, targetState)) {
    return { ok: false, error: `Cannot transition from ${currentState} to ${targetState}` };
  }

  if (transitionRequiresComment(currentState, targetState) && !comment) {
    return { ok: false, error: `Transition from ${currentState} to ${targetState} requires a comment` };
  }

  const updates: Record<string, unknown> = {
    ingestionState: targetState,
    updatedAt: new Date(),
  };

  if (targetState === "published") {
    updates.publishedAt = new Date();
  }

  await db.update(racketSpecs).set(updates).where(eq(racketSpecs.id, specId));

  return { ok: true };
}

async function findOrCreateBrand(row: ImportRow): Promise<string> {
  const [existing] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.name, row.brand))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(brands)
    .values({
      name: row.brand,
      nameKo: row.brandKo,
      country: row.brandCountry,
    })
    .onConflictDoNothing()
    .returning({ id: brands.id });

  if (created) return created.id;

  const [refetched] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.name, row.brand))
    .limit(1);
  return refetched.id;
}

async function findOrCreateModel(row: ImportRow, brandId: string): Promise<string> {
  const conditions = [
    eq(racketModels.brandId, brandId),
    eq(racketModels.name, row.model),
  ];
  if (row.generation) {
    conditions.push(eq(racketModels.generation, row.generation));
  }

  const [existing] = await db
    .select({ id: racketModels.id })
    .from(racketModels)
    .where(and(...conditions))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db
    .insert(racketModels)
    .values({
      brandId,
      name: row.model,
      nameKo: row.modelKo,
      generation: row.generation,
      segment: row.segment,
      releaseYear: row.releaseYear,
      discontinued: row.discontinued,
    })
    .returning({ id: racketModels.id });

  return created.id;
}

export type ImportResult = {
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: Array<{ row: number; error: string }>;
  batchId: string;
};

export async function importRackets(
  rows: ImportRow[],
  options: { sourceDescription?: string; importedBy?: string; filename?: string } = {},
): Promise<ImportResult> {
  const result: ImportResult = {
    totalRows: rows.length,
    successCount: 0,
    errorCount: 0,
    skippedCount: 0,
    errors: [],
    batchId: "",
  };

  const [batch] = await db
    .insert(ingestionBatches)
    .values({
      filename: options.filename,
      sourceDescription: options.sourceDescription,
      totalRows: rows.length,
      importedBy: options.importedBy ?? "admin",
    })
    .returning({ id: ingestionBatches.id });

  result.batchId = batch.id;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const brandId = await findOrCreateBrand(row);
      const modelId = await findOrCreateModel(row, brandId);

      // Create variant if we have variant-specific data
      if (row.gripSize || row.weightVariant || row.sku || row.retailPriceKrw) {
        await db.insert(racketVariants).values({
          racketModelId: modelId,
          gripSize: row.gripSize,
          weightVariant: row.weightVariant,
          regionCode: row.regionCode,
          sku: row.sku,
          availableInKorea: row.availableInKorea,
          retailPriceKrw: row.retailPriceKrw,
        });
      }

      // Upsert specs
      const hasSpecs =
        row.headSizeSqIn ||
        row.weightG ||
        row.balanceMm ||
        row.swingWeightKgCm2 ||
        row.stiffnessRa ||
        row.lengthMm ||
        row.stringPattern;

      if (hasSpecs) {
        const [existingSpec] = await db
          .select({ id: racketSpecs.id })
          .from(racketSpecs)
          .where(eq(racketSpecs.racketModelId, modelId))
          .limit(1);

        let specId: string;

        if (existingSpec) {
          specId = existingSpec.id;
          // Don't overwrite specs, just add as a new source for conflict detection
          result.skippedCount++;
        } else {
          const [newSpec] = await db
            .insert(racketSpecs)
            .values({
              racketModelId: modelId,
              headSizeSqIn: row.headSizeSqIn?.toString(),
              weightG: row.weightG?.toString(),
              balanceMm: row.balanceMm?.toString(),
              swingWeightKgCm2: row.swingWeightKgCm2?.toString(),
              stiffnessRa: row.stiffnessRa?.toString(),
              lengthMm: row.lengthMm?.toString(),
              beamWidthMm: row.beamWidthMm,
              stringPattern: row.stringPattern,
              composition: row.composition,
              ingestionState: "raw",
            })
            .returning({ id: racketSpecs.id });
          specId = newSpec.id;
          result.successCount++;
        }

        // Always record the source
        await db.insert(specSources).values({
          racketSpecsId: specId,
          batchId: batch.id,
          sourceUrl: row.sourceUrl,
          sourceType: row.sourceType ?? "manual_import",
          rawValues: {
            headSizeSqIn: row.headSizeSqIn,
            weightG: row.weightG,
            balanceMm: row.balanceMm,
            swingWeightKgCm2: row.swingWeightKgCm2,
            stiffnessRa: row.stiffnessRa,
            lengthMm: row.lengthMm,
            beamWidthMm: row.beamWidthMm,
            stringPattern: row.stringPattern,
            composition: row.composition,
          },
          confidence: "0.80",
        });
      } else {
        result.successCount++;
      }
    } catch (err) {
      result.errorCount++;
      result.errors.push({
        row: i + 1,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  await db
    .update(ingestionBatches)
    .set({
      successCount: result.successCount,
      errorCount: result.errorCount,
      skippedCount: result.skippedCount,
      errors: result.errors.length > 0 ? result.errors : null,
      completedAt: new Date(),
    })
    .where(eq(ingestionBatches.id, batch.id));

  return result;
}

export async function detectConflicts(specId: string): Promise<
  Array<{
    field: string;
    values: Array<{ sourceId: string; sourceType: string; value: unknown; confidence: string | null }>;
  }>
> {
  const sources = await db
    .select()
    .from(specSources)
    .where(eq(specSources.racketSpecsId, specId));

  if (sources.length < 2) return [];

  const specFields = [
    "headSizeSqIn",
    "weightG",
    "balanceMm",
    "swingWeightKgCm2",
    "stiffnessRa",
    "lengthMm",
    "beamWidthMm",
    "stringPattern",
    "composition",
  ] as const;

  const conflicts: Array<{
    field: string;
    values: Array<{ sourceId: string; sourceType: string; value: unknown; confidence: string | null }>;
  }> = [];

  for (const field of specFields) {
    const valuesForField = sources
      .map((s) => ({
        sourceId: s.id,
        sourceType: s.sourceType,
        value: (s.rawValues as Record<string, unknown>)?.[field],
        confidence: s.confidence,
      }))
      .filter((v) => v.value != null);

    if (valuesForField.length < 2) continue;

    const uniqueValues = new Set(valuesForField.map((v) => String(v.value)));
    if (uniqueValues.size > 1) {
      conflicts.push({ field, values: valuesForField });
    }
  }

  return conflicts;
}

export async function resolveConflict(
  specId: string,
  field: string,
  resolvedValue: string,
  reason: string,
  reviewedBy: string,
): Promise<void> {
  const sources = await db
    .select()
    .from(specSources)
    .where(eq(specSources.racketSpecsId, specId));

  const conflictingValues = sources
    .map((s) => ({
      sourceId: s.id,
      sourceType: s.sourceType,
      value: (s.rawValues as Record<string, unknown>)?.[field],
    }))
    .filter((v) => v.value != null);

  await db.insert(normalizationDecisions).values({
    racketSpecsId: specId,
    field,
    conflictingSources: conflictingValues,
    resolvedValue,
    reason,
    reviewedBy,
  });

  // Apply resolved value to the spec record
  const fieldMap: Record<string, string> = {
    headSizeSqIn: "head_size_sq_in",
    weightG: "weight_g",
    balanceMm: "balance_mm",
    swingWeightKgCm2: "swing_weight_kg_cm2",
    stiffnessRa: "stiffness_ra",
    lengthMm: "length_mm",
    beamWidthMm: "beam_width_mm",
    stringPattern: "string_pattern",
    composition: "composition",
  };

  const dbColumn = fieldMap[field];
  if (dbColumn) {
    await db.execute(
      sql`UPDATE racket_specs SET ${sql.identifier(dbColumn)} = ${resolvedValue}, updated_at = NOW() WHERE id = ${specId}`,
    );
  }
}
