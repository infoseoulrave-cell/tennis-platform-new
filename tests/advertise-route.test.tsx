import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import AdvertisePage, { metadata } from "../src/app/advertise/page";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("/advertise describes supply, referral and sponsorship stages with a brand intake form", () => {
  const html = renderToStaticMarkup(<AdvertisePage />);
  assert.equal(metadata.title, "테니스 브랜드 협업·스폰서십");
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
  for (const stage of ["상품 정보·구매처 연결", "확인된 판매에 따른 제휴", "컬렉션 협업·스폰서십"]) {
    assert.ok(html.includes(stage), stage);
  }
  assert.match(html, /href="\/partners"/);
  assert.match(html, /href="\/business"/);
  // The previous unvalidated traffic-supply package is no longer a default offer.
  assert.doesNotMatch(html, /250만 원|KRW 2,500,000/);
  assert.match(html, /<option value="brand" selected="">/);
  assert.match(html, /name="categories"/);
  assert.match(html, /name="website"/);
});

test("/advertise 에는 이용자 수치를 적지 않는다", () => {
  const html = renderToStaticMarkup(<AdvertisePage />);
  const text = html.replace(/<[^>]+>/g, " ");
  assert.doesNotMatch(text, /\d[\d,.]*\s*(명|회|뷰|방문|MAU|DAU|PV|UV)\b/);
  assert.doesNotMatch(text, /\d[\d,.]*\s*(만|천)\s*(명|회|뷰)/);
});

test("브랜드 제휴 페이지는 푸터와 매장 입점 문의에서 연결된다", () => {
  assert.match(read("src/components/footer.tsx"), /href: "\/advertise"/);
  assert.match(read("src/app/partners/page.tsx"), /href="\/advertise"/);
  const form = read("src/components/partner-inquiry-form.tsx");
  assert.match(form, /defaultValue=\{defaultType\}/);
  assert.match(form, /source,/);
});

test("루트 레이아웃은 Vercel Analytics 와 Speed Insights 를 붙인다", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /from "@vercel\/analytics\/next"/);
  assert.match(layout, /from "@vercel\/speed-insights\/next"/);
  assert.match(layout, /<Analytics \/>/);
  assert.match(layout, /<SpeedInsights \/>/);
});
