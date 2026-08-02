import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  parseCoordinate,
  shopAttributionTag,
} from "../src/app/admin/shops/page";

const root = join(import.meta.dirname, "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

test("shopAttributionTag 는 상호를 안전한 태그로 만든다", () => {
  assert.equal(shopAttributionTag("Seoul Tennis Pro"), "shop-seoul-tennis-pro");
  assert.equal(shopAttributionTag("강남 테니스"), "shop-강남-테니스");
  assert.equal(shopAttributionTag("!!!"), "shop-unnamed");
});

test("parseCoordinate 는 범위 밖과 비숫자를 거른다", () => {
  assert.equal(parseCoordinate("37.5", -90, 90), "37.5");
  assert.equal(parseCoordinate("91", -90, 90), null);
  assert.equal(parseCoordinate("abc", -90, 90), null);
  assert.equal(parseCoordinate(null, -90, 90), null);
  assert.equal(parseCoordinate("", -90, 90), null);
});

test("매장 소개 동선이 필요한 표면에 전부 연결돼 있다", () => {
  // 푸터 → 디렉토리와 입점 문의
  const footer = read("src/components/footer.tsx");
  assert.match(footer, /href: "\/shops"/);
  assert.match(footer, /href: "\/partners"/);

  // 라켓 상세 → 취급 매장 섹션
  const detail = read("src/app/rackets/[slug]/page.tsx");
  assert.match(detail, /<ShopList racketModelId=\{racket\.id\} \/>/);

  // admin 인덱스 → 매장 관리
  const admin = read("src/app/admin/page.tsx");
  assert.match(admin, /href="\/admin\/shops"/);
});

test("매장 연락 클릭 리드 타입이 API 스키마에 등록돼 있다", () => {
  const route = read("src/app/api/partners/lead/route.ts");
  assert.match(route, /"shop_contact_click"/);
  const link = read("src/components/shop-contact-link.tsx");
  assert.match(link, /shop_contact_click/);
});

test("공개 매장 화면은 fail-closed 다 — 빈 목록이면 렌더하지 않거나 준비 중을 보여준다", () => {
  const shopList = read("src/components/shop-list.tsx");
  assert.match(shopList, /if \(shops\.length === 0\) return null;/);
  assert.match(shopList, /\.catch\(\(\) => \[\]\)/);

  const shopsPage = read("src/app/shops/page.tsx");
  assert.match(shopsPage, /등록 매장 준비 중/);
  assert.match(shopsPage, /\.catch\(\(\) => \[\]\)/);
});

test("admin 등록은 비활성으로 시작한다", () => {
  const adminShops = read("src/app/admin/shops/page.tsx");
  assert.match(adminShops, /active: false/);
});
