import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  DEFAULT_COLORWAY_OPTIONS,
  darken,
  dominantClusters,
  extractColorway,
  toHex,
} from "../scripts/lib/racket-colorway-extraction";
import type { Rgba } from "../scripts/lib/racket-photo-segmentation";
import {
  RACKET_COLORWAYS,
  colorwayForSlug,
} from "../src/data/racket-colorways.generated";

const root = join(import.meta.dirname, "..");
const read = (relative: string) => readFileSync(join(root, relative), "utf8");

/**
 * 흰 배경 위에 라켓 모양을 그린 합성 사진.
 *
 * 단순한 사각 링으로는 안 된다. 그립 검출이 "아래에서 위로 올라가며 실루엣
 * 폭이 넓어지는 지점"을 찾기 때문에, 폭이 일정한 도형은 전체가 그립으로
 * 잡힌다. 그래서 실제와 같이 넓은 후프 + 좁은 샤프트 + 손잡이로 만든다.
 */
function syntheticRacket({
  frame,
  grip = [26, 26, 28],
}: {
  frame: [number, number, number];
  grip?: [number, number, number];
}): Rgba {
  const width = 96;
  const height = 200;
  const channels = 3;
  const data = new Uint8Array(width * height * channels).fill(255);

  const put = (x: number, y: number, color: readonly number[]) => {
    const offset = (y * width + x) * channels;
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
  };

  const cx = 48;
  const cy = 62;
  const rx = 38;
  const ry = 54;
  const beam = 7;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const outerX = (x - cx) / rx;
      const outerY = (y - cy) / ry;
      const innerX = (x - cx) / (rx - beam);
      const innerY = (y - cy) / (ry - beam);
      const insideOuter = outerX * outerX + outerY * outerY <= 1;
      const insideInner = innerX * innerX + innerY * innerY <= 1;

      if (insideOuter && !insideInner) put(x, y, frame);
      else if (insideOuter) put(x, y, [252, 252, 252]); // 스트링 베드
    }
  }

  for (let y = 112; y < 132; y += 1) {
    for (let x = 40; x < 56; x += 1) put(x, y, frame); // 샤프트
  }
  for (let y = 132; y < 190; y += 1) {
    for (let x = 38; x < 58; x += 1) put(x, y, grip); // 손잡이
  }

  return { data, width, height, channels };
}

test("hex formatting clamps and uppercases", () => {
  assert.equal(toHex(0, 0, 0), "#000000");
  assert.equal(toHex(255, 255, 255), "#FFFFFF");
  assert.equal(toHex(-20, 300, 128.6), "#00FF81");
});

test("darken scales every channel toward black", () => {
  assert.equal(darken("#804020", 0.5), "#402010");
  assert.equal(darken("#CCFB53", 0.5), "#667E2A");
  assert.equal(darken("#FFFFFF", 0), "#000000");
});

test("dominant clusters are ordered by frequency, not by insertion", () => {
  const pixels = [
    ...Array.from({ length: 3 }, () => ({ r: 10, g: 200, b: 10 })),
    ...Array.from({ length: 9 }, () => ({ r: 200, g: 10, b: 10 })),
  ];
  const clusters = dominantClusters(pixels);
  assert.ok(clusters.length >= 2);
  assert.ok(clusters[0].r > clusters[0].g, "red cluster should win on count");
});

test("clusters are deterministic for the same input", () => {
  const pixels = Array.from({ length: 400 }, (_unused, index) => ({
    r: (index * 37) % 256,
    g: (index * 91) % 256,
    b: (index * 13) % 256,
  }));
  const first = dominantClusters(pixels);
  const second = dominantClusters([...pixels]);
  assert.deepEqual(first, second);
});

test("a coloured frame on white yields that colour", () => {
  const extracted = extractColorway(syntheticRacket({ frame: [200, 40, 40] }));
  assert.ok(extracted, "should find a colourway");
  assert.equal(extracted.primary, "#C82828");
  // 뚜렷하게 다른 두 번째 색이 없으면 주색을 어둡게 쓴다. 없는 색을 만들지 않는다.
  assert.equal(extracted.secondary, darken("#C82828", 0.62));
});

