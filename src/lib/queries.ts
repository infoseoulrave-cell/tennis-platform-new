import { getSupabaseAdmin } from "./supabase";
import {
  PUBLIC_AXIS_KEYS,
  rawScoresToPublicAxisScores,
  type PublicAxisKey,
  type PublicAxisScores5,
  type RawAxisScores100,
} from "./score-display";
import { resolveRacketImage } from "./racket-images";
import {
  computeAxisScores,
  isReliableScoreSnapshot,
  SCORING_VERSION,
  type RacketSpecInput,
} from "@/modules/recommendation/scoring-core";
import { RACKET_SCORE_EVIDENCE } from "@/data/racket-score-evidence";

export function generateSlug(brand: string, model: string, year?: number | null): string {
  const modelHasYear = year != null && new RegExp(`(?:^|\\D)${year}(?:\\D|$)`).test(model);
  const parts = [brand, model, modelHasYear ? "" : year ?? ""].filter(Boolean).join(" ");
  return parts
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type RacketSlugLookupRow = {
  name: string;
  release_year: number | null;
  brands: unknown;
  racket_aliases?: unknown;
};

export type RacketSlugResolution = {
  index: number;
  canonicalSlug: string;
};

function relationRecords(value: unknown): Record<string, unknown>[] {
  const records = Array.isArray(value) ? value : value ? [value] : [];
  return records.filter(
    (record): record is Record<string, unknown> =>
      typeof record === "object" && record !== null,
  );
}

function slugBrandName(row: RacketSlugLookupRow): string {
  const brand = relationRecords(row.brands)[0];
  return typeof brand?.name === "string" ? brand.name : "";
}

export function resolveRacketSlug(
  rows: readonly RacketSlugLookupRow[],
  requestedSlug: string,
): RacketSlugResolution | null {
  const normalizedRequest = requestedSlug.trim().toLowerCase();
  if (!normalizedRequest) return null;

  const canonicalMatches = rows.flatMap((row, index) => {
    const canonicalSlug = generateSlug(
      slugBrandName(row),
      row.name,
      row.release_year,
    );
    return canonicalSlug === normalizedRequest
      ? [{ index, canonicalSlug }]
      : [];
  });
  if (canonicalMatches.length > 0) {
    return canonicalMatches.length === 1 ? canonicalMatches[0] : null;
  }

  const aliasMatchIndexes = rows.flatMap((row, index) => {
    const brand = slugBrandName(row);
    const brandOnlySlug = generateSlug(brand, "");
    const hasAliasMatch = relationRecords(row.racket_aliases).some((aliasRow) => {
      if (typeof aliasRow.alias !== "string") return false;
      const aliasSlug = generateSlug(brand, aliasRow.alias);
      return aliasSlug !== brandOnlySlug && aliasSlug === normalizedRequest;
    });
    return hasAliasMatch ? [index] : [];
  });
  const uniqueAliasMatchIndexes = [...new Set(aliasMatchIndexes)];
  if (uniqueAliasMatchIndexes.length !== 1) return null;

  const index = uniqueAliasMatchIndexes[0];
  const row = rows[index];
  return {
    index,
    canonicalSlug: generateSlug(
      slugBrandName(row),
      row.name,
      row.release_year,
    ),
  };
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
  scores: PublicAxisScores5 | null;
  rawScores: RawAxisScores100 | null;
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

const PUBLIC_AXIS_KEY_SET = new Set<string>(PUBLIC_AXIS_KEYS);

export function unwrapSupabaseData<T>(
  data: T | null,
  error: unknown,
  fallback: T,
): T {
  if (error) throw error;
  return data ?? fallback;
}

export function rowToRawScores(
  axisScores: AxisScoreRow[],
): RawAxisScores100 | null {
  if (axisScores.length !== PUBLIC_AXIS_KEYS.length) return null;

  const out: Partial<RawAxisScores100> = {};
  const seen = new Set<string>();
  for (const r of axisScores) {
    if (
      !PUBLIC_AXIS_KEY_SET.has(r.axis_key)
      || seen.has(r.axis_key)
      || !isReliableScoreSnapshot(r.input_snapshot)
    ) return null;

    const value = Number(r.score);
    if (!Number.isFinite(value) || value < 0 || value > 100) return null;
    const key = r.axis_key as PublicAxisKey;
    seen.add(key);
    out[key] = value;
  }

  return out as RawAxisScores100;
}

export function rowToScores(
  axisScores: AxisScoreRow[],
): PublicAxisScores5 | null {
  const rawScores = rowToRawScores(axisScores);
  return rawScores ? rawScoresToPublicAxisScores(rawScores) : null;
}

export function rawScoresFromSpec(
  spec: RacketSpecInput,
): RawAxisScores100 | null {
  return rowToRawScores(
    computeAxisScores(spec).map(({ axisKey, score, inputSnapshot }) => ({
      axis_key: axisKey,
      score,
      input_snapshot: inputSnapshot,
    })),
  );
}

export function resolveRacketRawScores({
  persistedRawScores,
  databaseSpec,
  identity,
}: {
  persistedRawScores: RawAxisScores100 | null | undefined;
  databaseSpec: RacketSpecInput;
  identity: {
    brand: string;
    model: string;
    year: number | null;
  };
}): RawAxisScores100 | null {
  if (persistedRawScores) return persistedRawScores;

  const databaseRawScores = rawScoresFromSpec(databaseSpec);
  if (databaseRawScores) return databaseRawScores;

  const evidence = RACKET_SCORE_EVIDENCE.find(({ identity: candidate }) =>
    candidate.brand === identity.brand
    && candidate.releaseYear === identity.year
    && (
      candidate.lookupModelName === identity.model
      || candidate.modelName === identity.model
    )
  );
  return evidence ? rawScoresFromSpec(evidence.normalizedSpec) : null;
}

export function scoresFromSpec(spec: RacketSpecInput): PublicAxisScores5 | null {
  const rawScores = rawScoresFromSpec(spec);
  return rawScores ? rawScoresToPublicAxisScores(rawScores) : null;
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
  verified_by_admin?: unknown;
};

export type RacketSpecSource = {
  role: RacketSpecSourceRole;
  sourceUrl: string;
  measurementBasis: "unstrung" | "strung" | null;
  capturedAt: string | null;
};

export type RacketSpecSourceRole =
  | "manufacturer_static"
  | "tennis_warehouse_measured";

export type RacketSpecSources = Record<
  RacketSpecSourceRole,
  RacketSpecSource | null
>;

function specSourceRole(rawValues: Record<string, unknown> | null): RacketSpecSourceRole | null {
  if (rawValues?.source_role === "manufacturer_static") return "manufacturer_static";
  if (rawValues?.source_role === "tennis_warehouse_measured") {
    return "tennis_warehouse_measured";
  }
  if (rawValues?.measurement_basis === "unstrung") return "manufacturer_static";
  if (rawValues?.measurement_basis === "strung") return "tennis_warehouse_measured";
  return null;
}

function safeSourceUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function toRacketSpecSource(row: SpecSourceRow): RacketSpecSource | null {
  if (row.verified_by_admin !== true) return null;

  const rawValues = row.raw_values && typeof row.raw_values === "object"
    ? row.raw_values as Record<string, unknown>
    : null;
  const role = specSourceRole(rawValues);
  const sourceUrl = safeSourceUrl(row.source_url);
  if (!role || !sourceUrl) return null;

  const measurementBasis = rawValues?.measurement_basis === "unstrung"
    || rawValues?.measurement_basis === "strung"
    ? rawValues.measurement_basis
    : null;
  return {
    role,
    sourceUrl,
    measurementBasis,
    capturedAt: typeof row.captured_at === "string" ? row.captured_at : null,
  };
}

export function pickSpecSourcesByRole(
  sources: SpecSourceRow[] | null | undefined,
): RacketSpecSources {
  const result: RacketSpecSources = {
    manufacturer_static: null,
    tennis_warehouse_measured: null,
  };
  const parsed = (sources ?? [])
    .map(toRacketSpecSource)
    .filter((source): source is RacketSpecSource => source !== null)
    .sort((a, b) => {
      const capturedDifference = String(b.capturedAt ?? "")
        .localeCompare(String(a.capturedAt ?? ""));
      return capturedDifference !== 0
        ? capturedDifference
        : a.sourceUrl.localeCompare(b.sourceUrl);
    });

  for (const source of parsed) {
    result[source.role] ??= source;
  }
  return result;
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

async function fetchRawScoresForRackets(
  racketIds: string[],
): Promise<Record<string, RawAxisScores100 | null>> {
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
    .eq("scoring_version", SCORING_VERSION)
    .eq("axis_definitions.version", SCORING_VERSION);

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

  const result: Record<string, RawAxisScores100 | null> = {};
  for (const id of racketIds) {
    result[id] = rowToRawScores(grouped[id] || []);
  }
  return result;
}

function toListItem(
  r: Record<string, unknown>,
  rawScoresMap: Record<string, RawAxisScores100 | null>,
): RacketListItem {
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
  const rawScores = resolveRacketRawScores({
    persistedRawScores: rawScoresMap[id],
    databaseSpec: rowToSpec(specs),
    identity: {
      brand: brand?.name ?? "",
      model: r.name as string,
      year,
    },
  });

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
    scores: rawScores ? rawScoresToPublicAxisScores(rawScores) : null,
    rawScores,
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
  const rawScoresMap = await fetchRawScoresForRackets(ids).catch(
    () => ({} as Record<string, RawAxisScores100 | null>),
  );
  const rackets = data
    .map((racket) =>
      toListItem(racket as unknown as Record<string, unknown>, rawScoresMap)
    )
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
  const rawScoresMap = await fetchRawScoresForRackets(ids).catch(
    () => ({} as Record<string, RawAxisScores100 | null>),
  );

  return data
    .map((r) => toListItem(r as unknown as Record<string, unknown>, rawScoresMap))
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
  specSources: RacketSpecSources;
};

export async function getRacketBySlug(slug: string): Promise<RacketDetail | null> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("racket_models")
    .select(`
      id, name, name_ko, release_year, generation, segment, image_url,
      brands!inner(name, name_ko),
      racket_aliases(alias),
      racket_specs(
        weight_g, head_size_sq_in, string_pattern, composition,
        balance_mm, swing_weight_kg_cm2, stiffness_ra, length_mm, beam_width_mm,
        spec_sources(source_url, raw_values, captured_at, verified_by_admin)
      ),
      racket_variants(retail_price_krw, available_in_korea, region_code)
    `)
    .eq("discontinued", false);

  const rows = unwrapSupabaseData(data, error, []);

  const resolution = resolveRacketSlug(rows, slug);
  if (!resolution) return null;
  const match = rows[resolution.index];
  const canonicalSlug = resolution.canonicalSlug;

  const rawScoresMap = await fetchRawScoresForRackets([match.id]).catch(
    () => ({} as Record<string, RawAxisScores100 | null>),
  );

  const specs = (match.racket_specs as unknown) as Record<string, unknown> | null;
  const variantArr = (match.racket_variants as unknown) as Array<Record<string, unknown>> | null;
  const variants = Array.isArray(variantArr)
    ? variantArr
    : variantArr
      ? [variantArr as Record<string, unknown>]
      : [];
  const koreanVariant = selectKoreanVariant(variants);
  const brand = (match.brands as unknown) as { name: string; name_ko: string | null } | null;
  const rawScores = resolveRacketRawScores({
    persistedRawScores: rawScoresMap[match.id],
    databaseSpec: rowToSpec(specs),
    identity: {
      brand: brand?.name ?? "",
      model: match.name,
      year: match.release_year,
    },
  });

  return {
    id: match.id,
    slug: canonicalSlug,
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
    imageUrl: resolveRacketImage(match.image_url, canonicalSlug)?.url ?? null,
    scores: rawScores ? rawScoresToPublicAxisScores(rawScores) : null,
    rawScores,
    availableInKorea: koreanVariant.availableInKorea,
    specSources: pickSpecSourcesByRole(
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
      rackets.sort((a, b) =>
        compareNullable(
          a.rawScores?.[axis] ?? null,
          b.rawScores?.[axis] ?? null,
          "desc",
        )
      );
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
  const rawScoresMap = await fetchRawScoresForRackets(ids).catch(
    () => ({} as Record<string, RawAxisScores100 | null>),
  );

  return filterSortPaginateRackets(
    rows.map((r) =>
      toListItem(r as unknown as Record<string, unknown>, rawScoresMap)
    ),
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
  const rawScoresMap = await fetchRawScoresForRackets(ids).catch(
    () => ({} as Record<string, RawAxisScores100 | null>),
  );

  return data
    .map((r) => toListItem(r as unknown as Record<string, unknown>, rawScoresMap))
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
