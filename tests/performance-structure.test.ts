import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("racket color simulation stays a dedicated-route client island", () => {
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const customizerPageUrl = new URL(
    "../src/app/customizer/[slug]/page.tsx",
    import.meta.url,
  );
  const nestedCustomizerPageUrl = new URL(
    "../src/app/rackets/[slug]/customizer/page.tsx",
    import.meta.url,
  );
  const customizerLoadingUrl = new URL(
    "../src/app/customizer/loading.tsx",
    import.meta.url,
  );
  const customizerSlugLoadingUrl = new URL(
    "../src/app/customizer/[slug]/loading.tsx",
    import.meta.url,
  );
  const catalog = read("src/app/rackets/page.tsx");
  assert.ok(
    existsSync(customizerPageUrl),
    "the customizer route should live outside the racket detail loading boundary",
  );
  assert.equal(existsSync(nestedCustomizerPageUrl), false);
  assert.equal(existsSync(customizerLoadingUrl), false);
  assert.equal(existsSync(customizerSlugLoadingUrl), false);

  const customizer = read("src/app/customizer/[slug]/page.tsx");
  const customizerCall =
    customizer.match(/<RacketVisualCustomizer[\s\S]*?\/>/)?.[0] ?? "";

  assert.doesNotMatch(
    detail,
    /racket-visual-customizer|<RacketVisualCustomizer/,
  );
  assert.match(
    customizer,
    /import \{ RacketVisualCustomizer \} from "@\/components\/racket-visual-customizer";/,
  );
  assert.doesNotMatch(customizer, /^["']use client["'];/m);
  // 도식은 서버에서 스펙으로 계산해 넘긴다. 클라이언트는 색만 바꾼다.
  assert.match(customizerCall, /geometry=\{geometry\}/);
  assert.match(customizerCall, /pattern=\{racket\.pattern/);
  assert.match(customizerCall, /headSize=\{racket\.headSize/);
  assert.match(
    customizer,
    /const racketName = `\$\{racket\.brand\} \$\{formatRacketName\(racket\.model, racket\.year\)\}`/,
  );
  assert.match(customizerCall, /racketName=\{racketName\}/);
  assert.match(
    detail,
    /href=\{racketCustomizerPath\(racket\.slug\)\}/,
  );
  assert.match(detail, /min-h-11/);
  assert.match(detail, /focus-visible:ring-\[var\(--color-text\)\]/);
  assert.doesNotMatch(
    catalog,
    /racket-visual-customizer|<RacketVisualCustomizer/,
  );
});
