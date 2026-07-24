import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGeneratedProfilesModule,
  buildGripMaskSvg,
  buildStringMaskSvg,
  validateMaskGeometry,
} from "../scripts/lib/racket-customizer-mask-builder";
import type { MaskGeometry } from "../scripts/lib/racket-customizer-mask-builder";

const SVG_NAMESPACE_ATTRIBUTE = 'xmlns="http://www.w3.org/2000/svg"';

function withoutTrustedSvgNamespace(svg: string): string {
  return svg.replace(SVG_NAMESPACE_ATTRIBUTE, "");
}

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
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 500 857"/);
  assert.equal((svg.match(/<line /g) ?? []).length, 35);
  assert.match(svg, /clipPath/);
  assert.doesNotMatch(withoutTrustedSvgNamespace(svg), /<image|https?:\/\//);
});

test("grip mask contains both calibrated grip paths and no photo pixels", () => {
  const svg = buildGripMaskSvg(geometry);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /M292 616/);
  assert.match(svg, /M173 616/);
  assert.equal((svg.match(/<path /g) ?? []).length, 2);
  assert.doesNotMatch(
    withoutTrustedSvgNamespace(svg),
    /<image|data:image|https?:\/\//,
  );
});

test("string mask supports a deterministic custom closed inner-rim clip", () => {
  const svg = buildStringMaskSvg({
    ...geometry,
    slug: "fixture-&-isometric",
    stringBed: {
      ...geometry.stringBed,
      innerRimPath: "M233 156 L419 156 L419 396 L233 396 Z",
    },
  });

  assert.match(svg, /id="fixture-_-isometric-string-bed"/);
  assert.match(
    svg,
    /<clipPath[^>]*><path d="M233 156 L419 156 L419 396 L233 396 Z"\/><\/clipPath>/,
  );
  assert.equal((svg.match(/<ellipse /g) ?? []).length, 0);
});

test("geometry validation rejects invalid bounds, patterns, and open paths", () => {
  assert.doesNotThrow(() => validateMaskGeometry(geometry));
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        canvas: { width: 399, height: 857 },
      }),
    /canvas/i,
  );
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        stringBed: { ...geometry.stringBed, cx: 20 },
      }),
    /bounds/i,
  );
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        stringBed: { ...geometry.stringBed, mains: 13 },
      }),
    /mains/i,
  );
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        gripPaths: ["M292 616 L313 616"],
      }),
    /closed/i,
  );
});

test("generated profiles are sorted and contain stable public mask URLs", () => {
  const generated = buildGeneratedProfilesModule([
    { ...geometry, slug: "z-racket", productCode: "ZED" },
    { ...geometry, slug: "a-racket", productCode: "AYE" },
  ]);

  assert.ok(generated.indexOf('slug: "a-racket"') < generated.indexOf('slug: "z-racket"'));
  assert.match(generated, /productCode: "AYE"/);
  assert.match(
    generated,
    /stringMaskUrl: "\/images\/racket-customizer\/a-racket-strings\.svg"/,
  );
  assert.match(
    generated,
    /gripMaskUrl: "\/images\/racket-customizer\/a-racket-grip\.svg"/,
  );
});

test("geometry validation rejects unsafe paths, empty grips, and custom clips outside the head", () => {
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        gripPaths: ['M292 616 L313 616 Z"/><image href="https://bad.example"/>'],
      }),
    /path/i,
  );
  assert.throws(
    () => validateMaskGeometry({ ...geometry, gripPaths: [] }),
    /grip/i,
  );
  assert.throws(
    () =>
      validateMaskGeometry({
        ...geometry,
        stringBed: {
          ...geometry.stringBed,
          innerRimPath: "M10 10 L490 10 L490 800 L10 800 Z",
        },
      }),
    /inner-rim|head/i,
  );
});

test("ellipse geometry rejects tangent and sub-24px explicit main lines", () => {
  const safeRemainingMains = Array.from(
    { length: geometry.stringBed.mains - 1 },
    (_, index) => 250 + index * 10,
  );

  for (const firstMain of [240, 240.1]) {
    assert.throws(
      () =>
        validateMaskGeometry({
          ...geometry,
          stringBed: {
            ...geometry.stringBed,
            mainPositions: [firstMain, ...safeRemainingMains],
          },
        }),
      /24|line extent/i,
    );
  }
});

test("ellipse geometry rejects tangent and sub-24px explicit cross lines", () => {
  const safeRemainingCrosses = Array.from(
    { length: geometry.stringBed.crosses - 1 },
    (_, index) => 151 + index * 10,
  );

  for (const firstCross of [141, 141.1]) {
    assert.throws(
      () =>
        validateMaskGeometry({
          ...geometry,
          stringBed: {
            ...geometry.stringBed,
            crossPositions: [firstCross, ...safeRemainingCrosses],
          },
        }),
      /24|line extent/i,
    );
  }
});

test("custom inner-rim geometry retains safe explicit ellipse extrema", () => {
  assert.doesNotThrow(() =>
    validateMaskGeometry({
      ...geometry,
      stringBed: {
        ...geometry.stringBed,
        innerRimPath: "M233 156 L419 156 L419 396 L233 396 Z",
        mainPositions: [
          240, 250, 260, 270, 280, 290, 300, 310,
          320, 330, 340, 350, 360, 370, 380, 412,
        ],
        crossPositions: [
          141, 151, 161, 171, 181, 191, 201, 211, 221, 231,
          241, 251, 261, 271, 281, 291, 301, 311, 411,
        ],
      },
    }),
  );
});

test("explicit calibrated positions are validated and rendered without uniform redistribution", () => {
  const calibrated = {
    ...geometry,
    stringBed: {
      ...geometry.stringBed,
      mainPositions: [241, 253, 264, 276, 288, 300, 312, 324, 335, 346, 358, 370, 382, 393, 403, 411],
      crossPositions: [143, 156, 171, 186, 201, 216, 231, 246, 261, 276, 291, 306, 321, 336, 351, 366, 381, 396, 409],
    },
  } satisfies MaskGeometry;
  const svg = buildStringMaskSvg(calibrated);
  assert.match(svg, /x1="241"/);
  assert.match(svg, /y1="143"/);
  assert.throws(
    () => validateMaskGeometry({ ...calibrated, stringBed: { ...calibrated.stringBed, mainPositions: calibrated.stringBed.mainPositions.slice(1) } }),
    /main positions/i,
  );
  assert.throws(
    () => validateMaskGeometry({ ...calibrated, stringBed: { ...calibrated.stringBed, crossPositions: [143, 156, 155, ...calibrated.stringBed.crossPositions.slice(3)] } }),
    /cross positions/i,
  );
  assert.throws(
    () => validateMaskGeometry({ ...calibrated, stringBed: { ...calibrated.stringBed, mainPositions: [Infinity, ...calibrated.stringBed.mainPositions.slice(1)] } }),
    /main positions/i,
  );
  assert.throws(
    () => validateMaskGeometry({ ...calibrated, stringBed: { ...calibrated.stringBed, crossPositions: [140, ...calibrated.stringBed.crossPositions.slice(1)] } }),
    /cross positions/i,
  );
});

test("generated profiles use code-point ordering independent of host locale", () => {
  const generated = buildGeneratedProfilesModule([
    { ...geometry, slug: "ä-racket", productCode: "UMLAUT" },
    { ...geometry, slug: "z-racket", productCode: "ZED" },
  ]);

  assert.ok(generated.indexOf('slug: "z-racket"') < generated.indexOf('slug: "ä-racket"'));
});
