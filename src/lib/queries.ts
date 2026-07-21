import { getSupabaseAdmin } from "./supabase";
import { type Scores } from "@/components/radar-chart";
import { clampPublicScore } from "./score-display";
import { resolveRacketImage } from "./racket-images";
import {
  computeAxisScores,
  SCORING_VERSION,
  type RacketSpecInput,
} from "@/modules/recommendation/scoring-core";

export function generateSlug(brand: string, model: string, year?: number | null): string {
  const modelHasYear = year != null && new RegExp(`(?:^|\\D)${year}(?:\\D|$)`).test(model);
  const parts = [brand, model, modelHasYear ? "" : year ?? ""].filter(Boolean).join(" ");
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
  availableInKorea: boolean;
};

export type RacketCatalogIdentity = {
  brand: string;
  model: string;
  year: number;
  slug: string;
};

type AxisScoreRow = {
  score: number;
  axis_key: string;
  input_snapshot?: unknown;
};

export function unwrapSupabaseData<T>(
  data: T | null,
  error: unknown,
  fallback: T,
): T {
  if (error) throw error;
  return data ?? fallback;
}

function isReliableScoreSnapshot(snapshot: unknown): boolean {
  if (!snapshot || typeof snapshot !== "object") return false;
  const value = snapshot as { completeness?: unknown; confidence?: unknown };
  return typeof value.completeness === "number"
    && value.completeness >= 5 / 7
    && typeof value.confidence === "number"
    && value.confidence >= 0.60;
}

export function rowToScores(axisScores: AxisScoreRow[]): Scores | null {
  if (!axisScores.length) return null;
  const out: Partial<Scores> = {};
  const map: Record<string, keyof Scores> = {
    power: "power",
    control: "control",
    spin: "spin",
    comfort: "comfort",
    stability: "stability",
    penetration: "power",
  };
  for (const r of axisScores) {
    if (!isReliableScoreSnapshot(r.input_snapshot)) continue;
    const key = map[r.axis_key];
    if (key) {
      // Stored as 0-100, convert to -5..+5
      const v = Number(r.score);
      if (!Number.isFinite(v)) continue;
      out[key] = clampPublicScore(Math.round(((v / 100) * 10 - 5) * 10) / 10);
    }
  }

  const required: Array<keyof Scores> = ["power", "control", "spin", "comfort", "stability"];
  if (!required.every((key) => out[key] !== undefined)) return null;
  return out as Scores;
}

export function scoresFromSpec(spec: RacketSpecInput): Scores | null {
  return rowToScores(
    computeAxisScores(spec).map(({ axisKey, score, inputSnapshot }) => ({
      axis_key: axisKey,
      score,
      input_snapshot: inputSnapshot,
    })),
  );
}

type VariantRow = {
  available_in_korea?: unknown;
  region_code?: unknown;
  retail_price_krw?: unknown;
};

export function selectKoreanVariant(variants: VariantRow[] | null | undefined): {
  availableInKorea: boolean;
  priceKrw: number | null;
} {
  const available = (variants ?? []).filter((variant) =>
    variant.available_in_korea === true && variant.region_code === "KR"
  );
  const prices = available
    .map((variant) => nullableNumber(variant.retail_price_krw))
    .filter((price): price is number => price !== null);

  return {
    availableInKorea: available.length > 0,
    priceKrw: prices.length > 0 ? Math.min(...prices) : null,
  };
}

type SpecSourceRow = {
  source_url?: unknown;
  raw_values?: unknown;
  captured_at?: unknown;
};

export type RacketSpecSource = {
  sourceUrl: string | null;
  measurementBasis: string | null;
  capturedAt: string | null;
};

export function pickLatestSpecSource(
  sources: SpecSourceRow[] | null | undefined,
): RacketSpecSource | null {
  const latest = [...(sources ?? [])].sort((a, b) =>
    String(b.captured_at ?? "").localeCompare(String(a.captured_at ?? ""))
  )[0];
  if (!latest) return null;

  const rawValues = latest.raw_values && typeof latest.raw_values === "object"
    ? latest.raw_values as Record<string, unknown>
    : null;
  return {
    sourceUrl: typeof latest.source_url === "string" ? latest.source_url : null,
    measurementBasis: typeof rawValues?.measurement_basis === "string"
      ? rawValues.measurement_basis
      : null,
    capturedAt: typeof latest.captured_at === "string" ? latest.captured_at : null,
  };
}

function nullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function rowToSpec(specs: Record<string, unknown> | null): RacketSpecInput {
  return {
    headSizeSqIn: nullableNumber(specs?.head_size_sq_in),
    weightG: nullableNumber(specs?.weight_g),
    balanceMm: nullableNumber(specs?.balance_mm),
    swingWeightKgCm2: nullableNumber(specs?.swing_weight_kg_cm2),
    stiffnessRa: nullableNumber(specs?.stiffness_ra),
    beamWidthMm: (specs?.beam_width_mm as string | null) ?? null,
    stringPattern: (specs?.string_pattern as string | null) ?? null,
  };
}

