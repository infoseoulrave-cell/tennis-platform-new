import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RacketCatalogFilters, RacketFiltersPanel } from "../src/components/racket-filters";
import {
  activeRacketFilterCount,
  racketsHref,
  resetRacketFiltersHref,
  type RacketSearchParams,
} from "../src/lib/racket-filter-urls";

const selected: RacketSearchParams = {
  brand: ["Head", "Yonex"],
  q: "Speed MP",
  sort: "price_asc",
  page: "3",
  minWeight: "285",
  maxWeight: "305",
  minHead: "98",
  maxHead: "100",
  segment: "intermediate",
};

function links(html: string) {
  return [...html.matchAll(/<a\b([^>]*)>(.*?)<\/a>/gs)].map((match) => {
    const href = match[1].match(/\bhref="([^"]+)"/)?.[1];
    assert.ok(href);
    return {
      text: match[2].replace(/<[^>]+>/g, ""),
      params: new URL(href.replaceAll("&amp;", "&"), "https://racketlab.kr").searchParams,
      current: /aria-current="true"/.test(match[1]),
    };
  });
}

test("mobile and tablet expose all filters in a native disclosure separate from the desktop sidebar", () => {
  const html = renderToStaticMarkup(
    <RacketCatalogFilters brands={[{ name: "Head" }, { name: "Yonex" }]} currentParams={selected} />,
  );
  const sidebar = html.match(/<aside\b[^>]*>[\s\S]*?<\/aside>/)?.[0];
  const disclosure = html.match(/<details\b[^>]*>[\s\S]*?<\/details>/)?.[0];
  assert.ok(sidebar);
  assert.ok(disclosure);
  assert.match(sidebar, /class="hidden lg:block"/);
  assert.match(disclosure, /<details[^>]*\blg:hidden/);
  assert.match(disclosure, /<summary[^>]*>[\s\S]*?필터[\s\S]*?<\/summary>/);
  assert.doesNotMatch(disclosure, /<details[^>]*\sopen(?:[ =]|>)/);
  for (const label of ["브랜드", "무게", "헤드사이즈", "레벨", "Head", "Yonex", "4개 적용", "조건 초기화"]) {
    assert.ok(disclosure.includes(label), `${label} should be available in the mobile disclosure`);
  }
  const page = readFileSync(new URL("../src/app/rackets/(list)/page.tsx", import.meta.url), "utf8");
  assert.match(page, /<RacketCatalogFilters brands=\{brandsList\} currentParams=\{searchParams\} \/>/);
});

test("changing a weight range preserves search, sort, all brands and other filters while resetting pagination", () => {
  const html = renderToStaticMarkup(<RacketFiltersPanel currentParams={selected} />);
  const lightweight = links(html).find((link) => link.text === "270-290g (경량)");
  assert.ok(lightweight);
  assert.deepEqual(lightweight.params.getAll("brand"), ["Head", "Yonex"]);
  for (const key of ["q", "sort", "minHead", "maxHead", "segment"] as const) {
    assert.equal(lightweight.params.get(key), selected[key]);
  }
  assert.equal(lightweight.params.get("minWeight"), "270");
  assert.equal(lightweight.params.get("maxWeight"), "290");
  assert.equal(lightweight.params.has("page"), false);
});

test("custom URL ranges remain usable and changing the level does not discard their bounds", () => {
  const html = renderToStaticMarkup(<RacketFiltersPanel currentParams={selected} />);
  const beginner = links(html).find((link) => link.text === "입문자");
  assert.ok(beginner);
  assert.equal(beginner.params.get("minWeight"), "285");
  assert.equal(beginner.params.get("maxWeight"), "305");
  assert.equal(beginner.params.get("segment"), "beginner");
  assert.equal(beginner.params.has("page"), false);
  assert.equal(links(html).find((link) => link.text === "중급자")?.current, true);

  const changed = renderToStaticMarkup(<RacketFiltersPanel currentParams={{ ...selected, segment: "beginner" }} />);
  assert.equal(links(changed).find((link) => link.text === "입문자")?.current, true);
  assert.equal(links(changed).find((link) => link.text === "중급자")?.current, false);
});

test("choosing a brand replaces the brand selection but preserves every other filter and the sort", () => {
  const html = renderToStaticMarkup(
    <RacketCatalogFilters brands={[{ name: "Babolat" }]} currentParams={selected} />,
  );
  const brand = links(html).find((link) => link.text === "Babolat");
  assert.ok(brand);
  assert.deepEqual(brand.params.getAll("brand"), ["Babolat"]);
  for (const key of ["q", "sort", "minWeight", "maxWeight", "minHead", "maxHead", "segment"] as const) {
    assert.equal(brand.params.get(key), selected[key]);
  }
  assert.equal(brand.params.has("page"), false);
});

test("sort resets pagination and paging keeps the complete repeated-brand filter query", () => {
  const sorted = new URL(racketsHref(selected, { sort: "lightest", page: undefined }), "https://racketlab.kr");
  assert.equal(sorted.searchParams.get("sort"), "lightest");
  assert.equal(sorted.searchParams.has("page"), false);
  assert.deepEqual(sorted.searchParams.getAll("brand"), ["Head", "Yonex"]);
  assert.equal(sorted.searchParams.get("minWeight"), "285");

  const paged = new URL(racketsHref(selected, { page: "4" }), "https://racketlab.kr");
  assert.equal(paged.searchParams.get("page"), "4");
  assert.equal(paged.searchParams.get("sort"), "price_asc");
  assert.deepEqual(paged.searchParams.getAll("brand"), ["Head", "Yonex"]);
  assert.equal(paged.searchParams.get("segment"), "intermediate");
});

test("reset clears filter groups and page without losing the current search or sort", () => {
  assert.equal(activeRacketFilterCount(selected), 4);
  assert.equal(activeRacketFilterCount({ q: "Aero", sort: "newest", brand: [] }), 0);
  const cleared = new URL(resetRacketFiltersHref(selected), "https://racketlab.kr");
  assert.deepEqual([...cleared.searchParams], [["q", "Speed MP"], ["sort", "price_asc"]]);
  assert.equal(resetRacketFiltersHref({}), "/rackets");
});
