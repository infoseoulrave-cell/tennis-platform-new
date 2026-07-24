import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { RACKET_CUSTOMIZER_PROFILES } from "../src/data/racket-customizer-profiles.generated";
import { RACKET_CUSTOMIZER_MASK_GEOMETRIES } from "../scripts/racket-customizer-mask-geometry";
import {
  buildGripMaskSvg,
  buildStringMaskSvg,
} from "../scripts/lib/racket-customizer-mask-builder";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const PILOT_SLUGS = [
  "babolat-pure-aero-2026",
  "head-gravity-mp-2025",
  "yonex-ezone-100-2025",
] as const;

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

const EXPECTED_SLUGS = [
  ...PILOT_SLUGS,
  ...BABOLAT_DUNLOP_REMAINDER,
  ...HEAD_PRINCE_TECNIFIBRE_REMAINDER,
];

const TASK_5_METADATA = {
  "babolat-pure-aero-98-2026": { productCode: "BPA98R", width: 500, height: 858, mains: 16, crosses: 20 },
  "babolat-pure-aero-lite-2026": { productCode: "BPALTR", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-aero-team-2026": { productCode: "BPAT26", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-drive-2025": { productCode: "BPD25R", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-drive-98-gen11-2025": { productCode: "PD98R", width: 500, height: 857, mains: 16, crosses: 20 },
  "babolat-pure-drive-lite-2025": { productCode: "BPDLR", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-drive-team-2025": { productCode: "BRPTR", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-strike-100-2024": { productCode: "PS1019", width: 500, height: 857, mains: 16, crosses: 19 },
  "babolat-pure-strike-98-16x19-2024": { productCode: "PS9816", width: 500, height: 857, mains: 16, crosses: 19 },
  "dunlop-cx-200-2025": { productCode: "DCX2S", width: 500, height: 857, mains: 16, crosses: 19 },
  "dunlop-fx-500-2025": { productCode: "DF500", width: 500, height: 857, mains: 16, crosses: 19 },
  "dunlop-fx-500-tour-2025": { productCode: "DF50T", width: 500, height: 858, mains: 16, crosses: 19 },
  "dunlop-sx-300-2025": { productCode: "DSX3R", width: 500, height: 857, mains: 16, crosses: 19 },
  "dunlop-sx-300-tour-2025": { productCode: "DSXTR", width: 500, height: 857, mains: 16, crosses: 19 },
} as const;

const TASK_6_METADATA = {
  "head-boom-mp-2026": { productCode: "HBOMP6", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-boom-pro-2026": { productCode: "HBOOP6", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-extreme-mp-2024": { productCode: "HREM24", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-extreme-pro-2024": { productCode: "HREP24", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-gravity-pro-2025": { productCode: "HGPRR", width: 500, height: 857, mains: 18, crosses: 20 },
  "head-gravity-team-2025": { productCode: "HRTMPG", width: 500, height: 857, mains: 16, crosses: 20 },
  "head-prestige-mp-2023": { productCode: "HPRMP", width: 500, height: 857, mains: 18, crosses: 19 },
  "head-radical-mp-2025": { productCode: "HRMP", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-radical-pro-2025": { productCode: "HPRR", width: 500, height: 858, mains: 16, crosses: 19 },
  "head-speed-mp-2026": { productCode: "HSPMP6", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-speed-mp-l-2026": { productCode: "HSMPL6", width: 500, height: 857, mains: 16, crosses: 19 },
  "head-speed-pro-2026": { productCode: "HSPDP6", width: 500, height: 857, mains: 18, crosses: 20 },
  "prince-tour-100p-305g-2026": { productCode: "PTR61P", width: 500, height: 857, mains: 18, crosses: 20 },
  "prince-tour-98-2026": { productCode: "PTR698", width: 500, height: 857, mains: 16, crosses: 19 },
  "tecnifibre-t-fight-300-2025": { productCode: "TF30ST", width: 500, height: 858, mains: 16, crosses: 19 },
  "tecnifibre-t-fight-305-isoflex-2022": { productCode: "ISO305", width: 500, height: 857, mains: 18, crosses: 19 },
  "tecnifibre-tf-40-305-2024": { productCode: "TF40R1", width: 500, height: 857, mains: 16, crosses: 19 },
} as const;

const CALIBRATED_REMAINDER = [
  ...BABOLAT_DUNLOP_REMAINDER,
  ...HEAD_PRINCE_TECNIFIBRE_REMAINDER,
] as const;

const CALIBRATED_METADATA = {
  ...TASK_5_METADATA,
  ...TASK_6_METADATA,
} as const;

const UNSAFE_SVG =
  /<(?:script|foreignObject|image|use|iframe|object|embed)\b|\bon[a-z][\w:-]*\s*=|(?:https?:|data:|javascript:)|(?:href|src|xlink:href)\s*=\s*["']\s*\/\//i;

function assertCanonicalSvg(actual: string, canonical: string, label: string): void {
  assert.equal(actual, canonical, `${label} must byte-match canonical builder output`);
}

test("the pilot and calibrated Task 5/6 remainder have generated profiles and masks", async () => {
  assert.deepEqual(
    RACKET_CUSTOMIZER_PROFILES.map(({ slug }) => slug).sort(),
    [...EXPECTED_SLUGS].sort(),
  );

  await Promise.all(
    EXPECTED_SLUGS.flatMap((slug) => [
      access(path.join(projectRoot, "public", "images", "racket-customizer", `${slug}-strings.svg`)),
      access(path.join(projectRoot, "public", "images", "racket-customizer", `${slug}-grip.svg`)),
    ]),
  );
});

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

test("explicit Task 5/6 positions avoid degenerate edge lines and gross spacing outliers", () => {
  const taskGeometries = RACKET_CUSTOMIZER_MASK_GEOMETRIES.filter(({ slug }) =>
    CALIBRATED_REMAINDER.includes(slug as (typeof CALIBRATED_REMAINDER)[number]),
  );
  const violations: string[] = [];

  for (const { slug, stringBed } of taskGeometries) {
    const axes = [
      {
        label: "main",
        positions: stringBed.mainPositions,
        center: stringBed.cx,
        primaryRadius: stringBed.rx - stringBed.inset,
        secondaryRadius: stringBed.ry - stringBed.inset,
      },
      {
        label: "cross",
        positions: stringBed.crossPositions,
        center: stringBed.cy,
        primaryRadius: stringBed.ry - stringBed.inset,
        secondaryRadius: stringBed.rx - stringBed.inset,
      },
    ] as const;

    for (const axis of axes) {
      assert.ok(axis.positions, `${slug} must use explicit ${axis.label} positions`);
      const gaps = axis.positions.slice(1).map((position, index) => position - axis.positions[index]);
      const medianGap = median(gaps);
      const largestGap = Math.max(...gaps);
      if (largestGap > medianGap * 1.75) {
        violations.push(`${slug} ${axis.label} gap ${largestGap} exceeds 1.75x median ${medianGap}`);
      }

      for (const position of axis.positions) {
        const offsetRatio = (position - axis.center) / axis.primaryRadius;
        const lineExtent = 2 * axis.secondaryRadius
          * Math.sqrt(Math.max(0, 1 - offsetRatio * offsetRatio));
        if (Math.abs(offsetRatio) >= 1 || lineExtent < 24) {
          violations.push(`${slug} ${axis.label} at ${position} has ${lineExtent.toFixed(1)}px extent`);
        }
      }
    }
  }

  assert.deepEqual(violations, []);
});

test("Task 5/6 profiles and SVGs byte-match canonical inert builder output", async () => {
  const profilesBySlug = new Map<string, (typeof RACKET_CUSTOMIZER_PROFILES)[number]>(
    RACKET_CUSTOMIZER_PROFILES.map((profile) => [profile.slug, profile]),
  );
  const geometriesBySlug = new Map<string, (typeof RACKET_CUSTOMIZER_MASK_GEOMETRIES)[number]>(
    RACKET_CUSTOMIZER_MASK_GEOMETRIES.map((geometry) => [geometry.slug, geometry]),
  );
  for (const [slug, expected] of Object.entries(CALIBRATED_METADATA)) {
    const profile = profilesBySlug.get(slug);
    const geometry = geometriesBySlug.get(slug);
    assert.ok(profile, `${slug} profile missing`);
    assert.ok(geometry, `${slug} geometry missing`);
    assert.deepEqual(
      {
        productCode: profile.productCode,
        width: profile.intrinsicWidth,
        height: profile.intrinsicHeight,
        mains: geometry.stringBed.mains,
        crosses: geometry.stringBed.crosses,
      },
      expected,
    );
    assert.equal(profile.stringMaskUrl, `/images/racket-customizer/${slug}-strings.svg`);
    assert.equal(profile.gripMaskUrl, `/images/racket-customizer/${slug}-grip.svg`);

    const stringSvg = await readFile(path.join(projectRoot, "public", profile.stringMaskUrl), "utf8");
    const gripSvg = await readFile(path.join(projectRoot, "public", profile.gripMaskUrl), "utf8");
    assertCanonicalSvg(stringSvg, buildStringMaskSvg(geometry), `${slug} string mask`);
    assertCanonicalSvg(gripSvg, buildGripMaskSvg(geometry), `${slug} grip mask`);
    assert.doesNotMatch(stringSvg, UNSAFE_SVG);
    assert.doesNotMatch(gripSvg, UNSAFE_SVG);
    assert.match(stringSvg, new RegExp(`viewBox="0 0 ${expected.width} ${expected.height}"`));
    assert.match(gripSvg, new RegExp(`viewBox="0 0 ${expected.width} ${expected.height}"`));

    const lines = [...stringSvg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"\/>/g)];
    assert.equal(lines.length, expected.mains + expected.crosses);
    for (const [, x1, y1, x2, y2] of lines) {
      assert.ok(Math.hypot(Number(x2) - Number(x1), Number(y2) - Number(y1)) >= 24, `${slug} contains a degenerate line`);
    }
    assert.equal((gripSvg.match(/<path d=/g) ?? []).length, 2);
  }
});

test("canonical comparison rejects copied same-pattern strings and empty grip paths", () => {
  const [sourceGeometry, targetGeometry] = RACKET_CUSTOMIZER_MASK_GEOMETRIES.filter(
    ({ slug }) =>
      slug === "babolat-pure-aero-lite-2026"
      || slug === "babolat-pure-aero-team-2026",
  );
  assert.ok(sourceGeometry);
  assert.ok(targetGeometry);

  const copiedSamePatternString = buildStringMaskSvg(sourceGeometry);
  assert.throws(
    () =>
      assertCanonicalSvg(
        copiedSamePatternString,
        buildStringMaskSvg(targetGeometry),
        "copied string mask",
      ),
    /byte-match canonical/i,
  );

  const emptyGripPaths = buildGripMaskSvg(targetGeometry).replace(
    /<path d="[^"]+"\/>/g,
    '<path d=""/>',
  );
  assert.throws(
    () =>
      assertCanonicalSvg(
        emptyGripPaths,
        buildGripMaskSvg(targetGeometry),
        "empty grip mask",
      ),
    /byte-match canonical/i,
  );
});

test("defense-in-depth SVG scan rejects active and external-reference forms", () => {
  for (const unsafeSvg of [
    '<iframe src="about:blank"></iframe>',
    '<object data="/local"></object>',
    '<embed src="/local">',
    '<svg onload="alert(1)"></svg>',
    '<path onpointerenter = "alert(1)"/>',
    '<use href="//bad.example/mask.svg#shape"/>',
    '<a xlink:href = "//bad.example/">bad</a>',
  ]) {
    assert.match(unsafeSvg, UNSAFE_SVG);
  }
});
