import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildPlayerRacketHref } from "../src/components/player-synergy-card";
import { normalizeNavSearchResults } from "../src/components/global-nav";
import { canonicalizeRacketSearchRow } from "../src/app/api/diagnosis/racket-search/route";
import {
  filterSortPaginateRackets,
  pickSpecSourcesByRole,
  resolveRacketSlug,
  selectKoreanVariant,
  type RacketListItem,
} from "../src/lib/queries";

test("player equipment links combine an exact brand filter with a model query", () => {
  const href = buildPlayerRacketHref("HEAD", "Speed");
  const url = new URL(href, "https://example.com");

  assert.equal(url.pathname, "/rackets");
  assert.equal(url.searchParams.get("brand"), "Head");
  assert.equal(url.searchParams.get("q"), "Speed");
});

test("search API and global navigation preserve the server canonical slug and year", () => {
  const apiResult = canonicalizeRacketSearchRow({
    racketModelId: "id-1",
    displayName: "Speed MP 2026",
    displayNameKo: "스피드 MP 2026",
    brandName: "Head",
    brandNameKo: "헤드",
    releaseYear: 2026,
    segment: "intermediate",
    thumbnailUrl: null,
  });
  const [navResult] = normalizeNavSearchResults([apiResult]);

  assert.equal(apiResult.slug, "head-speed-mp-2026");
  assert.equal(navResult.slug, apiResult.slug);
  assert.equal(navResult.year, 2026);
});

test("legacy identity aliases resolve to canonical detail paths and unknown slugs stay null", () => {
  const rows = [
    {
      name: "Prestige MP 2023",
      release_year: 2023,
      brands: { name: "Head" },
      racket_aliases: [{ alias: "Prestige MP 2025" }],
    },
    {
      name: "T-Fight 305 Isoflex 2022",
      release_year: 2022,
      brands: { name: "Tecnifibre" },
      racket_aliases: [{ alias: "T-Fight 305 Isoflex 2024" }],
    },
  ];

  const prestige = resolveRacketSlug(rows, "head-prestige-mp-2025");
  const tfight = resolveRacketSlug(
    rows,
    "tecnifibre-t-fight-305-isoflex-2024",
  );

  assert.equal(
    prestige && `/rackets/${prestige.canonicalSlug}`,
    "/rackets/head-prestige-mp-2023",
  );
  assert.equal(
    tfight && `/rackets/${tfight.canonicalSlug}`,
    "/rackets/tecnifibre-t-fight-305-isoflex-2022",
  );
  assert.equal(resolveRacketSlug(rows, "head-unknown-racket-2099"), null);
  assert.equal(resolveRacketSlug([
    rows[0],
    {
      ...rows[0],
      racket_aliases: [],
    },
  ], "head-prestige-mp-2023"), null);
});

test("detail lookup selects aliases and permanently redirects non-canonical requests", () => {
  const queries = readFileSync(
    new URL("../src/lib/queries.ts", import.meta.url),
    "utf8",
  );
  const detail = readFileSync(
    new URL("../src/app/rackets/[slug]/page.tsx", import.meta.url),
    "utf8",
  );
  const detailLookupQuery = queries.slice(
    queries.indexOf("export async function getRacketBySlug"),
    queries.indexOf("export type RacketFilters"),
  );

  assert.match(detailLookupQuery, /racket_aliases\(alias\)/);
  assert.match(detailLookupQuery, /\.eq\("discontinued", false\)/);
  assert.match(detailLookupQuery, /slug: canonicalSlug/);
  assert.match(detail, /if \(slug !== racket\.slug\)/);
  assert.match(
    detail,
    /permanentRedirect\(`\/rackets\/\$\{racket\.slug\}`\)/,
  );
});

