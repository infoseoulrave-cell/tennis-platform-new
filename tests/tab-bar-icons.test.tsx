import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { TAB_ITEMS, isTabActive } from "../src/components/mobile-tab-bar";
import { TabIcon, type TabIconName } from "../src/components/tab-icons";

Object.assign(globalThis, { React });

const NAMES: TabIconName[] = ["home", "racket", "strings", "compare", "wishlist"];
// 이모지·기호 글리프를 아이콘으로 쓰면 플랫폼마다 다르게 그려지고 무게가 제각각이다.
const GLYPH_ICONS = /[\u{1F300}-\u{1FAFF}\u{2190}-\u{21FF}\u{2600}-\u{27BF}]/u;

function render(name: TabIconName, active: boolean): string {
  return renderToStaticMarkup(React.createElement(TabIcon, { name, active }));
}

test("탭 아이콘은 전부 24 그리드 SVG 이고 스크린리더에서 숨는다", () => {
  for (const name of NAMES) {
    const html = render(name, false);
    assert.match(html, /<svg /, name);
    assert.match(html, /viewBox="0 0 24 24"/, name);
    assert.match(html, /aria-hidden="true"/, name);
    assert.match(html, new RegExp(`data-tab-icon="${name}"`), name);
  }
});

test("색은 전부 currentColor 라 부모 text 색이 켜짐/꺼짐을 정한다", () => {
  for (const name of NAMES) {
    const html = render(name, true);
    assert.match(html, /stroke="currentColor"/, name);
    // 하드코딩된 hex 색이 섞이면 다크·포커스 상태에서 따로 논다.
    assert.doesNotMatch(html, /(?:stroke|fill)="#/, name);
  }
});

test("몸통이 있는 글리프는 켜질 때 면으로 차고 꺼지면 비어 있다", () => {
  for (const name of NAMES) {
    assert.match(render(name, true), /fill="currentColor"/, `${name} on`);
    assert.doesNotMatch(render(name, false), /fill="currentColor"/, `${name} off`);
  }
});

test("가닥이 있는 글리프는 켜질 때 면 위로 뚫려 나온다", () => {
  for (const name of ["racket", "strings"] as const) {
    assert.match(render(name, true), /stroke="var\(--color-bg-white\)"/, name);
    assert.doesNotMatch(render(name, false), /var\(--color-bg-white\)/, name);
  }
});

test("찾기는 후프·베드·스로트·손잡이를 다 갖춘다", () => {
  // 빈 후프는 stroke 1.75 가 스로트 구멍을 메워 23px 에서 막대사탕으로 읽힌다.
  // 베드가 있어야 라켓이 되고, 스로트 두 가닥은 한 점에서 만나야 한다.
  const html = render("racket", false);
  assert.match(html, /<ellipse/);
  assert.match(html, /M12 3\.4v10\.4/); // 메인
  assert.match(html, /M7 8\.6h10/); // 크로스
  assert.match(html, /M9\.3 14\.2 12 17\.8M14\.7 14\.2 12 17\.8M12 17\.8v3\.6/);
});

test("찾기와 스트링은 실루엣이 겹치지 않는다", () => {
  // 한 줄에 나란히 서므로 둘 다 후프를 쓰면 23px 에서 구분되지 않는다.
  assert.match(render("racket", false), /<ellipse/);
  assert.doesNotMatch(render("strings", false), /<ellipse/);
  assert.match(render("strings", false), /<rect/);
});

test("탭 아이콘 소스에 이모지 글리프가 남아 있지 않다", () => {
  for (const file of ["src/components/mobile-tab-bar.tsx", "src/components/tab-icons.tsx"]) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, GLYPH_ICONS, file);
  }
});

test("홈 탭은 루트에서만 켜진다", () => {
  const home = TAB_ITEMS[0];
  assert.equal(isTabActive("/", home), true);
  assert.equal(isTabActive("/rackets", home), false);
  assert.equal(isTabActive(null, home), false);
});

test("라켓 상세와 커스터마이저에서도 찾기 탭이 켜진다", () => {
  const find = TAB_ITEMS.find((tab) => tab.href === "/rackets");
  assert.ok(find);
  for (const path of ["/rackets", "/rackets/head-speed-mp-2026", "/racket/abc", "/customizer/x"]) {
    assert.equal(isTabActive(path, find), true, path);
  }
});

test("경계를 넘는 경로에는 탭이 켜지지 않는다", () => {
  const find = TAB_ITEMS.find((tab) => tab.href === "/rackets");
  const strings = TAB_ITEMS.find((tab) => tab.href === "/strings");
  assert.ok(find && strings);
  // 예전 startsWith 구현이 잘못 켜던 경로들이다.
  assert.equal(isTabActive("/racketsXXX", find), false);
  assert.equal(isTabActive("/strings-guide", strings), false);
  assert.equal(isTabActive("/guide/strings", strings), false);
});

test("어느 경로에서도 켜지는 탭은 최대 하나다", () => {
  const paths = [
    "/", "/rackets", "/rackets/x", "/racket/x", "/customizer/x",
    "/strings", "/compare", "/wishlist", "/guide", "/start", "/shops",
  ];
  for (const path of paths) {
    const on = TAB_ITEMS.filter((tab) => isTabActive(path, tab));
    assert.ok(on.length <= 1, `${path} → ${on.map((t) => t.label).join(",")}`);
  }
});
