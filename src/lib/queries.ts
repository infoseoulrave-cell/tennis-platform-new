import { db } from "@/db";
import { brands, racketModels, racketSpecs, racketVariants, racketAxisScores } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { type Scores } from "@/components/radar-chart";

export function generateSlug(brand: string, model: string, year?: number | null): string {
  const parts = [brand, model, year ?? ""].filter(Boolean).join(" ");
  return parts
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type RacketListItem = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  weight: string | null;
  headSize: string | null;
  pattern: string | null;
  priceKrw: number | null;
  imageUrl: string | null;
  scores: Scores | null;
};

function rowToScores(row: { score: string; axisKey: string }[]): Scores | null {
  if (!row.length) return null;
  const out: Scores = { power: 0, control: 0, spin: 0, comfort: 0, stability: 0 };
  const map: Record<string, keyof Scores> = {
    power: "power",
    control: "control",
    spin: "spin",
    comfort: "comfort",
    stability: "stability",
    penetration: "power",
  };
  for (const r of row) {
    const key = map[r.axisKey];
    if (key) {
      // Stored as 0-100, convert to -5..+5
      const v = parseFloat(r.score);
      out[key] = Math.round(((v / 100) * 10 - 5) * 10) / 10;
    }
  }
  return out;
}

async function fetchScoresForRackets(racketIds: string[]): Promise<Record<string, Scores | null>> {
  if (!racketIds.length) return {};
  const rows = await db
    .select({
      racketId: racketAxisScores.racketModelId,
      score: racketAxisScores.score,
      axisKey: sql<string>`(SELECT axis_key FROM axis_definitions WHERE id = ${racketAxisScores.axisDefinitionId})`,
    })
    .from(racketAxisScores)
    .where(sql`${racketAxisScores.racketModelId} = ANY(${racketIds})`);

  const grouped: Record<string, { score: string; axisKey: string }[]> = {};
  for (const r of rows) {
    if (!grouped[r.racketId]) grouped[r.racketId] = [];
    grouped[r.racketId].push({ score: r.score, axisKey: r.axisKey });
  }

  const result: Record<string, Scores | null> = {};
  for (const id of racketIds) {
    result[id] = rowToScores(grouped[id] || []);
  }
  return result;
}

export async function getTopRackets(limit: number = 5): Promise<RacketListItem[]> {
  const rows = await db
    .select({
      id: racketModels.id,
      brand: brands.name,
      model: racketModels.name,
      year: racketModels.releaseYear,
      imageUrl: racketModels.imageUrl,
      weightG: racketSpecs.weightG,
      headSize: racketSpecs.headSizeSqIn,
      pattern: racketSpecs.stringPattern,
      priceKrw: racketVariants.retailPriceKrw,
    })
    .from(racketModels)
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .leftJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
    .leftJoin(racketVariants, eq(racketVariants.racketModelId, racketModels.id))
    .orderBy(racketModels.id)
    .limit(limit);

  const ids = rows.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return rows.map((r) => ({
    id: r.id,
    slug: generateSlug(r.brand, r.model, r.year),
    brand: r.brand,
    model: r.model,
    year: r.year,
    weight: r.weightG ? `${Math.round(parseFloat(r.weightG))}g` : null,
    headSize: r.headSize ? `${parseFloat(r.headSize)}"` : null,
    pattern: r.pattern,
    priceKrw: r.priceKrw,
    imageUrl: r.imageUrl,
    scores: scoresMap[r.id] || null,
  }));
}

export type RacketDetail = RacketListItem & {
  nameKo: string | null;
  generation: string | null;
  segment: string | null;
  composition: string | null;
  balanceMm: number | null;
  swingWeight: number | null;
  stiffness: number | null;
  lengthMm: number | null;
  beamWidth: string | null;
  brandKo: string | null;
};