async function fetchScoresForRackets(racketIds: string[]): Promise<Record<string, Scores | null>> {
  if (!racketIds.length) return {};

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("racket_axis_scores")
    .select(`
      racket_model_id,
      score,
      input_snapshot,
      axis_definitions!inner(axis_key)
    `)
    .in("racket_model_id", racketIds)
    .eq("scoring_version", SCORING_VERSION);

  if (error || !data) return {};

  const grouped: Record<string, AxisScoreRow[]> = {};
  for (const r of data) {
    const axisKey = (r.axis_definitions as unknown as { axis_key: string })?.axis_key;
    if (!axisKey) continue;
    if (!grouped[r.racket_model_id]) grouped[r.racket_model_id] = [];
    grouped[r.racket_model_id].push({
      score: Number(r.score),
      axis_key: axisKey,
      input_snapshot: r.input_snapshot,
    });
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
  const variants = Array.isArray(variantArr)
    ? variantArr
    : variantArr
      ? [variantArr as Record<string, unknown>]
      : [];
  const koreanVariant = selectKoreanVariant(variants);
  const brand = r.brands as { name: string } | null;
  const id = r.id as string;
  const year = r.release_year as number | null;
  const slug = generateSlug(brand?.name ?? "", r.name as string, year);

  return {
    id,
    slug,
    brand: brand?.name ?? "",
    model: r.name as string,
    year,
    weight: specs?.weight_g ? `${Math.round(Number(specs.weight_g))}g` : null,
    headSize: specs?.head_size_sq_in ? `${Number(specs.head_size_sq_in)}"` : null,
    pattern: (specs?.string_pattern as string | null) ?? null,
    priceKrw: koreanVariant.priceKrw,
    imageUrl: resolveRacketImage(r.image_url as string | null, slug)?.url ?? null,
    scores: scoresMap[id] ?? scoresFromSpec(rowToSpec(specs)),
    availableInKorea: koreanVariant.availableInKorea,
  };
}

function racketCatalogIdentityKey(
  racket: Pick<RacketListItem, "brand" | "model" | "year">,
): string {
  return `${racket.brand}\u0000${racket.model}\u0000${racket.year ?? ""}`;
}

export function selectRacketsByCatalogIdentities(
  source: RacketListItem[],
  identities: readonly RacketCatalogIdentity[],
): RacketListItem[] {
  const byIdentity = new Map(
    source.map((racket) => [racketCatalogIdentityKey(racket), racket]),
  );

  return identities.flatMap((identity) => {
    const racket = byIdentity.get(racketCatalogIdentityKey(identity));
    return racket?.slug === identity.slug ? [racket] : [];
  });
}

export async function getRacketsByCatalogIdentities(
  identities: readonly RacketCatalogIdentity[],
): Promise<RacketListItem[]> {
  if (identities.length === 0) return [];

  const supabaseAdmin = getSupabaseAdmin();
  const brands = [...new Set(identities.map((identity) => identity.brand))];
  const models = [...new Set(identities.map((identity) => identity.model))];
  const years = [...new Set(identities.map((identity) => identity.year))];
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, balance_mm,
        swing_weight_kg_cm2, stiffness_ra, beam_width_mm
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `)
    .eq("discontinued", false)
    .in("brands.name", brands)
    .in("name", models)
    .in("release_year", years)
    .limit(identities.length);

  if (error || !data) return [];

  const ids = data.map((racket) => racket.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(
    () => ({} as Record<string, Scores | null>),
  );
  const rackets = data
    .map((racket) => toListItem(racket as unknown as Record<string, unknown>, scoresMap))
    .filter((racket) => racket.availableInKorea);

  return selectRacketsByCatalogIdentities(rackets, identities);
}

export async function getTopRackets(limit: number = 5): Promise<RacketListItem[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, balance_mm,
        swing_weight_kg_cm2, stiffness_ra, beam_width_mm
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `)
    .eq("discontinued", false)
    .order("id")
    .limit(limit);

  if (error || !data) return [];

  const ids = data.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return data
    .map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap))
    .filter((racket) => racket.availableInKorea);
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
  specSource: RacketSpecSource | null;
};

