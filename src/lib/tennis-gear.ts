import {
  APPAREL_SUBCATEGORIES,
  GEAR_BRANDS,
  GEAR_CATEGORIES,
  tennisGearCollections,
  type ApparelSubcategory,
  type GearBrand,
  type GearCategory,
  type TennisGearCollection,
} from "../data/tennis-gear";

export type GearFilters = {
  category: GearCategory | "all";
  brand: GearBrand | "all";
  subcategory: ApparelSubcategory | "all";
};

export type GearSearchParams = Record<string, string | string[] | undefined>;
type SearchInput = GearSearchParams | URLSearchParams;

export const DEFAULT_GEAR_FILTERS: GearFilters = {
  category: "apparel",
  brand: "all",
  subcategory: "all",
};

function param(input: SearchInput, key: string): string | undefined {
  const value = input instanceof URLSearchParams ? input.get(key) : input[key];
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

/** Untrusted URL values are normalized before filtering or analytics. */
export function parseGearFilters(input: SearchInput): GearFilters {
  const categoryValue = param(input, "category");
  const brandValue = param(input, "brand");
  const subcategoryValue = param(input, "subcategory");
  const category = categoryValue === "all"
    || GEAR_CATEGORIES.some(({ id }) => id === categoryValue)
    ? categoryValue as GearFilters["category"]
    : DEFAULT_GEAR_FILTERS.category;
  const brand = GEAR_BRANDS.some(({ id }) => id === brandValue)
    ? brandValue as GearBrand
    : "all";
  const subcategory = category === "apparel"
    && APPAREL_SUBCATEGORIES.some(({ id }) => id === subcategoryValue)
    ? subcategoryValue as ApparelSubcategory
    : "all";
  return { category, brand, subcategory };
}

export function filterGearCollections(
  filters: GearFilters,
  collections: readonly TennisGearCollection[] = tennisGearCollections,
): TennisGearCollection[] {
  return collections.filter((collection) => (
    (filters.category === "all" || collection.categories.includes(filters.category))
    && (filters.brand === "all" || collection.brand === filters.brand)
    && (filters.subcategory === "all" || collection.apparelSubcategories.includes(filters.subcategory))
  ));
}

/** Filter URLs retain campaign context, without propagating arbitrary query data. */
export function buildGearHref(filters: GearFilters, input: SearchInput = {}): string {
  const normalized = parseGearFilters(filters);
  const query = new URLSearchParams();
  if (normalized.category !== DEFAULT_GEAR_FILTERS.category) query.set("category", normalized.category);
  if (normalized.brand !== "all") query.set("brand", normalized.brand);
  if (normalized.subcategory !== "all") query.set("subcategory", normalized.subcategory);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "racketlab_test"]) {
    const value = param(input, key);
    if (value) query.set(key, value.slice(0, 100));
  }
  return query.size ? `/gear?${query}` : "/gear";
}

export function gearFilterPayload(filters: GearFilters, action: "view" | "change" = "change") {
  const normalized = parseGearFilters(filters);
  return { ...normalized, action, resultCount: filterGearCollections(normalized).length };
}

export function gearStoreClickPayload(collection: TennisGearCollection, filters: GearFilters) {
  const normalized = parseGearFilters(filters);
  return {
    collectionId: collection.id,
    category: normalized.category,
    subcategory: normalized.subcategory,
    collectionCategories: [...collection.categories],
    brand: collection.brand,
    destinationHost: new URL(collection.url).hostname,
    commercialRelationship: collection.commercialRelationship,
  };
}