test("the string bed and the grip are excluded from the frame colour", () => {
  // 그립을 새파랗게 칠해도 프레임 색은 변하지 않아야 한다.
  const red = extractColorway(syntheticRacket({ frame: [200, 40, 40] }));
  const blueGrip = extractColorway(
    syntheticRacket({ frame: [200, 40, 40], grip: [20, 40, 220] }),
  );
  assert.ok(red && blueGrip);
  assert.equal(blueGrip.primary, red.primary);
});

test("the same photo always produces the same colourway", () => {
  const image = syntheticRacket({ frame: [30, 90, 180] });
  assert.deepEqual(
    extractColorway(image),
    extractColorway(syntheticRacket({ frame: [30, 90, 180] })),
  );
});

test("a blank photo yields no colourway instead of an invented one", () => {
  const blank: Rgba = {
    data: new Uint8Array(64 * 64 * 3).fill(255),
    width: 64,
    height: 64,
    channels: 3,
  };
  assert.equal(extractColorway(blank), null);
});

test("coverage below the floor fails closed", () => {
  const image = syntheticRacket({ frame: [200, 40, 40] });
  const strict = extractColorway(image, {
    ...DEFAULT_COLORWAY_OPTIONS,
    minCoverage: 0.99,
  });
  assert.equal(strict, null);
});

test("the generated file covers the active catalogue with valid hex", () => {
  const slugs = Object.keys(RACKET_COLORWAYS);
  assert.ok(slugs.length >= 50, `expected the 54-racket catalogue, got ${slugs.length}`);
  for (const slug of slugs) {
    const colorway = RACKET_COLORWAYS[slug];
    assert.match(colorway.primary, /^#[0-9A-F]{6}$/, `${slug} primary`);
    assert.match(colorway.secondary, /^#[0-9A-F]{6}$/, `${slug} secondary`);
    assert.notEqual(
      colorway.primary,
      colorway.secondary,
      `${slug} needs two distinct tones`,
    );
  }
});

test("known brand colourways came out recognisably right", () => {
  // 눈으로 확인한 값들을 고정해 둔다. 추출기를 손대다 색이 뒤집히면 잡힌다.
  const cases: [string, "red" | "green" | "blue" | "yellow"][] = [
    ["yonex-vcore-98-2026", "red"],
    ["babolat-pure-aero-2026", "yellow"],
    ["wilson-blade-98-16x19-v10-2026", "green"],
    ["wilson-ultra-100-v5-2025", "blue"],
  ];

  for (const [slug, family] of cases) {
    const colorway = colorwayForSlug(slug);
    assert.ok(colorway, `${slug} is missing from the generated colourways`);
    const r = parseInt(colorway.primary.slice(1, 3), 16);
    const g = parseInt(colorway.primary.slice(3, 5), 16);
    const b = parseInt(colorway.primary.slice(5, 7), 16);

    if (family === "red") assert.ok(r > g + 40 && r > b + 40, `${slug} ${colorway.primary}`);
    if (family === "green") assert.ok(g > r + 40 && g > b, `${slug} ${colorway.primary}`);
    if (family === "blue") assert.ok(b > r + 40 && b > g + 20, `${slug} ${colorway.primary}`);
    if (family === "yellow")
      assert.ok(r > 150 && g > 150 && b < g - 60, `${slug} ${colorway.primary}`);
  }
});

test("an unknown slug returns null so the schematic falls back to neutral", () => {
  assert.equal(colorwayForSlug("no-such-racket"), null);
});

test("the customizer page feeds the extracted paint to the schematic", () => {
  const page = read("src/app/customizer/[slug]/page.tsx");
  assert.match(page, /colorwayForSlug\(racket\.slug\)/);
  assert.match(page, /paint=\{colorwayForSlug\(racket\.slug\) \?\? undefined\}/);
  // 사진에서 뽑은 색이라는 사실을 화면에서 밝힌다.
  assert.match(page, /제품 사진에서 자동으로 뽑은 대표색/);
});

test("sharp stays a build-time dependency only", () => {
  const pkg = JSON.parse(read("package.json")) as {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  assert.ok(pkg.devDependencies.sharp, "sharp should be a devDependency");
  assert.equal(pkg.dependencies.sharp, undefined, "sharp must not ship at runtime");

  // 런타임 코드가 sharp 를 직접 import 하면 번들에 끌려 들어간다.
  const generated = read("src/data/racket-colorways.generated.ts");
  assert.doesNotMatch(generated, /sharp/);
});
