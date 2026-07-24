import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { legacyRacketDestination } from "../src/app/racket/[id]/page";
import {
  STRING_OFFER_KEYS,
  STRING_TENSION_METHODOLOGY,
  stringProducts,
  type StringOfferKey,
} from "../src/data/strings";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("string catalog uses stable unique keys and official HTTP(S) sources", () => {
  const legacyOfferKeys: StringOfferKey[] = [
    "string:luxilon-alu-power-125",
    "string:babolat-rpm-blast-12m",
    "string:yonex-polytour-pro",
    "string:tecnifibre-x-one-biphase-12m",
  ];
  assert.equal(stringProducts.length, 24);
  assert.ok(legacyOfferKeys.every((key) => STRING_OFFER_KEYS.includes(key)));
  assert.equal(new Set(STRING_OFFER_KEYS).size, stringProducts.length);
  assert.equal(new Set(stringProducts.map((product) => product.sourceUrl)).size, stringProducts.length);
  for (const product of stringProducts) {
    assert.match(product.offerKey, /^string:[a-z0-9-]+$/);
    assert.match(product.sourceUrl, /^https:\/\//);
  }
});

test("legacy mock racket routes resolve to canonical destinations or a safe search", () => {
  assert.equal(
    legacyRacketDestination("blade-98-v8"),
    "/rackets/wilson-blade-98-16x19-v9-2024",
  );
  assert.equal(legacyRacketDestination("gravity-mp"), "/rackets/head-gravity-mp-2025");
  assert.equal(legacyRacketDestination("vcore-98"), "/rackets/yonex-vcore-98-2026");

  const generic = new URL(legacyRacketDestination("Unknown & Racket"), "https://example.com");
  assert.equal(generic.pathname, "/rackets");
  assert.equal(generic.searchParams.get("q"), "Unknown & Racket");

  const legacyPage = read("src/app/racket/[id]/page.tsx");
  assert.doesNotMatch(legacyPage, /MOCK_RECOMMENDATIONS|RadarChart|AxisBar/);
  assert.match(legacyPage, /permanentRedirect\(legacyRacketDestination\(id\)\)/);
});

test("commercial strings and recovery routes are linked from every required surface", () => {
  for (const path of [
    "src/components/global-nav.tsx",
    "src/components/footer.tsx",
    "src/components/mobile-tab-bar.tsx",
    "src/components/string-guide.tsx",
    "src/app/guide/strings/page.tsx",
    "src/app/rackets/[slug]/page.tsx",
  ]) {
    assert.match(read(path), /["`]\/strings["`]/, `${path} should link to /strings`);
  }

  const stringsPage = read("src/app/strings/page.tsx");
  assert.match(stringsPage, /getActiveOffersForProductKeys/);
  assert.doesNotMatch(stringsPage, /stringProducts\.map\(async/);
  assert.match(stringsPage, /href=\{`\/go\/\$\{offer\.id\}`\}/);
  assert.match(stringsPage, /판매처 준비 중/);
  assert.match(stringsPage, /판매처 조회 일시 중단/);
  assert.match(stringsPage, /제휴 링크/);
  assert.match(stringsPage, /라켓 표시 범위/);
  assert.match(stringsPage, /편집 궁합 기준/);
  assert.match(stringsPage, /제조사 표현/);
  assert.match(stringsPage, /장력 범위 산정 방법/);
  assert.match(stringsPage, /편집 시작 범위/);
  assert.match(stringsPage, /STRING_TENSION_METHODOLOGY/);
  assert.match(STRING_TENSION_METHODOLOGY.sourceUrl, /^https:\/\/www\.wilson\.com\//);

  const racketDetail = read("src/app/rackets/[slug]/page.tsx");
  assert.match(racketDetail, /확인 가능한 라켓 사양/);
  assert.match(racketDetail, /추천을 만들 근거가 부족합니다/);
  assert.doesNotMatch(racketDetail, /라켓의 RA·무게·헤드·패턴과 5축 성향/);

  const resultsPage = read("src/app/results/[id]/page.tsx");
  assert.match(resultsPage, /확인 가능한 라켓 사양/);
  assert.match(resultsPage, /폴리에스터 제외 필터/);
  assert.match(resultsPage, /추천을 만들 근거가 부족합니다/);
  assert.doesNotMatch(resultsPage, /편안함 우선 필터 적용/);

  assert.match(read("src/app/knowledge/page.tsx"), /knowledgeFacts\.map/);
  const notFound = read("src/app/not-found.tsx");
  assert.match(notFound, /href: "\/"/);
  assert.match(notFound, /href: "\/rackets"/);
  assert.match(notFound, /href: "\/strings"/);
});

test("admin offer entry supports string keys and revalidates the storefront", () => {
  const admin = read("src/app/admin/offers/page.tsx");
  assert.match(admin, /stringProducts\.map/);
  assert.match(admin, /list="product-keys"/);
  assert.equal(admin.match(/revalidatePath\("\/strings"\);/g)?.length, 3);
  assert.match(admin, /isSafeOfferUrl\(url\)/);
  assert.match(admin, /isAllowedOfferProductKey\(racketSlug\)/);
  assert.equal(admin.match(/await requireAdminSession\(\);/g)?.length, 3);
});
