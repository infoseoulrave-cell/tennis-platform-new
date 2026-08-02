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

test("home surfaces a beginner entry point above everything else", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /<BeginnerBanner \/>/);
  assert.ok(
    home.indexOf("<BeginnerBanner />") < home.indexOf("<HeroCarousel"),
    "초심자 배너가 히어로보다 위에 있어야 합니다",
  );

  const banner = read("src/components/beginner-banner.tsx");
  assert.match(banner, /href="\/start"/);
});

test("primary navigation stays at five items and leads with 추천", () => {
  const nav = read("src/components/global-nav.tsx");
  const block = nav.slice(nav.indexOf("const links = ["));
  const hrefs = [...block.slice(0, block.indexOf("];")).matchAll(/href: "([^"]+)"/g)]
    .map((match) => match[1]);

  assert.deepEqual(hrefs, [
    "/recommendation",
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
