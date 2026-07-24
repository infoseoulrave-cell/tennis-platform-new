import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGeneratedProfilesModule,
  buildGripMaskSvg,
  buildStringMaskSvg,
  validateMaskGeometry,
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
