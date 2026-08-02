import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  resolveRacketCustomizerRoute,
  type RacketCustomizerCandidate,
} from "../src/lib/racket-customizer-route";

const gravity: RacketCustomizerCandidate = {
  slug: "head-gravity-mp-2025",
  headSize: '100"',
  pattern: "16x20",
};

test("a racket with head size and string pattern resolves ready", async () => {
  const result = await resolveRacketCustomizerRoute(gravity.slug, async (slug) => {
    assert.equal(slug, "head-gravity-mp-2025");
    return gravity;
  });

  assert.equal(result.kind, "ready");
  if (result.kind !== "ready") return;
  assert.equal(result.racket, gravity);
  // 스펙이 곧 그림이다 — 16x20 이면 메인 16 · 크로스 20.
  assert.equal(result.geometry.mains.length, 16);
  assert.equal(result.geometry.crosses.length, 20);
});

test("database aliases redirect to the supported canonical route", async () => {
  const result = await resolveRacketCustomizerRoute(
    "gravity-mp",
    async () => gravity,
  );

  assert.deepEqual(result, {
    kind: "redirect",
    location: "/customizer/head-gravity-mp-2025",
  });
});

test("missing rackets or incomplete specs resolve not-found", async () => {
  const scenarios: Array<{
    label: string;
    racket: RacketCustomizerCandidate | null;
  }> = [
    { label: "missing racket", racket: null },
    {
      label: "missing head size",
      racket: { ...gravity, headSize: null },
    },
    {
      label: "missing string pattern",
      racket: { ...gravity, pattern: null },
    },
    {
      label: "unparseable specs",
      racket: { ...gravity, headSize: "정보 없음", pattern: "정보 없음" },
    },
  ];

  for (const { label, racket } of scenarios) {
    const result = await resolveRacketCustomizerRoute(
      label,
      async () => racket,
    );
    assert.deepEqual(result, { kind: "not-found" }, label);
  }
});

test("a product photo is no longer required to open the customizer", async () => {
  // 예전 게이트는 사진 URL의 제품 코드와 픽셀 크기까지 일치해야 열렸고,
  // 그래서 운영에서는 사실상 어떤 라켓도 커스터마이저에 들어가지 못했다.
  const result = await resolveRacketCustomizerRoute(
    gravity.slug,
    async () => gravity,
  );
  assert.equal(result.kind, "ready");
});

test("the detail-page CTA sits outside the product-photo branch", () => {
  // 라우트는 사진 의존을 없앴는데 CTA가 `racket.imageUrl ? (...)` 안에 남아 있어,
  // 스펙이 멀쩡한데 사진만 없는 라켓은 상세에서 커스터마이저로 갈 수 없었다.
  const detail = readFileSync(
    join(import.meta.dirname, "..", "src/app/rackets/[slug]/page.tsx"),
    "utf8",
  );

  const fallbackAt = detail.indexOf("검증된 제품 이미지 준비 중");
  const ctaAt = detail.indexOf("racketCustomizerPath(racket.slug)");

  assert.ok(fallbackAt > 0, "photo fallback branch is missing");
  assert.ok(ctaAt > 0, "customizer CTA is missing");
  assert.ok(
    ctaAt > fallbackAt,
    "CTA must render after the photo ternary closes, not inside it",
  );

  // 진입 조건은 사진이 아니라 스펙에서 나온 도식이어야 한다.
  assert.match(detail, /const customizerProfile = schematicFromSpec\(racket\)/);
});

test("loader failures propagate to the route error boundary", async () => {
  const failure = new Error("database unavailable");

  await assert.rejects(
    () =>
      resolveRacketCustomizerRoute("head-gravity-mp-2025", async () => {
        throw failure;
      }),
    (error) => error === failure,
  );
});
