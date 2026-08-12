import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  EXPERIENCE_MAP,
  FREQUENCY_MAP,
  PRIORITY_MAP,
} from "../src/lib/diagnosis-mappings";
import {
  buildQuickStartAnswers,
  emptyQuickStartSelection,
  isQuickStartComplete,
  QUICK_START_EXPERIENCES,
  QUICK_START_FREQUENCIES,
  QUICK_START_PRIORITIES,
  QUICK_START_STEPS,
} from "../src/lib/quick-start";

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("quick start options stay in sync with the diagnosis mappings", () => {
  // 화면 라벨이 매핑 키와 어긋나면 엔진에 원문 한국어가 그대로 넘어가 조용히 망가진다.
  for (const option of QUICK_START_EXPERIENCES) {
    assert.ok(
      EXPERIENCE_MAP[option.value],
      `경력 "${option.value}" 이(가) EXPERIENCE_MAP 에 없습니다`,
    );
  }
  for (const option of QUICK_START_FREQUENCIES) {
    assert.ok(
      FREQUENCY_MAP[option.value],
      `빈도 "${option.value}" 이(가) FREQUENCY_MAP 에 없습니다`,
    );
  }
  for (const option of QUICK_START_PRIORITIES) {
    assert.ok(
      PRIORITY_MAP[option.value],
      `우선순위 "${option.value}" 이(가) PRIORITY_MAP 에 없습니다`,
    );
  }
});

test("quick start asks exactly three questions", () => {
  assert.equal(QUICK_START_STEPS.length, 3);
});

test("every quick start option carries a plain-language hint", () => {
  const all = [
    ...QUICK_START_EXPERIENCES,
    ...QUICK_START_FREQUENCIES,
    ...QUICK_START_PRIORITIES,
  ];
  for (const option of all) {
    assert.ok(
      option.hint.trim().length > 0,
      `"${option.value}" 에 초심자용 설명이 없습니다`,
    );
  }
});

test("completion requires all three answers", () => {
  assert.equal(isQuickStartComplete(emptyQuickStartSelection), false);
  assert.equal(
    isQuickStartComplete({
      experience: "1년 미만",
      frequency: "주 1-2회 레저",
      priority: null,
    }),
    false,
  );
  assert.equal(
    isQuickStartComplete({
      experience: "1년 미만",
      frequency: "주 1-2회 레저",
      priority: "파워",
    }),
    true,
  );
});

test("quick start builds a payload the submit schema accepts", () => {
  const answers = buildQuickStartAnswers({
    experience: "1년 미만",
    frequency: "주 1-2회 레저",
    priority: "편안함 (팔 보호)",
  });

  assert.deepEqual(answers, {
    current_racket: { selection: "first_purchase" },
    play_profile: {
      experience: "less_1_year",
      frequency: "once_weekly",
    },
    priority_tradeoffs: { first: "comfort" },
    confirmation: true,
  });
});

test("incomplete quick start refuses to build a payload", () => {
  assert.throws(
    () =>
      buildQuickStartAnswers({
        experience: "1년 미만",
        frequency: null,
        priority: "파워",
      }),
    /3개 문항/,
  );
});

test("quick start page reuses the existing recommendation endpoint", () => {
  const page = read("src/app/start/page.tsx");
  assert.match(page, /["`]\/api\/diagnosis\/submit["`]/);
  assert.match(page, /results\/\$\{runId\}/);
  // 자세히 진단으로 빠져나갈 길을 남겨둔다.
  assert.match(page, /href="\/diagnosis"/);
});

test("초심자 진입점은 홈 맨 위 히어로의 주 CTA 다", () => {
  const home = read("src/app/page.tsx");
  // 히어로가 홈의 첫 섹션이고, 초심자 배너는 그 안으로 접혔다.
  assert.match(home, /<HeroCarousel/);
  assert.doesNotMatch(home, /BeginnerBanner/);

  const hero = read("src/components/hero-carousel.tsx");
  assert.match(hero, /href="\/start"/, "히어로 주 CTA 가 /start 여야 합니다");
  // 주 CTA 는 브랜드 액션 색(라임)을 쓴다. 부 CTA 와 무게가 같으면 안 된다.
  assert.match(hero, /href="\/start"[\s\S]{0,240}bg-\[var\(--color-accent\)\]/);
});

test("추천 깔때기는 하나다 — /start 가 주 경로, /recommendation 은 부 경로", () => {
  const hero = read("src/components/hero-carousel.tsx");
  const quickLinks = read("src/components/quick-links.tsx");

  // 정밀 진단은 히어로 안에 부차 링크로만 남는다.
  // `/recommendation` 은 `/diagnosis` 로 가는 307 스텁이므로 내부 링크는
  // 한 번 튀지 않고 실제 목적지를 가리킨다.
  assert.match(hero, /href="\/diagnosis"/);
  assert.doesNotMatch(hero, /href="\/recommendation"/);
  assert.match(hero, /이미 쓰는 라켓이 있나요/);

  // 퀵링크에서 추천 카드를 뺐다 — 첫 화면에 추천 버튼이 셋이었고
  // 목적지는 /start 와 /recommendation 둘로 갈렸다.
  // 주석에는 경위가 남아 있으므로 링크 배열만 본다.
  const linksBlock = quickLinks.slice(
    quickLinks.indexOf("const links"),
    quickLinks.indexOf("export function QuickLinks"),
  );
  assert.ok(linksBlock.length > 0, "quick-links 의 links 배열을 찾지 못했습니다");
  const hrefs = [...linksBlock.matchAll(/href: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ["/compare", "/guide/dna", "/guide/strings"]);
});

test("홈 h1 은 회전하지 않는 사이트의 약속이다", () => {
  const hero = read("src/components/hero-carousel.tsx");
  const h1 = hero.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  assert.ok(h1, "히어로에 h1 이 있어야 합니다");
  // 예전에는 `<h1>{racket.model}</h1>` 이라 캐러셀이 돌 때마다 h1 이 바뀌었다.
  assert.doesNotMatch(h1[1], /\{racket\./, "h1 에 라켓 데이터가 들어가면 안 됩니다");
  assert.match(h1[1], /라켓을 읽습니다/);
  // 라켓 이름은 h2 로 내려간다.
  assert.match(hero, /<h2[^>]*>\{racket\.model\}<\/h2>/);
});

test("primary navigation stays at five items and leads with 추천", () => {
  const nav = read("src/components/global-nav.tsx");
  const block = nav.slice(nav.indexOf("const links = ["));
  const hrefs = [...block.slice(0, block.indexOf("];")).matchAll(/href: "([^"]+)"/g)]
    .map((match) => match[1]);

  // 상단 "추천"도 홈 히어로와 같은 /start 로 보낸다. 예전에는 여기만
  // /recommendation 이라 큰 버튼과 상단 메뉴가 다른 진단으로 갈렸다.
  assert.deepEqual(hrefs, [
    "/start",
    "/rackets",
    "/strings",
    "/compare",
    "/guide",
  ]);

  // 뉴스·About은 상단에서 내리고 푸터가 계속 책임진다.
  assert.doesNotMatch(block.slice(0, block.indexOf("];")), /\/updates|\/about/);
  const footer = read("src/components/footer.tsx");
  assert.match(footer, /["`]\/updates["`]/);
  assert.match(footer, /["`]\/about["`]/);
});
