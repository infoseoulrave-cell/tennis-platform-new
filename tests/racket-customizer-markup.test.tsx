import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  customizerValidationKey,
  hasCssMaskSupport,
  isCurrentImageValidation,
  RacketVisualCustomizer,
} from "../src/components/racket-visual-customizer";

const imageUrl =
  "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500";

test("customizer begins with the original photo and accessible color groups", () => {
  const html = renderToStaticMarkup(
    <RacketVisualCustomizer
      slug="head-gravity-mp-2025"
      imageUrl={imageUrl}
      alt="Head Gravity MP 2025"
    />,
  );

  assert.match(html, /HGMPG-1\.jpg&amp;nw=500/);
  assert.match(html, /Head Gravity MP 2025/);
  assert.match(html, /<section hidden=""/);
  assert.equal(html.match(/<fieldset/g)?.length, 2);
  assert.equal(html.match(/type="radio"/g)?.length, 16);

  const radioInputs =
    html.match(/<input\b[^>]*\btype="radio"[^>]*>/g) ?? [];
  const radiosPerName = new Map<string, number>();
  for (const input of radioInputs) {
    const name = input.match(/\bname="([^"]+)"/)?.[1];
    assert.ok(name);
    radiosPerName.set(name, (radiosPerName.get(name) ?? 0) + 1);
  }
  assert.equal(radiosPerName.size, 2);
  assert.deepEqual(
    [...radiosPerName.values()].sort(),
    [8, 8],
  );

  assert.match(html, /스트링 색상/);
  assert.match(html, /그립 색상/);
  assert.match(html, /형광 노랑/);
  assert.match(html, /내추럴/);
  assert.equal(html.match(/style="background-color:/g)?.length, 16);
  assert.doesNotMatch(html, /\schecked=""/);
  assert.match(html, /원본으로 초기화/);
  assert.match(html, /색상 시뮬레이션/);
  assert.match(html, /판매 재고를 의미하지 않습니다/);
  assert.equal(html.match(/aria-live="polite"/g)?.length, 1);
  assert.doesNotMatch(html, /mask-image|-webkit-mask-image/i);
});

test("invalid profiles render only the original photo stage", () => {
  const html = renderToStaticMarkup(
    <RacketVisualCustomizer
      slug="head-speed-pro-2026"
      imageUrl={imageUrl}
      alt="Original Head racket"
    />,
  );

  assert.equal(html.match(/<img/g)?.length, 1);
  assert.match(html, /HGMPG-1\.jpg&amp;nw=500/);
  assert.match(html, /Original Head racket/);
  assert.doesNotMatch(
    html,
    /<fieldset|type="radio"|색상 시뮬레이션|판매 재고|aria-live|mask-image/i,
  );
});

test("CSS mask support fails closed when the API is absent", () => {
  assert.equal(hasCssMaskSupport(undefined), false);
  assert.equal(hasCssMaskSupport(null), false);
  assert.equal(hasCssMaskSupport({}), false);
  assert.equal(
    hasCssMaskSupport({
      supports: (property) => property === "-webkit-mask-image",
    }),
    true,
  );
  assert.equal(
    hasCssMaskSupport({
      supports: () => false,
    }),
    false,
  );
  assert.equal(
    hasCssMaskSupport({
      supports: () => {
        throw new Error("unsupported");
      },
    }),
    false,
  );
});

test("image readiness requires the full validation key and current element", () => {
  const profile = {
    slug: "head-gravity-mp-2025",
    productCode: "HGMPG",
    sourceLayout: "tw-front-side-v1" as const,
    intrinsicWidth: 500,
    intrinsicHeight: 857,
    stringMaskUrl:
      "/images/racket-customizer/head-gravity-mp-2025-strings.svg",
    gripMaskUrl:
      "/images/racket-customizer/head-gravity-mp-2025-grip.svg",
  };
  const key = customizerValidationKey(profile, imageUrl);
  const validatedElement = {} as HTMLImageElement;
  const remountedElement = {} as HTMLImageElement;
  const validation = { key, element: validatedElement };

  assert.equal(
    isCurrentImageValidation(validation, key, validatedElement),
    true,
  );
  assert.equal(
    isCurrentImageValidation(validation, `${key}:stale`, validatedElement),
    false,
  );
  assert.equal(
    isCurrentImageValidation(validation, key, remountedElement),
    false,
  );
  for (const changedProfile of [
    { ...profile, slug: "head-gravity-mp-2026" },
    { ...profile, productCode: "HGMPG2" },
    { ...profile, intrinsicWidth: profile.intrinsicWidth + 1 },
    { ...profile, intrinsicHeight: profile.intrinsicHeight + 1 },
    { ...profile, stringMaskUrl: `${profile.stringMaskUrl}?stale=1` },
    { ...profile, gripMaskUrl: `${profile.gripMaskUrl}?stale=1` },
  ]) {
    assert.notEqual(
      key,
      customizerValidationKey(changedProfile, imageUrl),
    );
  }
  assert.notEqual(
    key,
    customizerValidationKey(profile, `${imageUrl}&variant=stale`),
  );
});
