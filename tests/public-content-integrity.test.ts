import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { featuredRackets } from "../src/data/featured-rackets";
import { playerThumbnailUrl } from "../src/lib/player-images";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("featured product image and manufacturer specification sources are distinct", () => {
  for (const racket of featuredRackets) {
    assert.match(racket.imageSourceUrl, /tennis-warehouse\.com/);
    assert.match(racket.specSourceUrl, /(babolat\.com|head\.com|yonex\.com)/);
  }
});

test("player cards request a small Commons thumbnail", () => {
  const original = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/File.jpg/960px-File.jpg";
  assert.equal(playerThumbnailUrl(original), "https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/File.jpg/240px-File.jpg");
});

test("recommendation detail links use canonical racket pages instead of deleted mock pages", () => {
  const card = read("src/components/recommendation-card.tsx");
  assert.doesNotMatch(card, /href=\{`\/racket\/\$\{recommendationResultId\}`\}/);
  assert.match(card, /href=\{`\/rackets\/\$\{racketSlug\}`\}/);
});

test("public partner page does not publish placeholder stores or fake reservations", () => {
  const partners = read("src/app/partners/page.tsx");
  assert.doesNotMatch(partners, /MOCK_PARTNERS|역삼동 123-4|시타 예약하기/);
  assert.match(partners, /제휴 매장 준비 중/);
});

test("medical and string copy stays non-diagnostic", () => {
  const copy = [
    read("src/modules/recommendation/engine.ts"),
    read("src/modules/recommendation/explanation-templates.ts"),
    read("src/app/rackets/[slug]/page.tsx"),
    read("src/app/results/[id]/page.tsx"),
  ].join("\n");
  assert.doesNotMatch(copy, /팔꿈치 통증 완화|손목 부담이 적은 구조|팔 보호|부담 최소화/);
  assert.match(copy, /전문가|전문점/);
});

test("official 2026 catalog values keep an explicit unstrung basis", () => {
  const catalog = read("scripts/modernize-catalog.ts");
  assert.match(catalog, /Speed Pro 2026[^\n]+pattern: "18x20"[^\n]+balance: 310[^\n]+beam: "23"/);
  assert.match(catalog, /Speed MP L 2026[^\n]+weight: 285[^\n]+balance: 325[^\n]+beam: "23"/);
  assert.match(catalog, /Pure Aero 2026[^\n]+stiffness: 69[^\n]+swingWeight: 290[^\n]+balance: 321/);
  assert.match(catalog, /Pure Aero 98 2026[^\n]+pattern: "16x20"[^\n]+stiffness: 71[^\n]+swingWeight: 295/);
  assert.match(catalog, /measurementBasis: "unstrung"/);
});

