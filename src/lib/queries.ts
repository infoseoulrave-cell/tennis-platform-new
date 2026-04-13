import { supabaseAdmin } from "./supabase";
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

function rowToScores(axisScores: { score: number; axis_key: string }[]): Scores | null {
  if (!axisScores.length) return null;
  const out: Scores = { power: 0, control: 0, spin: 0, comfort: 0, stability: 0 };
  const map: Record<string, keyof Scores> = {
    power: "power",
    control: "control",
    spin: "spin",
    comfort: "comfort",
    stability: "stability",
    penetration: "power",
  };
  for (const r of axisScores) {
    const key = map[r.axis_key];
    if (key) {
      // Stored as 0-100, convert to -5..+5
      const v = Number(r.score);
      out[key] = Math.round(((v / 100) * 10 - 5) * 10) / 10;
    }
  }
  return out;
}

async function fetchScoresForRackets(racketIds: string[]): Promise<Record<string, Scores | null>> {
  if (!racketIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from("racket_axis_scores")
    .select(`
      racket_model_id,
      score,
      axis_definitions!inner(axis_key)
    `)
    .in("racket_model_id", racketIds);

  if (error || !data) return {};

  const grouped: Record<string, { score: number; axis_key: string }[]> = {};
  for (const r of data) {
    const axisKey = (r.axis_definitions as unknown as { axis_key: string })?.axis_key;
    if (!axisKey) continue;
    if (!grouped[r.racket_model_id]) grouped[r.racket_model_id] = [];
    grouped[r.racket_model_id].push({ score: Number(r.score), axis_key: axisKey });
  }

  const result: Record<string, Scores | null> = {};
  for (const id of racketIds) {
    result[id] = rowToScores(grouped[id] || []);
  }
  return result;
}

function toListItem(r: Record<string, unknown>, scoresMap: Record<string, Scores | null>): RacketListItem {
  const specs = r.racket_specs as Record<string, unknown> | null;
  // racket_variants is a 1-to-many join — PostgREST returns an array
  const variantArr = r.racket_variants as Array<Record<string, unknown>> | null;
  const variant = Array.isArray(variantArr) ? (variantArr[0] ?? null) : (variantArr as Record<string, unknown> | null);
  const brand = r.brands as { name: string } | null;
  const id = r.id as string;
  const year = r.release_year as number | null;

  return {
    id,
    slug: generateSlug(brand?.name ?? "", r.name as string, year),
    brand: brand?.name ?? "",
    model: r.name as string,
    year,
    weight: specs?.weight_g ? `${Math.round(Number(specs.weight_g))}g` : null,
    headSize: specs?.head_size_sq_in ? `${Number(specs.head_size_sq_in)}"` : null,
    pattern: (specs?.string_pattern as string | null) ?? null,
    priceKrw: (variant?.retail_price_krw as number | null) ?? null,
    imageUrl: (r.image_url as string | null) ?? null,
    scores: scoresMap[id] || null,
  };
}

export async function getTopRackets(limit: number = 5): Promise<RacketListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(weight_g, head_size_sq_in, string_pattern),
      racket_variants(retail_price_krw)
    `)
    .order("id")
    .limit(limit);

  if (error || !data) return [];

  const ids = data.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return data.map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap));
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
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, name_ko, release_year, generation, segment, image_url,
      brands!inner(name, name_ko),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, composition,
        balance_mm, swing_weight_kg_cm2, stiffness_ra, length_mm, beam_width_mm
      ),
      racket_variants(retail_price_krw)
    `);

  if (error || !data) return null;

  const match = data.find((r) => {
    const brand = (r.brands as unknown as { name: string } | null)?.name ?? "";
    return generateSlug(brand, r.name, r.release_year) === slug;
  });

  if (!match) return null;

  const scoresMap = await fetchScoresForRackets([match.id]).catch(() => ({} as Record<string, Scores | null>));

  const specs = (match.racket_specs as unknown) as Record<string, unknown> | null;
  const variantArr = (match.racket_variants as unknown) as Array<Record<string, unknown>> | null;
  const variant = Array.isArray(variantArr) ? (variantArr[0] ?? null) : (variantArr as Record<string, unknown> | null);
  const brand = (match.brands as unknown) as { name: string; name_ko: string | null } | null;

  return {
    id: match.id,
    slug,
    brand: brand?.name ?? "",
    brandKo: brand?.name_ko ?? null,
    model: match.name,
    nameKo: match.name_ko,
    year: match.release_year,
    generation: match.generation,
    segment: match.segment,
    composition: (specs?.composition as string | null) ?? null,
    weight: specs?.weight_g ? `${Math.round(Number(specs.weight_g))}g` : null,
    headSize: specs?.head_size_sq_in ? `${Number(specs.head_size_sq_in)}"` : null,
    pattern: (specs?.string_pattern as string | null) ?? null,
    balanceMm: specs?.balance_mm ? Number(specs.balance_mm) : null,
    swingWeight: specs?.swing_weight_kg_cm2 ? Number(specs.swing_weight_kg_cm2) : null,
    stiffness: specs?.stiffness_ra ? Number(specs.stiffness_ra) : null,
    lengthMm: specs?.length_mm ? Number(specs.length_mm) : null,
    beamWidth: (specs?.beam_width_mm as string | null) ?? null,
    priceKrw: (variant?.retail_price_krw as number | null) ?? null,
    imageUrl: match.image_url,
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
  sort?: "popular" | "price_asc" | "price_desc" | "power" | "control" | "spin" | "newest" | "lightest" | "heaviest";
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

  let query = supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(weight_g, head_size_sq_in, string_pattern),
      racket_variants(retail_price_krw)
    `, { count: "exact" });

  if (filters.brand?.length) {
    query = query.in("brands.name", filters.brand);
  }

  if (filters.segment) {
    query = query.eq("segment", filters.segment);
  }

  if (filters.sort === "newest") {
    query = query.order("release_year", { ascending: false, nullsFirst: false });
  } else if (filters.sort === "price_asc") {
    query = query.order("id", { ascending: false });
  } else if (filters.sort === "price_desc") {
    query = query.order("id", { ascending: false });
  } else {
    query = query.order("id", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error || !data) return { rackets: [], total: 0 };

  const ids = data.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  let rackets = data.map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap));

  if (filters.minWeight || filters.maxWeight) {
    rackets = rackets.filter((r) => {
      const w = r.weight ? parseFloat(r.weight) : null;
      if (w === null) return false;
      if (filters.minWeight && w < filters.minWeight) return false;
      if (filters.maxWeight && w > filters.maxWeight) return false;
      return true;
    });
  }

  if (filters.minHead || filters.maxHead) {
    rackets = rackets.filter((r) => {
      const h = r.headSize ? parseFloat(r.headSize) : null;
      if (h === null) return false;
      if (filters.minHead && h < filters.minHead) return false;
      if (filters.maxHead && h > filters.maxHead) return false;
      return true;
    });
  }

  if (filters.sort === "price_asc") {
    rackets.sort((a, b) => (a.priceKrw ?? 999999) - (b.priceKrw ?? 999999));
  } else if (filters.sort === "price_desc") {
    rackets.sort((a, b) => (b.priceKrw ?? 0) - (a.priceKrw ?? 0));
  } else if (filters.sort === "lightest") {
    rackets.sort((a, b) => (parseFloat(a.weight ?? "999") - parseFloat(b.weight ?? "999")));
  } else if (filters.sort === "heaviest") {
    rackets.sort((a, b) => (parseFloat(b.weight ?? "0") - parseFloat(a.weight ?? "0")));
  }

  return {
    rackets,
    total: count ?? rackets.length,
  };
}

export async function getSimilarRackets(racketId: string, brand: string, limit: number = 4): Promise<RacketListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(weight_g, head_size_sq_in, string_pattern),
      racket_variants(retail_price_krw)
    `)
    .eq("brands.name", brand)
    .neq("id", racketId)
    .limit(limit);

  if (error || !data) return [];

  const ids = data.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return data.map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap));
}

export async function getAllBrands(): Promise<{ name: string; nameKo: string | null }[]> {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("name, name_ko")
    .order("name");

  if (error || !data) return [];
  return data.map((b) => ({ name: b.name, nameKo: b.name_ko }));
}
