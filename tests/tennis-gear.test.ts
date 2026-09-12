import assert from "node:assert/strict";
import test from "node:test";
import {
  APPAREL_SUBCATEGORIES,
  GEAR_BRANDS,
  GEAR_CATEGORIES,
  tennisGearCollections,
  type TennisGearCollection,
} from "../src/data/tennis-gear";
import {
  DEFAULT_GEAR_FILTERS,
  buildGearHref,
  filterGearCollections,
  gearFilterPayload,
  gearStoreClickPayload,
  parseGearFilters,
} from "../src/lib/tennis-gear";

test("gear URLs constrain unknown values and discard apparel filters outside apparel", () => {
  assert.deepEqual(parseGearFilters(new URLSearchParams("category=arbitrary&brand=contact@example.com&subcategory=unknown")), DEFAULT_GEAR_FILTERS);
  assert.deepEqual(parseGearFilters({ category: "balls", brand: "head", subcategory: "tops" }), {
    category: "balls", brand: "head", subcategory: "all",
  });
  assert.deepEqual(parseGearFilters({ category: ["apparel", "balls"], brand: ["nike", "head"], subcategory: "skirts_dresses" }), {
    category: "apparel", brand: "nike", subcategory: "skirts_dresses",
  });
});

test("every supported filter combination round-trips through a shareable URL", () => {
  for (const category of ["all", ...GEAR_CATEGORIES.map(({ id }) => id)]) {
    for (const brand of ["all", ...GEAR_BRANDS.map(({ id }) => id)]) {
      for (const subcategory of ["all", ...APPAREL_SUBCATEGORIES.map(({ id }) => id)]) {
        const normalized = parseGearFilters({ category, brand, subcategory });
        const url = new URL(buildGearHref(normalized), "https://racketlab.kr");
        assert.equal(url.pathname, "/gear");
        assert.deepEqual(parseGearFilters(url.searchParams), normalized);
      }
    }
  }
});

test("filter navigation preserves limited campaign context and drops unrelated query input", () => {
  const url = new URL(buildGearHref(DEFAULT_GEAR_FILTERS, {
    utm_source: "codex_qa",
    utm_campaign: "x".repeat(120),
    racketlab_test: "1",
    email: "private@example.com",
    redirect: "https://untrusted.example",
    category: "balls",
  }), "https://racketlab.kr");
  assert.equal(url.searchParams.get("utm_source"), "codex_qa");
  assert.equal(url.searchParams.get("utm_campaign")?.length, 100);
  assert.equal(url.searchParams.get("racketlab_test"), "1");
  assert.equal(url.searchParams.has("email"), false);
  assert.equal(url.searchParams.has("redirect"), false);
  assert.deepEqual(parseGearFilters(url.searchParams), DEFAULT_GEAR_FILTERS);
});

function collection(overrides: Partial<TennisGearCollection>): TennisGearCollection {
  return {
    id: "fixture",
    brand: "nike",
    title: "Fixture",
    description: "Fixture",
    categories: ["apparel"],
    apparelSubcategories: [],
    coverage: [],
    url: "https://www.nike.com/kr/court",
    verifiedOn: "2026-09-13",
    commercialRelationship: "none",
    ...overrides,
  };
}

test("filters intersect brand and verified coverage without inventing subcategory matches", () => {
  const fixtures = [
    collection({ id: "verified-skirt", apparelSubcategories: ["skirts_dresses"] }),
    collection({ id: "unknown-coverage" }),
    collection({ id: "other-brand", brand: "lacoste", apparelSubcategories: ["skirts_dresses"] }),
    collection({ id: "accessory", categories: ["accessories"] }),
  ];
  assert.deepEqual(filterGearCollections({ category: "apparel", brand: "nike", subcategory: "skirts_dresses" }, fixtures).map(({ id }) => id), ["verified-skirt"]);
  assert.deepEqual(filterGearCollections({ category: "apparel", brand: "nike", subcategory: "all" }, fixtures).map(({ id }) => id), ["verified-skirt", "unknown-coverage"]);
  assert.equal(filterGearCollections({ category: "balls", brand: "nike", subcategory: "all" }, fixtures).length, 0);
});

test("collections with several categories appear once in all results and retain context in outbound events", () => {
  const shared = collection({ id: "shared", brand: "wilson", categories: ["balls", "accessories", "gear"], url: "https://kr.wilson.com/collections/tennis" });
  assert.equal(filterGearCollections({ category: "all", brand: "all", subcategory: "all" }, [shared]).length, 1);
  const payload = gearStoreClickPayload(shared, { category: "gear", brand: "wilson", subcategory: "all" });
  assert.equal(payload.category, "gear");
  assert.equal(payload.destinationHost, "kr.wilson.com");
  assert.equal(payload.commercialRelationship, "none");
  assert.equal("url" in payload, false);
  assert.equal(payload.subcategory, "all");
  assert.deepEqual(payload.collectionCategories, ["balls", "accessories", "gear"]);
  const allView = gearStoreClickPayload(shared, { category: "all", brand: "all", subcategory: "all" });
  assert.equal(allView.category, "all");
  assert.deepEqual(allView.collectionCategories, ["balls", "accessories", "gear"]);
});

test("outbound events retain selected apparel intent and normalize invalid filter input", () => {
  const apparel = collection({ apparelSubcategories: ["tops", "skirts_dresses"] });
  const selected = gearStoreClickPayload(apparel, { category: "apparel", brand: "nike", subcategory: "skirts_dresses" });
  assert.equal(selected.category, "apparel");
  assert.equal(selected.subcategory, "skirts_dresses");
  assert.deepEqual(selected.collectionCategories, ["apparel"]);
  const invalid = gearStoreClickPayload(apparel, {
    category: "untrusted", brand: "contact@example.com", subcategory: "unknown",
  } as unknown as Parameters<typeof gearStoreClickPayload>[1]);
  assert.equal(invalid.category, "apparel");
  assert.equal(invalid.subcategory, "all");
  assert.equal(invalid.brand, "nike");
});

test("filter analytics report collection counts including zero without accepting raw URL values", () => {
  const empty = parseGearFilters({ category: "apparel", brand: "head", subcategory: "tops" });
  assert.deepEqual(gearFilterPayload(empty), { ...empty, action: "change", resultCount: 0 });
  const payload = gearFilterPayload(DEFAULT_GEAR_FILTERS);
  assert.equal(payload.resultCount, filterGearCollections(DEFAULT_GEAR_FILTERS).length);
  assert.equal(gearFilterPayload(DEFAULT_GEAR_FILTERS, "view").action, "view");
});

test("published collection records remain unique official destinations with explicit noncommercial relationships", () => {
  const allowedHosts = new Set(["www.nike.com", "www.adidas.co.kr", "www.yonexmall.com", "kr.wilson.com", "headkorea.kr", "www.fila.co.kr", "www.lacoste.com"]);
  assert.equal(new Set(tennisGearCollections.map(({ id }) => id)).size, tennisGearCollections.length);
  assert.equal(new Set(tennisGearCollections.map(({ url }) => url)).size, tennisGearCollections.length);
  for (const entry of tennisGearCollections) {
    const url = new URL(entry.url);
    assert.equal(url.protocol, "https:");
    assert.ok(allowedHosts.has(url.hostname), entry.id);
    assert.equal(url.username, "");
    assert.equal(url.password, "");
    assert.equal(entry.commercialRelationship, "none");
    assert.ok(entry.categories.length);
    if (entry.apparelSubcategories.length) assert.ok(entry.categories.includes("apparel"));
  }
});
