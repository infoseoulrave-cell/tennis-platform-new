import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import AdvertisePage, { metadata } from "../src/app/advertise/page";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("/advertise 는 원칙 3개·지면 4종·무상 데이터 파트너십·브랜드 기본 문의 폼을 렌더한다", () => {
  const html = renderToStaticMarkup(<AdvertisePage />);

  assert.equal(metadata.title, "브랜드 제휴·광고 안내");
  assert.match(html, /<h1[^>]*>브랜드 제휴·광고 안내<\/h1>/);

  for (const principle of ["점수와 순위는 팔지 않습니다", "모든 유료 노출에는 &#x27;광고&#x27;를 붙입니다", "스펙 출처를 공개합니다"]) {
    assert.match(html, new RegExp(principle), principle);
  }
  for (const placement of ["홈 히어로 포스터 슬롯", "신제품 런칭 페이지", "함께 보면 좋은 라켓", "스트링 가이드 스폰서"]) {
    assert.match(html, new RegExp(placement), placement);
  }
  assert.match(html, /<table/);
  assert.match(html, /overflow-x-auto/);
  assert.match(html, /데이터 파트너십 \(무상\)/);
  assert.match(html, /시타 라켓 대여/);
  assert.match(html, /href="\/partners"/);
  assert.match(html, /월간 이용 데이터는 문의 시 최신 수치로 공유합니다/);

  // 브랜드가 기본 선택된 문의 폼 (허니팟 포함)
  assert.match(html, /<option value="brand" selected="">/);
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
