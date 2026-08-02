/**
 * 제품 사진에서 프레임 대표색을 뽑는다.
 *
 * 왜 필요한가: 도식은 스펙에서 형상을 정확히 그리지만 색이 없다. 54종이 전부
 * 같은 회색으로 나오면 "예상 디자인 보기"가 반쪽이다. 그렇다고 라켓마다 사람이
 * 색을 찍으면 이전 마스크 작업(327KB 좌표 파일)의 실패를 되풀이하게 된다.
 * 그래서 사진에서 자동으로, 같은 입력이면 항상 같은 결과가 나오게 뽑는다.
 *
 * 무엇을 색으로 보는가: 실루엣 안쪽에서 스트링 베드와 그립을 뺀 나머지 =
 * 프레임(후프 · 스로트 · 샤프트)이다. 배경과 스트링, 그립은 이미
 * `racket-photo-segmentation` 이 분리해 준다.
 *
 * 근거가 모자라면 색을 지어내지 않고 `null` 을 돌려준다. 호출부는 중립색으로
 * 떨어진다.
 */

import {
  DEFAULT_SEGMENTATION,
  fillOuterBackground,
  segmentRacketPhoto,
  type Rgba,
  type SegmentationOptions,
} from "./racket-photo-segmentation";

export type ExtractedColorway = {
  /** 후프 주색 */
  readonly primary: string;
  /** 스로트·손잡이 쪽으로 흐르는 보조색 */
  readonly secondary: string;
  /** 프레임으로 판정된 화소 비율. 품질 판단용 */
  readonly coverage: number;
};

export type ColorwayOptions = {
  readonly segmentation: SegmentationOptions;
  /** 채널당 양자화 비트. 5면 32단계 → 32,768 버킷 */
  readonly quantizeBits: number;
  /** 프레임 화소가 전체의 이 비율 미만이면 근거 부족으로 본다 */
  readonly minCoverage: number;
  /** 이 밝기 이상이면서 채도가 낮으면 배경 잔여물로 보고 버린다 */
  readonly highlightLuma: number;
  readonly highlightSaturation: number;
  /** 두 클러스터가 이 거리보다 가까우면 같은 색으로 본다 (0..441) */
  readonly clusterDistance: number;
};

export const DEFAULT_COLORWAY_OPTIONS: ColorwayOptions = {
  segmentation: DEFAULT_SEGMENTATION,
  quantizeBits: 5,
  minCoverage: 0.008,
  highlightLuma: 236,
  highlightSaturation: 22,
  clusterDistance: 70,
};

function luma(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

export function toHex(r: number, g: number, b: number): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
}

/** 같은 색을 더 어둡게. 보조색을 따로 못 찾았을 때 쓴다. */
export function darken(hex: string, factor: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return toHex(r * factor, g * factor, b * factor);
}

type Bucket = {
  /** 결정적 정렬을 위해 버킷 인덱스를 그대로 들고 다닌다 */
  readonly key: number;
  count: number;
  sumR: number;
  sumG: number;
  sumB: number;
};

function bucketCenter(bucket: Bucket): { r: number; g: number; b: number } {
  return {
    r: bucket.sumR / bucket.count,
    g: bucket.sumG / bucket.count,
    b: bucket.sumB / bucket.count,
  };
}

function distance(
  left: { r: number; g: number; b: number },
  right: { r: number; g: number; b: number },
): number {
  const dr = left.r - right.r;
  const dg = left.g - right.g;
  const db = left.b - right.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * 프레임 화소를 양자화해 빈도 상위 클러스터를 고른다.
 *
 * Map 의 삽입 순서에 기대지 않고 (count 내림차순, 버킷 키 오름차순) 으로
 * 정렬한다. 같은 사진이면 항상 같은 순서가 나와야 하기 때문이다.
 */
export function dominantClusters(
  pixels: readonly { r: number; g: number; b: number }[],
  options: ColorwayOptions = DEFAULT_COLORWAY_OPTIONS,
): { r: number; g: number; b: number; count: number }[] {
  const shift = 8 - options.quantizeBits;
  const levels = 1 << options.quantizeBits;
  const buckets = new Map<number, Bucket>();

  for (const { r, g, b } of pixels) {
    const key =
      ((r >> shift) * levels + (g >> shift)) * levels + (b >> shift);
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      existing.sumR += r;
      existing.sumG += g;
      existing.sumB += b;
    } else {
      buckets.set(key, { key, count: 1, sumR: r, sumG: g, sumB: b });
    }
  }

  const ordered = [...buckets.values()].sort(
    (left, right) => right.count - left.count || left.key - right.key,
  );

  const clusters: { r: number; g: number; b: number; count: number }[] = [];
  for (const bucket of ordered) {
    const center = bucketCenter(bucket);
    const near = clusters.find(
      (cluster) => distance(cluster, center) < options.clusterDistance,
    );
    if (near) {
      // 가까운 색은 이미 뽑은 클러스터에 흡수시킨다.
      near.count += bucket.count;
      continue;
    }
    clusters.push({ ...center, count: bucket.count });
    if (clusters.length >= 4) break;
  }

  return clusters;
}

/**
 * 실루엣 안쪽에서 스트링과 그립을 뺀 화소를 모은다.
 *
 * 밝고 채도 낮은 화소는 배경 잔여물이나 반사광이라 버린다. 어두운 화소는
 * 버리지 않는다 — 검은 프레임이 실제로 많다.
 */
export function collectFramePixels(
  image: Rgba,
  options: ColorwayOptions = DEFAULT_COLORWAY_OPTIONS,
): { r: number; g: number; b: number }[] {
  const outside = fillOuterBackground(image, options.segmentation);
  const segmentation = segmentRacketPhoto(image, options.segmentation);
  const { width, height, channels, data } = image;
  const pixels: { r: number; g: number; b: number }[] = [];

  for (let index = 0; index < width * height; index += 1) {
    if (outside[index]) continue;
    if (segmentation.bedMask[index]) continue;
    if (segmentation.gripMask[index]) continue;

    const offset = index * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    if (channels === 4 && data[offset + 3] < 128) continue;

    if (
      luma(r, g, b) >= options.highlightLuma
      && saturation(r, g, b) <= options.highlightSaturation
    ) {
      continue;
    }

    pixels.push({ r, g, b });
  }

  return pixels;
}

export function extractColorway(
  image: Rgba,
  options: ColorwayOptions = DEFAULT_COLORWAY_OPTIONS,
): ExtractedColorway | null {
  const pixels = collectFramePixels(image, options);
  const coverage = pixels.length / (image.width * image.height);
  if (coverage < options.minCoverage) return null;

  const clusters = dominantClusters(pixels, options);
  if (clusters.length === 0) return null;

  const [first, ...rest] = clusters;
  const primary = toHex(first.r, first.g, first.b);

  // 보조색은 주색과 충분히 다른 다음 클러스터. 없으면 주색을 어둡게 쓴다.
  // 억지로 다른 색을 만들어 붙이지 않는다.
  const alternative = rest.find(
    (cluster) => distance(cluster, first) >= options.clusterDistance,
  );
  const secondary = alternative
    ? toHex(alternative.r, alternative.g, alternative.b)
    : darken(primary, 0.62);

  return { primary, secondary, coverage };
}
