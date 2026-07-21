import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildPlayerRacketHref } from "../src/components/player-synergy-card";
import { normalizeNavSearchResults } from "../src/components/global-nav";
import { canonicalizeRacketSearchRow } from "../src/app/api/diagnosis/racket-search/route";
import {
  filterSortPaginateRackets,
  pickLatestSpecSource,
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

test("latest spec provenance exposes measurement basis from raw values", () => {
  assert.deepEqual(pickLatestSpecSource([
    { source_url: "https://old.example", raw_values: { measurement_basis: "strung" }, captured_at: "2025-01-01" },
    { source_url: "https://new.example", raw_values: { measurement_basis: "unstrung" }, captured_at: "2026-07-21" },
  ]), {
    sourceUrl: "https://new.example",
    measurementBasis: "unstrung",
    capturedAt: "2026-07-21",
  });
});
