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

test("public score UI consistently documents and formats the 10-15 scale", () => {
  const scoreDisplay = read("src/lib/score-display.ts");
  const queries = read("src/lib/queries.ts");
  const radar = read("src/components/radar-chart.tsx");
  const bars = read("src/components/axis-bars.tsx");
  const card = read("src/components/racket-card.tsx");
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const guide = read("src/app/guide/dna/page.tsx");
  const methodology = read("src/components/scoring-methodology-note.tsx");
  const publicScoreCopy = [guide, methodology].join("\n");

  assert.match(scoreDisplay, /export type PublicScores15/);
  assert.match(scoreDisplay, /PUBLIC_SCORE_MIN \+ clampedRaw \/ 20/);
  assert.match(scoreDisplay, /toFixed\(1\)\}\/15/);
  assert.match(queries, /rawScoreToPublicScore\(value\)/);
  assert.match(radar, /publicScoreToFraction/);
  assert.match(bars, /publicScoreToPercent/);
  assert.match(card, /formatPublicScore\(score\)/);
  assert.doesNotMatch(publicScoreCopy, /-5\s*~\s*\+5|−5|\+5/);
  assert.match(detail, /scores\.spin >= 14/);
  assert.match(detail, /scores\.comfort >= 13\.5/);
  assert.match(detail, /scores\.comfort <= 11\.5/);
});

test("public five-axis copy matches the official v3 proxy definitions and labels", () => {
  const guide = read("src/app/guide/dna/page.tsx");
  const about = read("src/app/about/page.tsx");
  const scoringCore = read("src/modules/recommendation/scoring-core.ts");

  assert.deepEqual(
    [...guide.matchAll(/labelKo: "([^"]+)"/g)].map((match) => match[1]),
    ["파워", "컨트롤", "스핀", "편안함", "안정성"],
  );
  assert.match(about, /파워·컨트롤·스핀·편안함·안정성/);
  assert.doesNotMatch([guide, about].join("\n"), /직구력|충격흡수|안정감/);

  for (const phrase of [
    "스윙웨이트(SW)를 중심으로 강성(RA), 헤드 크기, 빔 두께",
    "작은 헤드, 높은 스트링 밀도, 얇은 빔, 낮은 강성(RA)",
    "낮은 스트링 밀도와 큰 헤드, 같은 노력에서 낮은 스윙웨이트(SW)",
    "낮은 강성(RA)을 중심으로 스윙웨이트(SW)와 정적 무게",
    "스윙웨이트(SW)와 정적 무게를 조합한 안정성 추정치",
    "프록시와 추정치",
    "플레이어의 기술과",
    "스트링 종류와 장력",
    "실측 편차",
  ]) {
    assert.match(guide, new RegExp(phrase.replace(/[()]/g, "\\$&")));
  }

  assert.doesNotMatch(
    guide,
    /밸런스|길이|재질|프레임 형상|피벗|트위스트|비틀림 강성|추천 스트링 조합/,
  );
  for (const formula of [
    "0.55*SW + 0.20*RA + 0.15*head + 0.10*beam",
    "0.35*inverse(head) + 0.35*density + 0.15*inverse(beam) + 0.15*inverse(RA)",
    "0.55*inverse(density) + 0.25*head + 0.20*inverse(SW)",
    "0.60*inverse(RA) + 0.25*SW + 0.15*weight",
    "0.55*SW + 0.45*weight",
  ]) {
    assert.ok(scoringCore.includes(`scoringFormula: "${formula}"`));
  }
});

test("opaque retailer racket photos sit on pure-white media frames", () => {
  const card = read("src/components/racket-card.tsx");
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const compare = read("src/app/compare/page.tsx");

  assert.match(card, /aspect-\[4\/3\] bg-white/);
  assert.match(detail, /aspect-square bg-white/);
  assert.match(compare, /aspect-square bg-white/);
});

test("methodology names the evidence basis and its limits", () => {
  const methodology = read("src/components/scoring-methodology-note.tsx");
  const guide = read("src/app/guide/dna/page.tsx");

  for (const phrase of [
    "스펙 기반 비교 추정치",
    "10~15",
    "비스트링(unstrung)",
    "스트링 장착(strung)",
    "스윙웨이트(SW)·강성(RA)",
    "제조 품질 관리(QC)",
    "절대적인 품질 등급",
    "의료·부상 안전 지표",
  ]) {
    assert.match(methodology, new RegExp(phrase.replace(/[()]/g, "\\$&")));
  }
  assert.match(methodology, /racquetanalyzerTWU\.php\?brand=Wilson/);
  assert.match(methodology, /equipment-rackets\.pdf/);
  assert.match(methodology, /제조사와 별개의 리테일러/);
  assert.match(guide, /제조사와 별개의 리테일러/);
  assert.doesNotMatch([methodology, guide].join("\n"), /독립 기관/);
});

test("catalog copy reflects the current 39-model set", () => {
  const rackets = read("src/app/rackets/page.tsx");
  const diagnosis = read("src/app/diagnosis/page.tsx");

  assert.match(rackets, /현재 카탈로그 39종/);
  assert.match(diagnosis, /현재 카탈로그 39종/);
  assert.doesNotMatch([rackets, diagnosis].join("\n"), /80개 이상/);
});

test("racket detail exposes separate static and measured provenance without a latest-source claim", () => {
  const detail = read("src/app/rackets/[slug]/page.tsx");

  assert.match(detail, /racket\.specSources/);
  assert.match(detail, /정적 스펙 · 제조사 비스트링/);
  assert.match(detail, /SW\/RA 측정 · 스트링 장착/);
  assert.match(detail, /검증 \{source\.capturedAt\.slice/);
  assert.match(detail, /target="_blank"/);
  assert.doesNotMatch(detail, /최근 검증 출처/);
});

