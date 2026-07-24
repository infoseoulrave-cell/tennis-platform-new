# Racket Color Customizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, fail-closed color simulator to all 54 canonical racket detail pages so users can preview eight string colors and eight grip colors on each verified product photo.

**Architecture:** Keep the verified remote product photo unchanged and place two slug-specific SVG alpha masks over it inside a small Client Component. A deterministic generator converts per-racket calibrated geometry into 108 mask assets and a 54-entry runtime profile registry; product-code and intrinsic-dimension checks hide the simulator when a photo no longer matches its mask.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9, Tailwind CSS 4, Node test runner, TSX scripts, SVG/CSS masks.

## Global Constraints

- Work only in the canonical `tennis-platform-new` workspace and canonical Preview target.
- Do not modify, alias, deploy, or otherwise target `racketlab-omega.vercel.app`.
- Do not push `main` or create a Production deployment during implementation.
- Do not change Supabase, the DB schema, catalog rows, scoring, string recommendations, offers, or admin routes.
- Preserve the existing verified Tennis Warehouse photo and exact-product allowlist.
- Provide exactly eight string colors and eight grip colors from the approved design.
- Treat the result as a visual simulation, not inventory or a purchasable configuration.
- Initial state is the unmodified product photo; reset removes both overlays.
- A missing, stale, or mismatched profile must fail closed to the original photo.
- Use test-driven development: run every new behavior test red before adding production code.
- Keep all visible Korean copy UTF-8 and preserve the Omega-derived visual language in `.impeccable.md`.
- No new runtime or development dependencies.

---

## File Structure

### Runtime files

- Create `src/data/racket-customizer.ts`: approved palettes, public types, state reducer, and constants.
- Create `src/data/racket-customizer-profiles.generated.ts`: deterministic generated 54-entry profile registry.
- Create `src/lib/racket-customizer.ts`: image product-code parsing and fail-closed profile resolution.
- Create `src/components/racket-visual-customizer.tsx`: image stage, overlays, radio groups, reset, and fallback behavior.
- Modify `src/app/rackets/[slug]/page.tsx`: replace only the current image block with the new component.

### Build-time mask files

- Create `scripts/racket-customizer-mask-geometry.ts`: reviewed per-slug canvas, string-bed, and grip geometry.
- Create `scripts/lib/racket-customizer-mask-builder.ts`: pure deterministic SVG/profile builders.
- Create `scripts/generate-racket-customizer-masks.ts`: validates geometry and writes masks plus the generated runtime registry.
- Create `public/images/racket-customizer/<slug>-strings.svg`: 54 generated string masks.
- Create `public/images/racket-customizer/<slug>-grip.svg`: 54 generated grip masks.
- Modify `package.json`: add `customizer:masks`.

### Tests and records

- Create `tests/racket-customizer-data.test.ts`: palette and state contract.
- Create `tests/racket-customizer-mask-builder.test.ts`: deterministic SVG generation and safety.
- Create `tests/racket-customizer-profile.test.ts`: product-code and photo-dimension fail-closed behavior.
- Create `tests/racket-customizer-markup.test.tsx`: accessible initial markup and copy.
- Create `tests/racket-customizer-coverage.test.ts`: exact 54-slug and 108-asset coverage.
- Modify `tests/performance-structure.test.ts`: keep the customizer a detail-only client island.
- Modify `DEVLOG.md`: record the implementation, verification, Preview URL, and Production/Omega non-actions.

---

### Task 1: Lock the Palette and State Contract

**Files:**
- Create: `src/data/racket-customizer.ts`
- Create: `tests/racket-customizer-data.test.ts`

**Interfaces:**
- Produces: `STRING_COLOR_OPTIONS`, `GRIP_COLOR_OPTIONS`
- Produces: `StringColorId`, `GripColorId`, `CustomizerState`, `CustomizerAction`
- Produces: `initialCustomizerState` and `reduceCustomizerState(state, action)`
- Consumes: none

- [ ] **Step 1: Write the failing palette test**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  GRIP_COLOR_OPTIONS,
  STRING_COLOR_OPTIONS,
  initialCustomizerState,
  reduceCustomizerState,
} from "../src/data/racket-customizer";

