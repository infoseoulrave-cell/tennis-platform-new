import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public static routes do not opt into per-request rendering", () => {
  const staticPages = [
    "src/app/about/page.tsx",
    "src/app/guide/page.tsx",
    "src/app/guide/dna/page.tsx",
    "src/app/guide/grip/page.tsx",
    "src/app/guide/strings/page.tsx",
    "src/app/players/page.tsx",
    "src/app/updates/page.tsx",
  ];

  for (const page of staticPages) {
    assert.doesNotMatch(read(page), /force-dynamic/, page);
  }
  assert.match(read("src/app/page.tsx"), /export const revalidate = 3600/);
});

test("navigation avoids the external font request and exposes route feedback", () => {
  const layout = read("src/app/layout.tsx");
  assert.doesNotMatch(layout, /cdn\.jsdelivr\.net|pretendardvariable-dynamic-subset/);

  for (const path of [
    "src/app/rackets/loading.tsx",
    "src/app/rackets/[slug]/loading.tsx",
    "src/app/compare/loading.tsx",
    "src/app/results/[id]/loading.tsx",
    "src/app/strings/loading.tsx",
  ]) {
    const loading = read(path);
    assert.match(loading, /role="status"/, path);
    assert.match(loading, /className="sr-only"/, path);
  }
});

test("database reads avoid common request waterfalls", () => {
  const queries = read("src/lib/queries.ts");
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const compare = read("src/app/compare/page.tsx");
  const results = read("src/app/results/[id]/page.tsx");

  assert.match(queries, /cache\(async \(/);
  assert.match(detail, /<Suspense fallback=\{<PriceComparisonFallback \/>/);
  assert.match(detail, /<Suspense fallback=\{<SimilarRacketsFallback \/>/);
  assert.match(compare, /await Promise\.all\(/);
  assert.match(results, /inArray\(racketModels\.id, racketIds\)/);
  assert.match(results, /\.leftJoin\(racketSpecs/);
  assert.doesNotMatch(results, /for \(const racketId of racketIds\)/);
});
