import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGripMask,
  countRuns,
  fillHoles,
  gripRowCoverage,
  largestComponent,
  refineBed,
  trimGripRows,
} from "../scripts/lib/racket-photo-overlays";
import {
  CUSTOMIZER_PHOTOS,
  customizerPhotoForSlug,
} from "../src/data/racket-customizer-photos.generated";

const root = join(import.meta.dirname, "..");

/** 문자열 그림을 0/255 마스크로 만든다. `#` 이 채워진 픽셀이다. */
function maskFrom(rows: string[]): {
  mask: Uint8Array;
  width: number;
  height: number;
} {
  const width = rows[0].length;
  const height = rows.length;
  const mask = new Uint8Array(width * height);
  rows.forEach((row, y) => {
    assert.equal(row.length, width, "모든 행의 길이가 같아야 한다");
    for (let x = 0; x < width; x += 1) {
      if (row[x] === "#") mask[y * width + x] = 255;
    }
  });
  return { mask, width, height };
}

test("largestComponent 는 가장 큰 성분과 바운딩 박스를 돌려준다", () => {
  const { mask, width, height } = maskFrom([
    "##....####",
    "##....####",
    "......####",
    "..........",
  ]);
  const result = largestComponent(mask, width, height);
  assert.ok(result);
  assert.deepEqual(result.bbox, { x: 6, y: 0, width: 4, height: 3 });
  // 작은 성분(왼쪽 2x2)은 제거된다.
  assert.equal(result.mask[0], 0);
  assert.equal(result.mask[6], 255);
});

test("largestComponent 는 빈 마스크에 null 을 돌려준다", () => {
  const { mask, width, height } = maskFrom(["....", "...."]);
  assert.equal(largestComponent(mask, width, height), null);
});

test("fillHoles 는 안쪽 구멍만 채우고 바깥은 그대로 둔다", () => {
  const { mask, width, height } = maskFrom([
    ".....",
    ".###.",
    ".#.#.",
    ".###.",
    ".....",
  ]);
  const filled = fillHoles(mask, width, height);
  assert.equal(filled[2 * width + 2], 255, "구멍이 채워져야 한다");
  assert.equal(filled[0], 0, "바깥은 채워지면 안 된다");
});

test("refineBed 는 스로트 창과 분리된 후프 안쪽만 잡고 워터마크 구멍을 채운다", () => {
  // 위: 후프 안쪽(구멍 있음), 아래: 더 작은 스로트 창.
  const { mask, width, height } = maskFrom([
    "........",
    ".######.",
    ".##..##.",
    ".######.",
    "........",
    "..####..",
    "........",
  ]);
  const bed = refineBed(mask, width, height);
  assert.ok(bed);
  assert.deepEqual(bed.bbox, { x: 1, y: 1, width: 6, height: 3 });
  assert.equal(bed.mask[2 * width + 3], 255, "워터마크 구멍이 채워져야 한다");
  assert.equal(bed.mask[5 * width + 3], 0, "스로트 창은 빠져야 한다");
  assert.equal(bed.fillRatio, 1);
});

test("countRuns 는 maxGap 이하의 틈을 같은 run 으로 센다", () => {
  const { mask, width } = maskFrom(["##.#...##"]);
  assert.equal(countRuns(mask, width, 0, 1), 3);
  assert.equal(countRuns(mask, width, 0, 2), 2);
  assert.equal(countRuns(mask, width, 0, 4), 1);
});

test("trimGripRows 는 run 이 늘어나는 스로트에서 그립을 자른다", () => {
  // 아래 3행은 손잡이(1 run), 그 위는 스로트 두 갈래(2 runs).
  const { mask, width } = maskFrom([
    "##....##",
    "##....##",
    "..####..",
    "..####..",
    "..####..",
  ]);
  const trimmed = trimGripRows(mask, width, { top: 0, bottom: 4 }, 1, 100);
  assert.deepEqual(trimmed, { top: 2, bottom: 4 });
});

test("trimGripRows 는 maxRows 상한을 넘지 않는다", () => {
  const { mask, width } = maskFrom([
    "..####..",
    "..####..",
    "..####..",
    "..####..",
  ]);
  const trimmed = trimGripRows(mask, width, { top: 0, bottom: 3 }, 1, 2);
  assert.deepEqual(trimmed, { top: 2, bottom: 3 });
});

test("buildGripMask 는 run 사이 틈을 메우고 베드 픽셀은 비껴간다", () => {
  const silhouette = maskFrom([
    "#......#",
    "########",
  ]);
  const bed = maskFrom([
    "........",
    "...##...",
  ]);
  // 첫 행: 틈 6 > maxGap 4 → 두 run 따로(2px). 둘째 행: run 8px 중 베드 2px 제외.
  const { mask, pixels } = buildGripMask(
    silhouette.mask,
    silhouette.width,
    silhouette.height,
    { top: 0, bottom: 1 },
    bed.mask,
    4,
  );
  assert.equal(mask[0], 255);
  assert.equal(mask[3], 0, "maxGap 을 넘는 틈은 메우지 않는다");
  assert.equal(mask[silhouette.width + 3], 0, "베드 픽셀은 그립에서 제외된다");
  assert.equal(pixels, 8);
});

test("buildGripMask 는 maxGap 이하 틈을 메워 흰 그립 내부를 채운다", () => {
  const silhouette = maskFrom(["#..#"]);
  const bed = maskFrom(["...."]);
  const { mask, pixels } = buildGripMask(
    silhouette.mask,
    silhouette.width,
    1,
    { top: 0, bottom: 0 },
    bed.mask,
    3,
  );
  assert.equal(pixels, 4);
  assert.equal(mask[1], 255);
  assert.equal(mask[2], 255);
});

test("gripRowCoverage 는 중앙값 대비 채워진 행의 비율을 돌려준다", () => {
  const { mask, width, height } = maskFrom([
    "####",
    "####",
    "#...",
    "####",
  ]);
  const coverage = gripRowCoverage(mask, width, height, { top: 0, bottom: 3 });
  assert.equal(coverage, 0.75);
});

test("매니페스트의 라켓마다 사진과 마스크 파일이 실제로 존재한다", () => {
  const slugs = Object.keys(CUSTOMIZER_PHOTOS);
  assert.ok(slugs.length > 0, "매니페스트가 비어 있으면 안 된다");

  for (const slug of slugs) {
    const entry = CUSTOMIZER_PHOTOS[slug];
    assert.ok(entry.width > 0 && entry.height > 0);
    // 베드는 사진 안에 있어야 한다.
    assert.ok(entry.bed.x >= 0 && entry.bed.y >= 0);
    assert.ok(entry.bed.x + entry.bed.width <= entry.width);
    assert.ok(entry.bed.y + entry.bed.height <= entry.height);

    for (const suffix of [".jpg", "-bed.png", "-grip.png"]) {
      const asset = join(root, "public", "images", "customizer", `${slug}${suffix}`);
      assert.ok(existsSync(asset), `${slug}${suffix} 이 없다`);
    }
  }
});

test("customizerPhotoForSlug 는 없는 slug 에 null 을 돌려준다", () => {
  assert.equal(customizerPhotoForSlug("no-such-racket"), null);
});

test("sharp 는 런타임 의존성이 아니다", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(pkg.dependencies?.sharp, undefined);
  assert.ok(pkg.devDependencies?.sharp);
});
