import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands, racketModels, racketSpecs, specSources, normalizationDecisions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { detectConflicts } from "@/modules/catalog/ingestion";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  // Get all specs in "review" or "normalized" state that may have conflicts
  const specs = await db
    .select({
      specId: racketSpecs.id,
      modelId: racketModels.id,
      brandName: brands.name,
      modelName: racketModels.name,
      generation: racketModels.generation,
      ingestionState: racketSpecs.ingestionState,
      headSizeSqIn: racketSpecs.headSizeSqIn,
      weightG: racketSpecs.weightG,
      balanceMm: racketSpecs.balanceMm,
      stiffnessRa: racketSpecs.stiffnessRa,
      stringPattern: racketSpecs.stringPattern,
    })
    .from(racketSpecs)
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .where(eq(racketSpecs.ingestionState, "review"))
    .orderBy(brands.name, racketModels.name);

  const reviewItems = await Promise.all(
    specs.map(async (spec) => {
      const conflicts = await detectConflicts(spec.specId);
      const [{ sourceCount }] = await db
        .select({ sourceCount: count() })
        .from(specSources)
        .where(eq(specSources.racketSpecsId, spec.specId));
      const decisions = await db
        .select()
        .from(normalizationDecisions)
        .where(eq(normalizationDecisions.racketSpecsId, spec.specId));

      return {
        ...spec,
        sourceCount,
        conflictCount: conflicts.length,
        conflicts,
        resolvedCount: decisions.length,
      };
    }),
  );

  return NextResponse.json({ data: reviewItems, total: reviewItems.length });
}
