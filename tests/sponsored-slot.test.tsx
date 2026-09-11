import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { SponsoredBadge } from "../src/components/sponsored-badge";
import { featuredRackets, hydrateFeaturedRackets } from "../src/data/featured-rackets";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("기본 히어로 라켓은 어느 것도 광고가 아니다", () => {
  assert.ok(featuredRackets.length > 0);
  for (const racket of featuredRackets) {
    assert.equal(racket.sponsored, undefined, racket.slug);
  }
  // hydrate 가 sponsored 를 지우거나 만들어내지 않는다
  for (const racket of hydrateFeaturedRackets([])) {
    assert.equal(racket.sponsored, undefined);
  }
});

test("광고 배지는 '광고' 텍스트와 식별 속성을 가진다", () => {
  const html = renderToStaticMarkup(<SponsoredBadge on="dark" />);
  assert.match(html, /data-sponsored-badge=""/);
  assert.match(html, />광고</);
  assert.match(html, /text-white\/80/);
  const light = renderToStaticMarkup(<SponsoredBadge />);
  assert.match(light, /--color-text-secondary/);
});

test("히어로는 sponsored 가 있을 때만 배지·고지·이벤트를 그린다", () => {
  const hero = read("src/components/hero-carousel.tsx");
  assert.match(hero, /\{racket\.sponsored && <SponsoredBadge on="dark" \/>\}/);
  assert.match(hero, /racket\.sponsored\.disclosure/);
  assert.match(hero, /if \(!racket\?\.sponsored\) return;\s*trackEvent\("sponsor_impression"/);
  assert.match(hero, /if \(!racket\.sponsored\) return;\s*trackEvent\("sponsor_click"/);
  // 자연 노출 슬라이드에는 어떤 광고 문자열도 렌더되지 않는다
  assert.doesNotMatch(hero, /<SponsoredBadge(?![^>]*\/>\})/);
});

test("스폰서 이벤트는 분류표와 수집 API 양쪽에 등록돼 있다", () => {
  const taxonomy = read("src/events/taxonomy.ts");
  const eventsRoute = read("src/app/api/events/route.ts");
  for (const name of ["sponsor_impression", "sponsor_click"]) {
    assert.match(taxonomy, new RegExp(`"${name}"`), name);
    assert.match(eventsRoute, new RegExp(`"${name}",`), name);
  }
  assert.match(taxonomy, /sponsor_impression: \{ slug: string; label: string; placement: string \}/);
});