export async function getRacketBySlug(slug: string): Promise<RacketDetail | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, name_ko, release_year, generation, segment, image_url,
      brands!inner(name, name_ko),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, composition,
        balance_mm, swing_weight_kg_cm2, stiffness_ra, length_mm, beam_width_mm,
        spec_sources(source_url, raw_values, captured_at)
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `);

  const rows = unwrapSupabaseData(data, error, []);

  const match = rows.find((r) => {
    const brand = (r.brands as unknown as { name: string } | null)?.name ?? "";
    return generateSlug(brand, r.name, r.release_year) === slug;
  });

  if (!match) return null;

  const scoresMap = await fetchScoresForRackets([match.id]).catch(() => ({} as Record<string, Scores | null>));

  const specs = (match.racket_specs as unknown) as Record<string, unknown> | null;
  const variantArr = (match.racket_variants as unknown) as Array<Record<string, unknown>> | null;
  const variants = Array.isArray(variantArr)
    ? variantArr
    : variantArr
      ? [variantArr as Record<string, unknown>]
      : [];
  const koreanVariant = selectKoreanVariant(variants);
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
    priceKrw: koreanVariant.priceKrw,
    imageUrl: resolveRacketImage(match.image_url, slug)?.url ?? null,
    scores: scoresMap[match.id] ?? scoresFromSpec(rowToSpec(specs)),
    availableInKorea: koreanVariant.availableInKorea,
    specSource: pickLatestSpecSource(
      specs?.spec_sources as Array<Record<string, unknown>> | null,
    ),
  };
}

export type RacketFilters = {
  brand?: string[];
  q?: string;
  minWeight?: number;
  maxWeight?: number;
  minHead?: number;
  maxHead?: number;
  segment?: string;
  sort?: "popular" | "price_asc" | "price_desc" | "power" | "control" | "spin" | "newest" | "lightest" | "heaviest";
  page?: number;
  limit?: number;
};

function numericSpec(value: string | null): number | null {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function compareNullable(
  left: number | null,
  right: number | null,
  direction: "asc" | "desc",
): number {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
}

export function filterSortPaginateRackets(
  source: RacketListItem[],
  filters: RacketFilters = {},
): { rackets: RacketListItem[]; total: number } {
  const brandSet = new Set((filters.brand ?? []).map((brand) => brand.toLowerCase()));
  const query = filters.q?.trim().toLowerCase();
  const rackets = source.filter((racket) => {
    if (!racket.availableInKorea) return false;
    if (brandSet.size > 0 && !brandSet.has(racket.brand.toLowerCase())) return false;
    if (query && !`${racket.brand} ${racket.model}`.toLowerCase().includes(query)) return false;

    const weight = numericSpec(racket.weight);
    if (filters.minWeight !== undefined && (weight === null || weight < filters.minWeight)) return false;
    if (filters.maxWeight !== undefined && (weight === null || weight > filters.maxWeight)) return false;

    const headSize = numericSpec(racket.headSize);
    if (filters.minHead !== undefined && (headSize === null || headSize < filters.minHead)) return false;
    if (filters.maxHead !== undefined && (headSize === null || headSize > filters.maxHead)) return false;
    return true;
  });

  switch (filters.sort) {
    case "price_asc":
      rackets.sort((a, b) => compareNullable(a.priceKrw, b.priceKrw, "asc"));
      break;
    case "price_desc":
      rackets.sort((a, b) => compareNullable(a.priceKrw, b.priceKrw, "desc"));
      break;
    case "lightest":
      rackets.sort((a, b) => compareNullable(numericSpec(a.weight), numericSpec(b.weight), "asc"));
      break;
    case "heaviest":
      rackets.sort((a, b) => compareNullable(numericSpec(a.weight), numericSpec(b.weight), "desc"));
      break;
    case "newest":
      rackets.sort((a, b) => compareNullable(a.year, b.year, "desc"));
      break;
    case "power":
    case "control":
    case "spin": {
      const axis = filters.sort;
      rackets.sort((a, b) => compareNullable(a.scores?.[axis] ?? null, b.scores?.[axis] ?? null, "desc"));
      break;
    }
  }

  const total = rackets.length;
  const limit = Math.max(1, filters.limit ?? 24);
  const page = Math.max(1, filters.page ?? 1);
  const offset = (page - 1) * limit;
  return { rackets: rackets.slice(offset, offset + limit), total };
}

export async function getRackets(filters: RacketFilters = {}): Promise<{
  rackets: RacketListItem[];
  total: number;
}> {
  const supabaseAdmin = getSupabaseAdmin();

  let query = supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, balance_mm,
        swing_weight_kg_cm2, stiffness_ra, beam_width_mm
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `)
    .eq("discontinued", false);

  if (filters.brand?.length) {
    query = query.in("brands.name", filters.brand);
  }

  if (filters.segment) {
    query = query.eq("segment", filters.segment);
  }

  query = query.order("id", { ascending: false }).limit(1000);

  const { data, error } = await query;
  const rows = unwrapSupabaseData(data, error, []);

  const ids = rows.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return filterSortPaginateRackets(
    rows.map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap)),
    filters,
  );
}

export async function getSimilarRackets(racketId: string, brand: string, limit: number = 4): Promise<RacketListItem[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, release_year, image_url,
      brands!inner(name),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, balance_mm,
        swing_weight_kg_cm2, stiffness_ra, beam_width_mm
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `)
    .eq("brands.name", brand)
    .eq("discontinued", false)
    .neq("id", racketId)
    .limit(limit);

  if (error || !data) return [];

  const ids = data.map((r) => r.id);
  const scoresMap = await fetchScoresForRackets(ids).catch(() => ({} as Record<string, Scores | null>));

  return data
    .map((r) => toListItem(r as unknown as Record<string, unknown>, scoresMap))
    .filter((racket) => racket.availableInKorea);
}

export async function getAllBrands(): Promise<{ name: string; nameKo: string | null }[]> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("name, name_ko")
    .order("name");

  if (error || !data) return [];
  return data.map((b) => ({ name: b.name, nameKo: b.name_ko }));
}