test("the approved string and grip palettes expose eight stable options each", () => {
  assert.deepEqual(
    STRING_COLOR_OPTIONS.map(({ id, label }) => [id, label]),
    [
      ["black", "검정"],
      ["white", "흰색"],
      ["natural", "내추럴"],
      ["silver", "실버"],
      ["gold", "골드"],
      ["flash-yellow", "형광 노랑"],
      ["blue", "파랑"],
      ["red", "빨강"],
    ],
  );
  assert.deepEqual(
    GRIP_COLOR_OPTIONS.map(({ id, label }) => [id, label]),
    [
      ["white", "흰색"],
      ["black", "검정"],
      ["blue", "파랑"],
      ["red", "빨강"],
      ["yellow", "노랑"],
      ["green", "초록"],
      ["pink", "분홍"],
      ["purple", "보라"],
    ],
  );
  assert.equal(new Set(STRING_COLOR_OPTIONS.map(({ id }) => id)).size, 8);
  assert.equal(new Set(GRIP_COLOR_OPTIONS.map(({ id }) => id)).size, 8);
});

test("customizer state selects each layer independently and resets to original", () => {
  const withString = reduceCustomizerState(initialCustomizerState, {
    type: "select-string",
    colorId: "silver",
  });
  const withBoth = reduceCustomizerState(withString, {
    type: "select-grip",
    colorId: "blue",
  });

  assert.deepEqual(withBoth, { stringColorId: "silver", gripColorId: "blue" });
  assert.deepEqual(
    reduceCustomizerState(withBoth, { type: "reset" }),
    initialCustomizerState,
  );
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
node --import tsx --test tests/racket-customizer-data.test.ts
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/data/racket-customizer`.

- [ ] **Step 3: Implement the palette and reducer**

Create immutable color arrays with the exact IDs, labels, and HEX values from the approved design:

```ts
export const STRING_COLOR_OPTIONS = [
  { id: "black", label: "검정", hex: "#171717" },
  { id: "white", label: "흰색", hex: "#F4F2E8" },
  { id: "natural", label: "내추럴", hex: "#D9C69C" },
  { id: "silver", label: "실버", hex: "#A8ADB4" },
  { id: "gold", label: "골드", hex: "#C7A34B" },
  { id: "flash-yellow", label: "형광 노랑", hex: "#D9F22A" },
  { id: "blue", label: "파랑", hex: "#2F65C8" },
  { id: "red", label: "빨강", hex: "#D44747" },
] as const;

export const GRIP_COLOR_OPTIONS = [
  { id: "white", label: "흰색", hex: "#F4F2E8" },
  { id: "black", label: "검정", hex: "#171717" },
  { id: "blue", label: "파랑", hex: "#315FA8" },
  { id: "red", label: "빨강", hex: "#C74449" },
  { id: "yellow", label: "노랑", hex: "#E5D33E" },
  { id: "green", label: "초록", hex: "#438A61" },
  { id: "pink", label: "분홍", hex: "#DE88A7" },
  { id: "purple", label: "보라", hex: "#76579C" },
] as const;

export type StringColorId = (typeof STRING_COLOR_OPTIONS)[number]["id"];
export type GripColorId = (typeof GRIP_COLOR_OPTIONS)[number]["id"];

export type CustomizerState = {
  stringColorId: StringColorId | null;
  gripColorId: GripColorId | null;
};

export type CustomizerAction =
  | { type: "select-string"; colorId: StringColorId }
  | { type: "select-grip"; colorId: GripColorId }
  | { type: "reset" };

export const initialCustomizerState: CustomizerState = {
  stringColorId: null,
  gripColorId: null,
};

export function reduceCustomizerState(
  state: CustomizerState,
  action: CustomizerAction,
): CustomizerState {
  switch (action.type) {
    case "select-string":
      return { ...state, stringColorId: action.colorId };
    case "select-grip":
      return { ...state, gripColorId: action.colorId };
    case "reset":
      return initialCustomizerState;
  }
}
```

Unknown values remain impossible at compile time because the UI receives IDs only from the immutable arrays.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-data.test.ts
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/data/racket-customizer.ts tests/racket-customizer-data.test.ts
git commit -m "feat: define racket customizer palette"
```

---

### Task 2: Build the Deterministic Mask Pipeline and Three-Model Pilot

**Files:**
- Create: `scripts/racket-customizer-mask-geometry.ts`
- Create: `scripts/lib/racket-customizer-mask-builder.ts`
- Create: `scripts/generate-racket-customizer-masks.ts`
- Create: `src/data/racket-customizer-profiles.generated.ts`
- Create: `public/images/racket-customizer/babolat-pure-aero-2026-strings.svg`
- Create: `public/images/racket-customizer/babolat-pure-aero-2026-grip.svg`
- Create: `public/images/racket-customizer/head-gravity-mp-2025-strings.svg`
- Create: `public/images/racket-customizer/head-gravity-mp-2025-grip.svg`
- Create: `public/images/racket-customizer/yonex-ezone-100-2025-strings.svg`
- Create: `public/images/racket-customizer/yonex-ezone-100-2025-grip.svg`
- Create: `tests/racket-customizer-mask-builder.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: palette types from Task 1 only for shared naming
- Produces: `MaskGeometry`, `buildStringMaskSvg`, `buildGripMaskSvg`, `buildGeneratedProfilesModule`
- Produces: `RACKET_CUSTOMIZER_PROFILES` and `RacketCustomizerProfile`
- Produces: `npm run customizer:masks`

- [ ] **Step 1: Write the failing pure builder test**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGripMaskSvg,
  buildStringMaskSvg,
} from "../scripts/lib/racket-customizer-mask-builder";

const geometry = {
  slug: "fixture-racket",
  productCode: "FIXTURE",
  canvas: { width: 500, height: 857 },
  stringBed: {
    cx: 326,
    cy: 276,
    rx: 93,
    ry: 142,
    rotationDeg: 0,
    mains: 16,
    crosses: 19,
    inset: 7,
  },
  gripPaths: [
    "M292 616 L313 616 L311 810 L294 810 Z",
    "M173 616 L190 616 L188 810 L175 810 Z",
  ],
} as const;

test("string mask is a transparent SVG with the requested calibrated grid", () => {
  const svg = buildStringMaskSvg(geometry);
  assert.match(svg, /viewBox="0 0 500 857"/);
  assert.equal((svg.match(/<line /g) ?? []).length, 35);
  assert.match(svg, /clipPath/);
  assert.doesNotMatch(svg, /<image|https?:\/\//);
});

test("grip mask contains both calibrated grip paths and no photo pixels", () => {
  const svg = buildGripMaskSvg(geometry);
  assert.match(svg, /M292 616/);
  assert.match(svg, /M173 616/);
  assert.equal((svg.match(/<path /g) ?? []).length, 2);
  assert.doesNotMatch(svg, /<image|data:image|https?:\/\//);
});
```

- [ ] **Step 2: Run the builder test and verify RED**

Run:

```bash
node --import tsx --test tests/racket-customizer-mask-builder.test.ts
```

Expected: FAIL because the builder module does not exist.

- [ ] **Step 3: Implement pure SVG builders**

`buildStringMaskSvg` must:

- emit a 500-based calibrated `viewBox`;
- create one rotated ellipse clip path;
- distribute `mains` vertical and `crosses` horizontal lines within the inset ellipse;
- compute each line endpoint from the ellipse equation instead of drawing outside the head;
- use white strokes on a transparent background;
- escape the slug before placing it in an SVG ID.

`buildGripMaskSvg` must:

- emit each reviewed `gripPaths` entry as a white filled path;
- reject an empty path array;
- never embed the source photo or an external URL.

Export `validateMaskGeometry` that rejects:

- canvas dimensions outside 400–1000;
- head bounds outside the canvas;
- fewer than 14 or more than 20 mains;
- fewer than 15 or more than 21 crosses;
- any grip path without both `M` and `Z`.

Use the following deterministic ellipse calculation inside the string builder:

```ts
function positions(count: number, radius: number, inset: number): number[] {
  const usableRadius = radius - inset;
  const step = (usableRadius * 2) / (count - 1);
  return Array.from({ length: count }, (_, index) => -usableRadius + index * step);
}

function ellipseExtent(offset: number, primaryRadius: number, secondaryRadius: number) {
  const normalized = offset / primaryRadius;
  return secondaryRadius * Math.sqrt(Math.max(0, 1 - normalized * normalized));
}

const mainLines = positions(mains, rx, inset).map((x) => {
  const y = ellipseExtent(x, rx - inset, ry - inset);
  return `<line x1="${cx + x}" y1="${cy - y}" x2="${cx + x}" y2="${cy + y}"/>`;
});

const crossLines = positions(crosses, ry, inset).map((y) => {
  const x = ellipseExtent(y, ry - inset, rx - inset);
  return `<line x1="${cx - x}" y1="${cy + y}" x2="${cx + x}" y2="${cy + y}"/>`;
});
```

Wrap both line arrays in the calibrated rotation transform and ellipse clip. Round emitted coordinates to at most two decimal places so a second generator run is byte-identical.

- [ ] **Step 4: Run the builder test and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-mask-builder.test.ts
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Calibrate and add the three pilot geometries**

Use the verified 500px product images for:

- `babolat-pure-aero-2026` / `BPAR26`
- `head-gravity-mp-2025` / `HGMPG`
- `yonex-ezone-100-2025` / `EZ10BB`

For each image:

1. Measure the front string-bed center, radii, rotation, and exact string pattern.
2. Trace the visible tape area of the front and side grips as closed SVG paths.
3. Record the image’s exact intrinsic width and height.
4. Overlay the generated masks at 100% scale.
5. Accept only when the string centerlines stay within 1.5 source pixels of the photographed strings and grip edges stay within 2 source pixels of the tape boundary.

- [ ] **Step 6: Add the generator and package script**

Add:

```json
"customizer:masks": "tsx scripts/generate-racket-customizer-masks.ts"
```

The generator must:

- sort geometry by slug;
- validate duplicate slugs and product codes;
- write two SVGs per geometry;
- generate a stable `RACKET_CUSTOMIZER_PROFILES` module;
- remove no unrelated file;
- print `Generated N profiles and 2N masks.`

- [ ] **Step 7: Generate and verify the pilot**

Run:

```bash
npm run customizer:masks
```

Expected: `Generated 3 profiles and 6 masks.`

Stage only the generated pilot files, run the generator a second time, then:

```bash
git diff --exit-code -- src/data/racket-customizer-profiles.generated.ts public/images/racket-customizer
```

Expected: no working-tree drift relative to the staged generated files.

- [ ] **Step 8: Commit**

```bash
git add package.json scripts/racket-customizer-mask-geometry.ts scripts/lib/racket-customizer-mask-builder.ts scripts/generate-racket-customizer-masks.ts src/data/racket-customizer-profiles.generated.ts public/images/racket-customizer tests/racket-customizer-mask-builder.test.ts
git commit -m "feat: generate precise racket color masks"
```

---

### Task 3: Resolve Profiles Fail-Closed

**Files:**
- Create: `src/lib/racket-customizer.ts`
- Create: `tests/racket-customizer-profile.test.ts`

**Interfaces:**
- Consumes: `RACKET_CUSTOMIZER_PROFILES` from Task 2
- Produces: `imageProductCode(imageUrl): string | null`
- Produces: `resolveCustomizerProfile(slug, imageUrl): RacketCustomizerProfile | null`
- Produces: `matchesCustomizerDimensions(profile, naturalWidth, naturalHeight): boolean`

- [ ] **Step 1: Write the failing resolver test**

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  matchesCustomizerDimensions,
  resolveCustomizerProfile,
} from "../src/lib/racket-customizer";

const image =
  "https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500";

test("profile resolution requires the exact slug and product code", () => {
  const profile = resolveCustomizerProfile("head-gravity-mp-2025", image);
  assert.equal(profile?.productCode, "HGMPG");
  assert.equal(resolveCustomizerProfile("head-speed-pro-2026", image), null);
  assert.equal(
    resolveCustomizerProfile(
      "head-gravity-mp-2025",
      "https://example.com/HGMPG-1.jpg",
    ),
    null,
  );
});

test("intrinsic dimensions must match the calibrated photo", () => {
  const profile = resolveCustomizerProfile("head-gravity-mp-2025", image);
  assert.ok(profile);
  assert.equal(
    matchesCustomizerDimensions(
      profile,
      profile.intrinsicWidth,
      profile.intrinsicHeight,
    ),
    true,
  );
  assert.equal(matchesCustomizerDimensions(profile, 400, 400), false);
});
```

- [ ] **Step 2: Run the resolver test and verify RED**

Run:

```bash
node --import tsx --test tests/racket-customizer-profile.test.ts
```

Expected: FAIL because `src/lib/racket-customizer` does not exist.

- [ ] **Step 3: Implement strict parsing and matching**

Accept only:

- protocol `https:`;
- hostname `img.tennis-warehouse.com`;
- pathname `/watermark/rs.php`;
- query `path=<PRODUCT_CODE>-1.jpg`;
- a profile whose slug and `productCode` both match.

`matchesCustomizerDimensions` must require exact width and height values recorded by calibration. It must return false for non-finite or non-positive values.

Use strict URL parsing rather than a substring check:

```ts
export function imageProductCode(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    if (
      url.protocol !== "https:"
      || url.hostname !== "img.tennis-warehouse.com"
      || url.pathname !== "/watermark/rs.php"
    ) {
      return null;
    }
    return url.searchParams.get("path")?.match(/^([A-Z0-9]+)-1\.jpg$/i)?.[1]?.toUpperCase()
      ?? null;
  } catch {
    return null;
  }
}