test("global search exposes an accessible modal and restores contained focus", () => {
  const nav = readFileSync(
    new URL("../src/components/global-nav.tsx", import.meta.url),
    "utf8",
  );

  assert.match(nav, /aria-label="라켓 검색 열기"/);
  assert.match(nav, /role="dialog"/);
  assert.match(nav, /aria-modal="true"/);
  assert.match(nav, /aria-label="라켓 검색"/);
  assert.match(nav, /returnFocusRef/);
  assert.match(nav, /if \(searchOpen\) return/);
  assert.match(nav, /querySelectorAll<HTMLElement>/);
  assert.match(nav, /aria-live="polite"/);
  assert.match(nav, /`검색 결과 \$\{searchResults\.length\}개`/);
  assert.match(nav, /settledSearchQuery !== normalizedSearchQuery/);
  assert.match(nav, /settledSearchQuery === normalizedSearchQuery/);
  assert.match(nav, /new AbortController\(\)/);
});

test("Korean availability uses the minimum price across all available KR variants", () => {
  assert.deepEqual(selectKoreanVariant([
    { available_in_korea: false, region_code: "KR", retail_price_krw: 100_000 },
    { available_in_korea: true, region_code: "US", retail_price_krw: 150_000 },
    { available_in_korea: true, region_code: "KR", retail_price_krw: 250_000 },
    { available_in_korea: true, region_code: "KR", retail_price_krw: 220_000 },
  ]), { availableInKorea: true, priceKrw: 220_000 });

  assert.deepEqual(selectKoreanVariant([
    { available_in_korea: false, region_code: "KR", retail_price_krw: 100_000 },
  ]), { availableInKorea: false, priceKrw: null });
});

function racket(overrides: Partial<RacketListItem>): RacketListItem {
  return {
    id: "id",
    slug: "brand-model-2026",
    brand: "Brand",
    model: "Model",
    year: 2026,
    weight: "300g",
    headSize: '100"',
    pattern: "16x19",
    priceKrw: 200_000,
    imageUrl: null,
    scores: null,
    rawScores: null,
    availableInKorea: true,
    ...overrides,
  };
}

test("filtering and sorting happen before pagination and totals describe the filtered set", () => {
  const result = filterSortPaginateRackets([
    racket({ id: "expensive", model: "Pure Aero", priceKrw: 300_000 }),
    racket({ id: "cheap", model: "Pure Aero Team", priceKrw: 100_000 }),
    racket({ id: "middle", model: "Pure Aero 98", priceKrw: 200_000 }),
    racket({ id: "other", brand: "Other", model: "Control", priceKrw: 50_000 }),
  ], {
    brand: ["Brand"],
    q: "Aero",
    sort: "price_asc",
    page: 2,
    limit: 1,
  });

  assert.equal(result.total, 3);
  assert.deepEqual(result.rackets.map(({ id }) => id), ["middle"]);
});

test("weight, head-size, and Korean availability filters affect the total before slicing", () => {
  const result = filterSortPaginateRackets([
    racket({ id: "match", weight: "295g", headSize: '100"' }),
    racket({ id: "heavy", weight: "315g", headSize: '100"' }),
    racket({ id: "small", weight: "295g", headSize: '97"' }),
    racket({ id: "unavailable", weight: "295g", headSize: '100"', availableInKorea: false }),
  ], {
    minWeight: 290,
    maxWeight: 310,
    minHead: 98,
    maxHead: 100,
    page: 1,
    limit: 10,
  });

  assert.equal(result.total, 1);
  assert.deepEqual(result.rackets.map(({ id }) => id), ["match"]);
});

test("axis sorting preserves raw v3 order when public integer axes tie", () => {
  const publicScores = {
    power: 3,
    control: 3,
    spin: 2,
    comfort: 2,
    stability: 2,
  };
  const result = filterSortPaginateRackets([
    racket({
      id: "lower-raw",
      scores: publicScores,
      rawScores: {
        power: 71,
        control: 60,
        spin: 50,
        comfort: 40,
        stability: 30,
      },
    }),
    racket({
      id: "higher-raw",
      scores: publicScores,
      rawScores: {
        power: 79,
        control: 60,
        spin: 50,
        comfort: 40,
        stability: 30,
      },
    }),
  ], {
    sort: "power",
  });

  assert.deepEqual(
    result.rackets.map(({ id }) => id),
    ["higher-raw", "lower-raw"],
  );
});

