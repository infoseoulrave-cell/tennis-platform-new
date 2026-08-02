import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { GLOSSARY, findGlossaryEntry } from "../src/data/glossary";
import {
  describePublicAxisScore,
  formatPublicAxisScoreWithWord,
} from "../src/lib/score-display";

const root = join(import.meta.dirname, "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

test("glossary ids are unique and usable as URL anchors", () => {
  const ids = GLOSSARY.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) {
    assert.match(id, /^[a-z0-9-]+$/);
  }
});

test("every glossary entry carries a short line and a detailed body", () => {
  assert.ok(GLOSSARY.length >= 6);
  for (const entry of GLOSSARY) {
    assert.ok(entry.term.length > 0, `${entry.id} has no term`);
    assert.ok(entry.short.length > 0, `${entry.id} has no short line`);
    assert.ok(entry.detail.length >= 2, `${entry.id} needs a real body`);
    for (const paragraph of entry.detail) {
      assert.ok(paragraph.trim().length > 0);
    }
  }
});

test("the six terms the beginner spec names are all covered", () => {
  for (const id of [
    "swingweight",
    "stiffness-ra",
    "balance",
    "string-pattern",
    "five-axes",
    "unstrung",
  ]) {
    assert.ok(findGlossaryEntry(id), `missing glossary entry: ${id}`);
  }
});

test("glossary copy stays descriptive rather than diagnostic", () => {
  // 통증·부상을 진단하거나 예방을 주장하는 문구는 신뢰를 깎고 사실도 아니다.
  const copy = GLOSSARY.flatMap((entry) => [entry.short, ...entry.detail]).join(
    "\n",
  );
  assert.doesNotMatch(copy, /부상|통증|치료|예방|의학|진단/);
});

test("Term renders inline glossary help and links into the dictionary", () => {
  const term = read("src/components/term.tsx");
  assert.match(term, /"use client"/);
  assert.match(term, /aria-expanded=\{open\}/);
  assert.match(term, /aria-controls=\{panelId\}/);
  assert.match(term, /event\.key !== "Escape"/);
  assert.match(term, /guide\/terms#\$\{entry\.id\}/);
  // 모르는 용어가 오면 설명을 지어내지 않고 글자만 남긴다.
  assert.match(term, /if \(!entry\) return/);
});

test("the glossary page renders every entry with a matching anchor", () => {
  const page = read("src/app/guide/terms/page.tsx");
  assert.match(page, /GLOSSARY\.map/);
  assert.match(page, /id=\{entry\.id\}/);
  assert.match(page, /scroll-mt-/);
  // 가이드 허브에서 도달할 수 있어야 한다.
  assert.match(read("src/app/guide/page.tsx"), /href: "\/guide\/terms"/);
});

test("racket detail attaches glossary help to the jargon spec rows", () => {
  const detail = read("src/app/rackets/[slug]/page.tsx");
  for (const termId of [
    "string-pattern",
    "stiffness-ra",
    "balance",
    "swingweight",
  ]) {
    assert.match(detail, new RegExp(`termId="${termId}"`));
  }
  assert.match(detail, /<Term id="five-axes">/);
});

test("axis score words pair a number with plain language", () => {
  assert.equal(describePublicAxisScore(0), "매우 낮음");
  assert.equal(describePublicAxisScore(3), "보통");
  assert.equal(describePublicAxisScore(5), "매우 높음");
  // 범위를 벗어난 값도 양 끝으로 접어 넣는다.
  assert.equal(describePublicAxisScore(-4), "매우 낮음");
  assert.equal(describePublicAxisScore(99), "매우 높음");
  assert.equal(describePublicAxisScore(Number.NaN), "매우 낮음");
});

test("the combined score format is the spec's `3/5 · 보통`", () => {
  assert.equal(formatPublicAxisScoreWithWord(3), "3/5 · 보통");
  assert.equal(formatPublicAxisScoreWithWord(5), "5/5 · 매우 높음");
  // 소수점은 공개 표기에 절대 나오지 않는다.
  assert.doesNotMatch(formatPublicAxisScoreWithWord(3), /\d\.\d/);
});

test("every surface that shows a bare axis score also shows the word", () => {
  for (const [file, pattern] of [
    ["src/components/axis-bars.tsx", /· \{describePublicAxisScore\(score\)\}/],
    [
      "src/app/compare/page.tsx",
      /describePublicAxisScore\(r\.scores\[axis\]\)/,
    ],
    ["src/app/guide/dna/page.tsx", /formatPublicAxisScoreWithWord\(value\)/],
  ] as const) {
    assert.match(read(file), pattern, `${file} lost its score word`);
  }
});