export function resolveCustomizerProfile(slug: string, imageUrl: string) {
  const profile = RACKET_CUSTOMIZER_PROFILES.find((item) => item.slug === slug);
  return profile && imageProductCode(imageUrl) === profile.productCode ? profile : null;
}

export function matchesCustomizerDimensions(
  profile: RacketCustomizerProfile,
  naturalWidth: number,
  naturalHeight: number,
) {
  return Number.isFinite(naturalWidth)
    && Number.isFinite(naturalHeight)
    && naturalWidth > 0
    && naturalHeight > 0
    && naturalWidth === profile.intrinsicWidth
    && naturalHeight === profile.intrinsicHeight;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-profile.test.ts
```

Expected: 2 tests pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/lib/racket-customizer.ts tests/racket-customizer-profile.test.ts
git commit -m "feat: validate racket customizer profiles"
```

---

### Task 4: Build the Accessible Client Island and Integrate the Detail Page

**Files:**
- Create: `src/components/racket-visual-customizer.tsx`
- Create: `tests/racket-customizer-markup.test.tsx`
- Modify: `src/app/rackets/[slug]/page.tsx:120-136`
- Modify: `tests/performance-structure.test.ts`

**Interfaces:**
- Consumes: palettes and reducer from Task 1
- Consumes: profile resolver and dimension matcher from Task 3
- Produces: `RacketVisualCustomizer({ slug, imageUrl, alt })`

- [ ] **Step 1: Write the failing accessible-markup test**

```tsx
import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { RacketVisualCustomizer } from "../src/components/racket-visual-customizer";

test("customizer begins with the original photo and accessible color groups", () => {
  const html = renderToStaticMarkup(
    <RacketVisualCustomizer
      slug="head-gravity-mp-2025"
      imageUrl="https://img.tennis-warehouse.com/watermark/rs.php?path=HGMPG-1.jpg&nw=500"
      alt="Head Gravity MP 2025"
    />,
  );

  assert.match(html, /Head Gravity MP 2025/);
  assert.match(html, /<fieldset/);
  assert.match(html, /스트링 색상/);
  assert.match(html, /그립 색상/);
  assert.match(html, /원본으로 초기화/);
  assert.match(html, /색상 시뮬레이션/);
  assert.match(html, /판매 재고를 의미하지 않습니다/);
});
```

- [ ] **Step 2: Run the markup test and verify RED**

Run:

```bash
node --import tsx --test tests/racket-customizer-markup.test.tsx
```

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement the minimal component**

Requirements:

- keep the existing square white stage and `object-contain` photo;
- center an inner stage whose aspect ratio exactly matches the profile canvas;
- render overlays only after `onLoad` confirms intrinsic dimensions;
- confirm `mask-image` or `-webkit-mask-image` support with `CSS.supports` before exposing the controls;
- use CSS `maskImage` and `WebkitMaskImage` with `maskSize: "100% 100%"`;
- render the string layer as an opaque normal-blend line color;
- render the grip layer with a normal-blend color plus a subtle repeating diagonal tape texture so light colors can brighten an originally dark grip;
- use a thin neutral `drop-shadow` on white and silver string masks without expanding outside the calibrated mask;
- make both overlays `aria-hidden="true"` and `pointer-events-none`;
- render two `fieldset`/`legend` groups with real radio inputs;
- keep each label at least 44×44px;
- display both a swatch and the Korean color name;
- provide checked text/mark and `focus-visible` styling;
- announce changes through one concise `aria-live="polite"` region;
- reset both layers through the reducer;
- use no API, DB, localStorage, or URL mutation;
- show the original image without controls when profile resolution fails.

- [ ] **Step 4: Run the markup test and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-markup.test.tsx
```

Expected: 1 test passes, 0 fail.

- [ ] **Step 5: Add the detail integration regression test**

Extend `tests/performance-structure.test.ts`:

```ts
test("racket color simulation stays a detail-only client island", () => {
  const detail = read("src/app/rackets/[slug]/page.tsx");
  const catalog = read("src/app/rackets/page.tsx");

  assert.match(detail, /RacketVisualCustomizer/);
  assert.doesNotMatch(catalog, /RacketVisualCustomizer/);
});
```

- [ ] **Step 6: Run the regression test and verify RED**

Run:

```bash
node --import tsx --test tests/performance-structure.test.ts
```

Expected: the new detail-only test fails because the detail page still uses the plain image block.

- [ ] **Step 7: Replace only the detail image block**

Remove the `Image` import from the detail page if no longer used there. Pass:

```tsx
<RacketVisualCustomizer
  slug={racket.slug}
  imageUrl={racket.imageUrl}
  alt={`${racket.brand} ${formatRacketName(racket.model, racket.year)}`}
/>
```

Preserve the existing no-photo copy. Do not move the score, price, actions, string recommendations, specs, or similar-racket sections.

- [ ] **Step 8: Run the focused tests and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-markup.test.tsx tests/performance-structure.test.ts
```

Expected: all focused tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/racket-visual-customizer.tsx src/app/rackets/[slug]/page.tsx tests/racket-customizer-markup.test.tsx tests/performance-structure.test.ts
git commit -m "feat: add racket color preview controls"
```

---

### Task 5: Add the Remaining Babolat and Dunlop Precision Masks

**Files:**
- Modify: `scripts/racket-customizer-mask-geometry.ts`
- Regenerate: `src/data/racket-customizer-profiles.generated.ts`
- Create: 28 SVG files under `public/images/racket-customizer/`
- Create: `tests/racket-customizer-coverage.test.ts`

**Interfaces:**
- Consumes: generator and pilot contract from Task 2
- Produces: 17 cumulative profiles and 34 cumulative masks

- [ ] **Step 1: Write a failing batch coverage test**

Assert profiles and both mask files exist for the pilot plus these exact slugs:

```ts
const BABOLAT_DUNLOP_REMAINDER = [
  "babolat-pure-aero-98-2026",
  "babolat-pure-aero-lite-2026",
  "babolat-pure-aero-team-2026",
  "babolat-pure-drive-2025",
  "babolat-pure-drive-98-gen11-2025",
  "babolat-pure-drive-lite-2025",
  "babolat-pure-drive-team-2025",
  "babolat-pure-strike-100-2024",
  "babolat-pure-strike-98-16x19-2024",
  "dunlop-cx-200-2025",
  "dunlop-fx-500-2025",
  "dunlop-fx-500-tour-2025",
  "dunlop-sx-300-2025",
  "dunlop-sx-300-tour-2025",
] as const;
```

- [ ] **Step 2: Run the coverage test and verify RED**

Run:

```bash
node --import tsx --test tests/racket-customizer-coverage.test.ts
```

Expected: FAIL listing the 14 missing profiles and/or 28 missing masks.

- [ ] **Step 3: Calibrate all 14 geometries**

For every listed slug, use its exact product code from `src/lib/racket-images.ts`, exact photo dimensions, exact pattern, reviewed string ellipse, and two closed grip paths. Apply the same 1.5px string and 2px grip-boundary acceptance thresholds as the pilot.

- [ ] **Step 4: Generate and visually inspect**

Run:

```bash
npm run customizer:masks
```

Expected: `Generated 17 profiles and 34 masks.`

Inspect black, white, flash-yellow strings and white, black, pink grips for all 14 new models at desktop and 375px mobile width.

- [ ] **Step 5: Run the coverage test and verify GREEN**

Run:

```bash
node --import tsx --test tests/racket-customizer-coverage.test.ts
```

Expected: the pilot and Babolat/Dunlop coverage assertions pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/racket-customizer-mask-geometry.ts src/data/racket-customizer-profiles.generated.ts public/images/racket-customizer tests/racket-customizer-coverage.test.ts
git commit -m "feat: add Babolat and Dunlop color masks"
```

---

### Task 6: Add Head, Prince, and Tecnifibre Precision Masks

**Files:**
- Modify: `scripts/racket-customizer-mask-geometry.ts`
- Regenerate: `src/data/racket-customizer-profiles.generated.ts`
- Create: 34 SVG files under `public/images/racket-customizer/`
- Modify: `tests/racket-customizer-coverage.test.ts`

**Interfaces:**
- Consumes: Tasks 2 and 5
- Produces: 34 cumulative profiles and 68 cumulative masks

- [ ] **Step 1: Add the failing exact-slug coverage list**

```ts
const HEAD_PRINCE_TECNIFIBRE_REMAINDER = [
  "head-boom-mp-2026",
  "head-boom-pro-2026",
  "head-extreme-mp-2024",
  "head-extreme-pro-2024",
  "head-gravity-pro-2025",
  "head-gravity-team-2025",
  "head-prestige-mp-2023",
  "head-radical-mp-2025",
  "head-radical-pro-2025",
  "head-speed-mp-2026",
  "head-speed-mp-l-2026",
  "head-speed-pro-2026",
  "prince-tour-100p-305g-2026",
  "prince-tour-98-2026",
  "tecnifibre-t-fight-300-2025",
  "tecnifibre-t-fight-305-isoflex-2022",
  "tecnifibre-tf-40-305-2024",
] as const;
```

- [ ] **Step 2: Run the test and verify RED**

Run the coverage test and confirm all 17 new slugs fail for missing profile or asset reasons.

- [ ] **Step 3: Calibrate the 17 model-specific geometries**

Record exact product code, dimensions, string pattern, ellipse, rotation, and two grip paths for every slug. Reject any shared default geometry that misses the documented pixel tolerances.

- [ ] **Step 4: Generate and visually inspect**

Run:

```bash
npm run customizer:masks
```

Expected: `Generated 34 profiles and 68 masks.`

Inspect all 17 models with the same representative color matrix and both responsive widths.

- [ ] **Step 5: Verify GREEN and commit**

Run the coverage test, then:

```bash
git add scripts/racket-customizer-mask-geometry.ts src/data/racket-customizer-profiles.generated.ts public/images/racket-customizer tests/racket-customizer-coverage.test.ts
git commit -m "feat: add Head Prince and Tecnifibre color masks"
```

---

### Task 7: Add Wilson and Remaining Yonex Precision Masks

**Files:**
- Modify: `scripts/racket-customizer-mask-geometry.ts`
- Regenerate: `src/data/racket-customizer-profiles.generated.ts`
- Create: 40 SVG files under `public/images/racket-customizer/`
- Modify: `tests/racket-customizer-coverage.test.ts`

**Interfaces:**
- Consumes: Tasks 2, 5, and 6
- Produces: exact final 54 profiles and 108 masks

- [ ] **Step 1: Add the failing final-batch coverage list**

```ts
const WILSON_YONEX_REMAINDER = [
  "wilson-blade-100-v10-2026",
  "wilson-blade-100l-v9-2024",
  "wilson-blade-98-16x19-v10-2026",
  "wilson-blade-98-16x19-v9-2024",
  "wilson-blade-98-18x20-v9-2024",
  "wilson-clash-100-v3-2025",
  "wilson-pro-staff-97-v14-2024",
  "wilson-shift-99-pro-v1-2024",
  "wilson-shift-99-v1-2024",
  "wilson-ultra-100-v5-2025",
  "wilson-ultra-99-pro-v5-2025",
  "yonex-ezone-100l-2025",
  "yonex-ezone-98-2025",
  "yonex-ezone-98-tour-2025",
  "yonex-percept-100d-2025",
  "yonex-percept-97-2025",
  "yonex-vcore-100-2026",
  "yonex-vcore-100l-2026",
  "yonex-vcore-95-8th-gen-2026",
  "yonex-vcore-98-2026",
] as const;
```

- [ ] **Step 2: Run the test and verify RED**

Run the coverage test and confirm all 20 new slugs fail for missing profile or asset reasons.

- [ ] **Step 3: Calibrate all 20 geometries**

Use each exact Wilson/Yonex product code and inspected image, including the 18×20 Blade pattern and varying Yonex isometric head proportions. Apply the same pixel tolerances and keep every frame edge outside the mask.

- [ ] **Step 4: Generate and visually inspect**

Run:

```bash
npm run customizer:masks
```

Expected: `Generated 54 profiles and 108 masks.`

Inspect all 20 models and recheck the three pilot models to catch generator regressions.

- [ ] **Step 5: Add final manifest invariants**

The coverage test must now assert:

```ts
assert.equal(RACKET_CUSTOMIZER_PROFILES.length, 54);
assert.equal(new Set(RACKET_CUSTOMIZER_PROFILES.map(({ slug }) => slug)).size, 54);
assert.equal(new Set(RACKET_CUSTOMIZER_PROFILES.map(({ productCode }) => productCode)).size, 54);
```

For every profile, assert both asset files exist and contain no `<image`, `data:image`, `http://`, or `https://`.

- [ ] **Step 6: Verify GREEN and commit**

Run the coverage and builder tests, then:

```bash
git add scripts/racket-customizer-mask-geometry.ts src/data/racket-customizer-profiles.generated.ts public/images/racket-customizer tests/racket-customizer-coverage.test.ts
git commit -m "feat: complete 54-racket color masks"
```

---

### Task 8: Full Review, Canonical Preview, and Development Record

**Files:**
- Modify: `DEVLOG.md`
- No Production deployment files

**Interfaces:**
- Consumes: all prior tasks
- Produces: verified local feature, canonical Vercel Preview URL, reviewer verdict, and project record

- [ ] **Step 1: Run the complete automated verification**

Run each command fresh:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run customizer:masks
git diff --check
git status --short
```

Expected:

- all tests pass with 0 failures;
- typecheck, lint, and build exit 0;
- mask generator reports 54 profiles and 108 masks;
- rerunning the generator creates no diff;
- no uncommitted file exists except the pending DEVLOG update.

- [ ] **Step 2: Run desktop and mobile browser QA**

On all 54 canonical detail routes:

- verify the original state has no overlay;
- select each of the eight string and eight grip options at least once across the full route set;
- verify reset removes both overlays;
- verify frame paint and background do not change;
- verify no visible mask spill exceeds the accepted boundaries;
- verify keyboard radio navigation and reset;
- verify 375×844 and desktop widths have no horizontal overflow;
- verify console warning/error count is 0;
- verify wishlist, comparison, score, string recommendation, specs, and similar-racket sections remain usable.

- [ ] **Step 3: Request an independent reviewer gate**

Reviewer checks:

- profile/product-code fail-closed safety;
- 54/108 coverage invariants;
- accessibility semantics;
- performance and detail-only bundle boundary;
- no DB, scoring, offer, Omega, or Production mutation;
- visual QA evidence.

Do not proceed to Preview unless Critical and Warning findings are resolved.

- [ ] **Step 4: Commit the feature locally**

If review changes were required, rerun Step 1, then commit only the reviewed implementation:

```bash
git add src scripts public/images/racket-customizer tests package.json package-lock.json
git commit -m "feat: preview racket string and grip colors"
```

- [ ] **Step 5: Create a canonical Preview only**

Before deployment:

```bash
git branch --show-current
git status --short
```

Confirm the workspace is the canonical repository and clean. Deploy without `--prod` to the canonical `racketlab` project. Verify the deployment target is Preview, the state is READY, and no Omega alias is present.

- [ ] **Step 6: Verify the Preview**

Repeat representative desktop/mobile interaction checks on:

- `babolat-pure-aero-2026`
- `head-gravity-mp-2025`
- `yonex-ezone-100-2025`
- one 18×20 model
- one lightweight 100L/L model

Check Vercel Preview runtime logs for warning, error, fatal, and 5xx entries.

- [ ] **Step 7: Update DEVLOG and commit the record**

Add a new chapter containing:

- 54 profiles and 108 masks;
- chosen 8+8 palettes;
- exact test/type/lint/build results;
- visual QA coverage;
- Preview deployment ID and URL;
- reviewer verdict;
- confirmation that GitHub push, Production deployment, DB changes, and Omega changes did not occur.

Commit:

```bash
git add DEVLOG.md
git commit -m "docs: record racket color preview"
```

- [ ] **Step 8: Hand off for user review**

Show the canonical Preview URL and representative detail links. Ask for explicit Production approval separately. Do not push `main` or promote the Preview in this task.
