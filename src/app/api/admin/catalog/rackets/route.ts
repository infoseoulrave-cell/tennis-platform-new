import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brands, racketModels, racketSpecs } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const brandFilter = searchParams.get("brand");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];
  if (state) {
    conditions.push(eq(racketSpecs.ingestionState, state as "raw" | "normalized" | "review" | "published" | "rejected"));
  }
  if (brandFilter) {
    conditions.push(eq(brands.name, brandFilter));
  }

  const whereClause = conditions.length > 0
    ? sql`${conditions.reduce((acc, c, i) => i === 0 ? c : sql`${acc} AND ${c}`)}`
    : sql`1=1`;

  const rows = await db
    .select({
      specId: racketSpecs.id,
      modelId: racketModels.id,
      brandName: brands.name,
      brandNameKo: brands.nameKo,
      modelName: racketModels.name,
      modelNameKo: racketModels.nameKo,
      generation: racketModels.generation,
      segment: racketModels.segment,
      releaseYear: racketModels.releaseYear,
      headSizeSqIn: racketSpecs.headSizeSqIn,
      weightG: racketSpecs.weightG,
      balanceMm: racketSpecs.balanceMm,
      stiffnessRa: racketSpecs.stiffnessRa,
      stringPattern: racketSpecs.stringPattern,
      ingestionState: racketSpecs.ingestionState,
      publishedAt: racketSpecs.publishedAt,
      updatedAt: racketSpecs.updatedAt,
    })
    .from(racketSpecs)
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .where(whereClause)
    .orderBy(brands.name, racketModels.name)
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(racketSpecs)
    .innerJoin(racketModels, eq(racketSpecs.racketModelId, racketModels.id))
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .where(whereClause);

  return NextResponse.json({
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