test("spec provenance keeps the latest source for each explicit evidence role", () => {
  assert.deepEqual(pickSpecSourcesByRole([
    {
      source_url: "https://manufacturer-old.example",
      raw_values: {
        source_role: "manufacturer_static",
        measurement_basis: "unstrung",
      },
      captured_at: "2026-07-21",
      verified_by_admin: true,
    },
    {
      source_url: "https://manufacturer-new.example",
      raw_values: {
        source_role: "manufacturer_static",
        measurement_basis: "unstrung",
      },
      captured_at: "2026-07-23",
      verified_by_admin: true,
    },
    {
      source_url: "https://manufacturer-unverified.example",
      raw_values: {
        source_role: "manufacturer_static",
        measurement_basis: "unstrung",
      },
      captured_at: "2026-07-24",
      verified_by_admin: false,
    },
    {
      source_url: "https://measurement.example",
      raw_values: {
        source_role: "tennis_warehouse_measured",
        measurement_basis: "strung",
      },
      captured_at: "2026-07-22",
      verified_by_admin: true,
    },
  ]), {
    manufacturer_static: {
      role: "manufacturer_static",
      sourceUrl: "https://manufacturer-new.example",
      measurementBasis: "unstrung",
      capturedAt: "2026-07-23",
    },
    tennis_warehouse_measured: {
      role: "tennis_warehouse_measured",
      sourceUrl: "https://measurement.example",
      measurementBasis: "strung",
      capturedAt: "2026-07-22",
    },
  });
});

test("legacy measurement basis falls back to roles and malformed rows stay null", () => {
  assert.deepEqual(pickSpecSourcesByRole([
    {
      source_url: "https://legacy-manufacturer.example",
      raw_values: { measurement_basis: "unstrung" },
      captured_at: "2026-07-21",
      verified_by_admin: true,
    },
    {
      source_url: "https://legacy-unverified.example",
      raw_values: { measurement_basis: "unstrung" },
      captured_at: "2026-07-24",
      verified_by_admin: false,
    },
    {
      source_url: "https://legacy-measurement.example",
      raw_values: { measurement_basis: "strung" },
      captured_at: "2026-07-22",
      verified_by_admin: true,
    },
    {
      source_url: "javascript:alert(1)",
      raw_values: { source_role: "manufacturer_static" },
      captured_at: "2026-07-24",
      verified_by_admin: true,
    },
    {
      source_url: "https://unknown.example",
      raw_values: {},
      captured_at: "2026-07-24",
      verified_by_admin: true,
    },
  ]), {
    manufacturer_static: {
      role: "manufacturer_static",
      sourceUrl: "https://legacy-manufacturer.example",
      measurementBasis: "unstrung",
      capturedAt: "2026-07-21",
    },
    tennis_warehouse_measured: {
      role: "tennis_warehouse_measured",
      sourceUrl: "https://legacy-measurement.example",
      measurementBasis: "strung",
      capturedAt: "2026-07-22",
    },
  });

  assert.deepEqual(pickSpecSourcesByRole(null), {
    manufacturer_static: null,
    tennis_warehouse_measured: null,
  });
});

test("racket detail query selects the admin verification flag for provenance", () => {
  const queries = readFileSync(
    new URL("../src/lib/queries.ts", import.meta.url),
    "utf8",
  );

  assert.match(
    queries,
    /spec_sources\(source_url, raw_values, captured_at, verified_by_admin\)/,
  );
  assert.match(queries, /row\.verified_by_admin !== true/);
});