export async function getRacketBySlug(slug: string): Promise<RacketDetail | null> {
  // Get all rackets, find the matching slug (since slug is computed)
  const rows = await db
    .select({
      id: racketModels.id,
      brand: brands.name,
      brandKo: brands.nameKo,
      model: racketModels.name,
      nameKo: racketModels.nameKo,
      year: racketModels.releaseYear,
      generation: racketModels.generation,
      segment: racketModels.segment,
      imageUrl: racketModels.imageUrl,
      weightG: racketSpecs.weightG,
      headSize: racketSpecs.headSizeSqIn,
      pattern: racketSpecs.stringPattern,
      composition: racketSpecs.composition,
      balanceMm: racketSpecs.balanceMm,
      swingWeight: racketSpecs.swingWeightKgCm2,
      stiffness: racketSpecs.stiffnessRa,
      lengthMm: racketSpecs.lengthMm,
      beamWidth: racketSpecs.beamWidthMm,
      priceKrw: racketVariants.retailPriceKrw,
    })
    .from(racketModels)
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .leftJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
    .leftJoin(racketVariants, eq(racketVariants.racketModelId, racketModels.id));

  const match = rows.find((r) => generateSlug(r.brand, r.model, r.year) === slug);
  if (!match) return null;

  const scoresMap = await fetchScoresForRackets([match.id]).catch(() => ({} as Record<string, Scores | null>));

  return {
    id: match.id,
    slug,
    brand: match.brand,
    brandKo: match.brandKo,
    model: match.model,
    nameKo: match.nameKo,
    year: match.year,
    generation: match.generation,
    segment: match.segment,
    composition: match.composition,
    weight: match.weightG ? `${Math.round(parseFloat(match.weightG))}g` : null,
    headSize: match.headSize ? `${parseFloat(match.headSize)}"` : null,
    pattern: match.pattern,
    balanceMm: match.balanceMm ? parseFloat(match.balanceMm) : null,
    swingWeight: match.swingWeight ? parseFloat(match.swingWeight) : null,
    stiffness: match.stiffness ? parseFloat(match.stiffness) : null,
    lengthMm: match.lengthMm ? parseFloat(match.lengthMm) : null,
    beamWidth: match.beamWidth,
    priceKrw: match.priceKrw,
    imageUrl: match.imageUrl,
    scores: scoresMap[match.id] || null,
  };
}

export type RacketFilters = {
  brand?: string[];
  minWeight?: number;
  maxWeight?: number;
  minHead?: number;
  maxHead?: number;
  segment?: string;
  sort?: "popular" | "price_asc" | "price_desc" | "power" | "control" | "spin";
  page?: number;
  limit?: number;
};

export async function getRackets(filters: RacketFilters = {}): Promise<{
  rackets: RacketListItem[];
  total: number;
}> {
  const limit = filters.limit ?? 24;
  const page = filters.page ?? 1;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.brand?.length) {
    conditions.push(sql`${brands.name} = ANY(${filters.brand})`);
  }
  if (filters.segment) {
    conditions.push(eq(racketModels.segment, filters.segment));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: racketModels.id,
      brand: brands.name,
      model: racketModels.name,
      year: racketModels.releaseYear,
      imageUrl: racketModels.imageUrl,
      weightG: racketSpecs.weightG,
      headSize: racketSpecs.headSizeSqIn,
      pattern: racketSpecs.stringPattern,
      priceKrw: racketVariants.retailPriceKrw,
    })
    .from(racketModels)
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .leftJoin(racketSpecs, eq(racketSpecs.racketModelId, racketModels.id))
    .leftJoin(racketVariants, eq(racketVariants.racketModelId, racketModels.id))
    .where(whereClause)
    .orderBy(filters.sort === "price_asc" ? racketVariants.retailPriceKrw : desc(racketModels.id))
    .limit(limit)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(racketModels)
    .innerJoin(brands, eq(racketModels.brandId, brands.id))
    .where(whereClause);

  const ids = rows.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return {
    rackets: rows.map((r) => ({
      id: r.id,
      slug: generateSlug(r.brand, r.model, r.year),
      brand: r.brand,
      model: r.model,
      year: r.year,
      weight: r.weightG ? `${Math.round(parseFloat(r.weightG))}g` : null,
      headSize: r.headSize ? `${parseFloat(r.headSize)}"` : null,
      pattern: r.pattern,
      priceKrw: r.priceKrw,
      imageUrl: r.imageUrl,
      scores: scoresMap[r.id] || null,
    })),
    total: totalResult[0]?.count ?? 0,
  };
}

export async function getAllBrands(): Promise<{ name: string; nameKo: string | null }[]> {
  return db.select({ name: brands.name, nameKo: brands.nameKo }).from(brands).orderBy(brands.name);
}
